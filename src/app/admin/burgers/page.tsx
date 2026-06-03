import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, ChevronRight, CalendarCheck, FileText, Mail, Phone } from "lucide-react";

export default async function AdminBurgersPage({
  searchParams,
}: {
  searchParams: Promise<{ voornaam?: string; achternaam?: string; geboortedatum?: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) redirect("/inloggen");

  const { voornaam, achternaam, geboortedatum } = await searchParams;

  const hasQuery = voornaam || achternaam || geboortedatum;

  // Only query when the admin searched for something
  const users = hasQuery
    ? await db.user.findMany({
        where: {
          role: "CITIZEN",
          ...(voornaam && {
            firstName: { contains: voornaam },
          }),
          ...(achternaam && {
            lastName: { contains: achternaam },
          }),
          ...(geboortedatum && {
            dateOfBirth: { contains: geboortedatum },
          }),
        },
        include: {
          _count: { select: { appointments: true, documents: true } },
          familyMembers: {
            where: voornaam || achternaam
              ? {
                  OR: [
                    ...(voornaam ? [{ firstName: { contains: voornaam } }] : []),
                    ...(achternaam ? [{ lastName: { contains: achternaam } }] : []),
                  ],
                }
              : undefined,
          },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        take: 50,
      })
    : [];

  // Also search family members separately to find users via their relatives
  const familyMatches =
    hasQuery && (voornaam || achternaam)
      ? await db.familyMember.findMany({
          where: {
            OR: [
              ...(voornaam ? [{ firstName: { contains: voornaam } }] : []),
              ...(achternaam ? [{ lastName: { contains: achternaam } }] : []),
            ],
          },
          include: {
            user: {
              include: {
                _count: { select: { appointments: true, documents: true } },
              },
            },
          },
          take: 20,
        })
      : [];

  // Remove family matches where the user is already in direct results
  const directUserIds = new Set(users.map((u) => u.id));
  const extraFromFamily = familyMatches.filter(
    (fm) => !directUserIds.has(fm.user.id)
  );

  const totalResults = users.length + extraFromFamily.length;

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy px-8 py-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-medium text-white">Burgerdossiers</h1>
            <p className="text-white/40 text-sm">
              {hasQuery
                ? `${totalResults} resultaat${totalResults !== 1 ? "en" : ""} gevonden`
                : "Zoek op naam of geboortedatum"}
            </p>
          </div>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">

        {/* Search form */}
        <form method="GET" className="bg-white rounded-2xl ring-1 ring-stone/40 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Voornaam</label>
              <input
                name="voornaam"
                defaultValue={voornaam ?? ""}
                className="form-input"
                placeholder="bijv. Hagos"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="form-label">Achternaam</label>
              <input
                name="achternaam"
                defaultValue={achternaam ?? ""}
                className="form-input"
                placeholder="bijv. Tesfai"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="form-label">Geboortedatum</label>
              <input
                name="geboortedatum"
                type="date"
                defaultValue={geboortedatum ?? ""}
                className="form-input"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              className="btn-red flex items-center gap-2"
            >
              <Search size={16} /> Zoeken
            </button>
            {hasQuery && (
              <Link href="/admin/burgers" className="text-sm text-warm-gray hover:text-charcoal">
                Wissen
              </Link>
            )}
          </div>
        </form>

        {/* Empty state — no search yet */}
        {!hasQuery && (
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-14 text-center">
            <Search size={36} className="mx-auto text-warm-gray/25 mb-4" />
            <p className="text-warm-gray font-medium">Vul een naam of geboortedatum in om een burger te zoeken</p>
            <p className="text-warm-gray/60 text-sm mt-1">
              U kunt ook op een familielid zoeken om de juiste persoon te vinden
            </p>
          </div>
        )}

        {/* No results */}
        {hasQuery && totalResults === 0 && (
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-10 text-center">
            <p className="text-warm-gray font-medium">Geen burgers gevonden</p>
            <p className="text-warm-gray/60 text-sm mt-1">Probeer een andere naam of geboortedatum</p>
          </div>
        )}

        {/* Direct results */}
        {users.length > 0 && (
          <div className="space-y-2">
            {users.map((user) => (
              <UserResultCard
                key={user.id}
                user={user}
                appointmentsCount={user._count.appointments}
                documentsCount={user._count.documents}
              />
            ))}
          </div>
        )}

        {/* Family match results */}
        {extraFromFamily.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray/60 mb-2 px-1">
              Gevonden via familielid
            </p>
            <div className="space-y-2">
              {extraFromFamily.map((fm) => (
                <UserResultCard
                  key={fm.user.id}
                  user={fm.user}
                  appointmentsCount={fm.user._count.appointments}
                  documentsCount={fm.user._count.documents}
                  viaFamily={`${fm.firstName} ${fm.lastName} (${fm.relationship})`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserResultCard({
  user,
  appointmentsCount,
  documentsCount,
  viaFamily,
}: {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    dateOfBirth: string | null;
    eritreanIdNumber: string | null;
  };
  appointmentsCount: number;
  documentsCount: number;
  viaFamily?: string;
}) {
  return (
    <Link
      href={`/admin/burgers/${user.id}`}
      className="flex items-center gap-4 bg-white rounded-2xl ring-1 ring-stone/40 p-5 hover:ring-eritrea-blue/40 hover:-translate-y-0.5 transition-all group"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-eritrea-blue/10 text-eritrea-blue flex items-center justify-center text-base font-display font-bold shrink-0">
        {user.firstName[0]}{user.lastName[0]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-display font-semibold text-charcoal">
            {user.firstName} {user.lastName}
          </p>
          {viaFamily && (
            <span className="text-xs bg-eritrea-gold/15 text-eritrea-gold-dark px-2 py-0.5 rounded-full font-medium">
              via {viaFamily}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-warm-gray flex-wrap">
          <span className="flex items-center gap-1"><Mail size={11} /> {user.email}</span>
          {user.phone && <span className="flex items-center gap-1"><Phone size={11} /> {user.phone}</span>}
          {user.dateOfBirth && <span>geb. {user.dateOfBirth}</span>}
          {user.eritreanIdNumber && <span className="font-mono">ID: {user.eritreanIdNumber}</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 shrink-0 text-xs text-warm-gray">
        <span className="flex items-center gap-1.5">
          <CalendarCheck size={13} className="text-eritrea-blue" /> {appointmentsCount}
        </span>
        <span className="flex items-center gap-1.5">
          <FileText size={13} className="text-eritrea-gold-dark" /> {documentsCount}
        </span>
      </div>

      <ChevronRight size={16} className="text-warm-gray/40 group-hover:text-eritrea-blue transition-colors shrink-0" />
    </Link>
  );
}
