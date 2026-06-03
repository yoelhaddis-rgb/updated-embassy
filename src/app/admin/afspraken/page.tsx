import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { DayAccordion } from "./DayAccordion";
import { DateRangeFilter } from "./DateRangeFilter";

export const dynamic = "force-dynamic";

export default async function AdminAfsprakenPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) redirect("/inloggen");

  const { from, to } = await searchParams;
  const today = new Date().toISOString().split("T")[0];

  const dateFilter: { gte?: string; lte?: string } = {};
  if (from || !to) dateFilter.gte = from ?? today;
  if (to) dateFilter.lte = to;

  const appointments = await db.appointment.findMany({
    where: {
      date: dateFilter,
      status: { in: ["CONFIRMED", "ATTENDED", "NO_SHOW"] },
    },
    include: {
      user: {
        select: { firstName: true, lastName: true, phone: true },
      },
    },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
  });

  const groupsMap = new Map<string, typeof appointments>();
  for (const appt of appointments) {
    if (!groupsMap.has(appt.date)) groupsMap.set(appt.date, []);
    groupsMap.get(appt.date)!.push(appt);
  }

  const groups = Array.from(groupsMap.entries()).map(([date, appts]) => ({
    date,
    formattedDate: new Date(date + "T12:00:00").toLocaleDateString("nl-NL", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }),
    appointments: appts,
  }));

  const totalCount = appointments.length;
  const isFiltered = !!(from || to);

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy px-8 py-5">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-white/50 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="font-display text-2xl font-medium text-white">Alle afspraken</h1>
                <p className="text-white/40 text-sm">
                  {totalCount} afspraken · {groups.length} dag{groups.length !== 1 ? "en" : ""}
                  {isFiltered && " · gefilterd"}
                </p>
              </div>
            </div>
            <a
              href="/api/admin/export"
              className="flex items-center gap-2 bg-eritrea-blue/20 hover:bg-eritrea-blue/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
            >
              <Download size={15} /> CSV
            </a>
          </div>
          <DateRangeFilter from={from ?? ""} to={to ?? ""} />
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-4xl mx-auto px-8 py-8">
        <DayAccordion groups={groups} defaultOpenDate={today} />
      </div>
    </div>
  );
}
