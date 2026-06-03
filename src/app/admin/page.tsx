import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import {
  CalendarCheck, Users, Settings,
  Clock, CheckCircle, ChevronRight, LogOut,
  BarChart3, UserCheck, Newspaper, Printer, Megaphone,
} from "lucide-react";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    redirect("/inloggen");
  }

  // Today's date
  const today = new Date().toISOString().split("T")[0];

  const [
    todayAppointments,
    totalUsers,
    totalAppointments,
    pendingToday,
  ] = await Promise.all([
    db.appointment.findMany({
      where: { date: today, status: "CONFIRMED" },
      include: { user: { select: { firstName: true, lastName: true, phone: true, email: true } } },
      orderBy: { timeSlot: "asc" },
    }),
    db.user.count({ where: { role: "CITIZEN" } }),
    db.appointment.count({ where: { status: "CONFIRMED" } }),
    db.appointment.count({ where: { date: today, status: "CONFIRMED" } }),
  ]);

  const upcomingDays: { date: string; count: number }[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      const dateStr = d.toISOString().split("T")[0];
      const count = await db.appointment.count({ where: { date: dateStr, status: "CONFIRMED" } });
      upcomingDays.push({ date: dateStr, count });
    }
  }

  return (
    <div className="bg-ivory min-h-screen">
      {/* Header */}
      <div className="bg-navy">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flag-bar w-8 rounded-sm overflow-hidden h-1.5">
                <div className="flex h-full">
                  <div className="flex-1 bg-eritrea-green" />
                  <div className="flex-1 bg-eritrea-blue" />
                  <div className="flex-1 bg-eritrea-red" />
                </div>
              </div>
              <span className="text-eritrea-gold text-xs font-semibold tracking-widest uppercase">Medewerkerportaal</span>
            </div>
            <h1 className="font-display text-2xl font-medium text-white">
              Goedendag, {session.firstName}
            </h1>
            <p className="text-white/40 text-sm mt-0.5">
              {new Date().toLocaleDateString("nl-NL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {session.role === "ADMIN" && (
              <Link href="/admin/medewerkers" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
                <Settings size={16} /> Beheer
              </Link>
            )}
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
                <LogOut size={16} /> Uitloggen
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="eritrea-line" />

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: CalendarCheck, label: "Vandaag", value: pendingToday, color: "text-eritrea-blue", bg: "bg-eritrea-blue/8" },
            { icon: BarChart3, label: "Totaal afspraken", value: totalAppointments, color: "text-eritrea-green", bg: "bg-eritrea-green/8" },
            { icon: Users, label: "Burgers", value: totalUsers, color: "text-eritrea-gold-dark", bg: "bg-eritrea-gold/10" },
            { icon: UserCheck, label: "Actief vandaag", value: todayAppointments.length, color: "text-eritrea-red", bg: "bg-eritrea-red/8" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl ring-1 ring-stone/40 p-5 flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon size={20} strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-2xl font-display font-medium text-charcoal">{stat.value}</div>
                <div className="text-xs text-warm-gray mt-0.5">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's schedule */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-medium text-charcoal text-xl">Agenda vandaag</h2>
              <Link href="/admin/afspraken" className="text-eritrea-blue text-sm font-medium hover:underline flex items-center gap-1">
                Alle afspraken <ChevronRight size={14} />
              </Link>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-10 text-center">
                <CalendarCheck size={36} className="mx-auto text-warm-gray/25 mb-3" />
                <p className="text-warm-gray">Geen afspraken vandaag</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map(appt => (
                  <div key={appt.id} className="bg-white rounded-2xl ring-1 ring-stone/40 p-5 flex items-center gap-5">
                    {/* Time */}
                    <div className="text-center shrink-0 w-14">
                      <div className="text-eritrea-blue font-display font-bold text-lg leading-none">{appt.timeSlot}</div>
                      <div className="text-[10px] text-warm-gray mt-1">uur</div>
                    </div>
                    <div className="w-px h-12 bg-stone/60 shrink-0" />
                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-display font-medium text-charcoal">{appt.user.firstName} {appt.user.lastName}</p>
                      <p className="text-eritrea-blue text-sm mt-0.5">{appt.serviceTitle}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-warm-gray">
                        <span>{appt.user.email}</span>
                        {appt.user.phone && <span>{appt.user.phone}</span>}
                      </div>
                    </div>
                    {/* Status */}
                    <div className="flex items-center gap-1.5 text-eritrea-green text-xs font-medium shrink-0">
                      <CheckCircle size={14} /> Bevestigd
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Upcoming days */}
            <div>
              <h2 className="font-display font-medium text-charcoal text-xl mb-4">Komende dagen</h2>
              <div className="bg-white rounded-2xl ring-1 ring-stone/40 divide-y divide-stone/30">
                {upcomingDays.map(day => (
                  <div key={day.date} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-charcoal capitalize">
                        {new Date(day.date + "T12:00:00").toLocaleDateString("nl-NL", { weekday: "long" })}
                      </p>
                      <p className="text-xs text-warm-gray">
                        {new Date(day.date + "T12:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}
                      </p>
                    </div>
                    <div className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${day.count > 0 ? "bg-eritrea-blue/10 text-eritrea-blue" : "bg-parchment text-warm-gray/50"}`}>
                      {day.count} afspraken
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h2 className="font-display font-medium text-charcoal text-xl mb-4">Snel navigeren</h2>
              <div className="space-y-2">
                {[
                  { href: "/admin/afspraken", icon: CalendarCheck, label: "Alle afspraken", color: "text-eritrea-blue" },
                  { href: "/admin/statistieken", icon: BarChart3, label: "Statistieken", color: "text-eritrea-green" },
                  { href: `/admin/dagschema?date=${today}`, icon: Printer, label: "Dagschema afdrukken", color: "text-eritrea-gold-dark" },
                  { href: "/admin/burgers", icon: Users, label: "Burgerdossiers", color: "text-eritrea-green" },
                  ...(session.role === "ADMIN" ? [
                    { href: "/admin/nieuws", icon: Newspaper, label: "Nieuws beheren", color: "text-eritrea-blue" },
                    { href: "/admin/medewerkers", icon: Settings, label: "Medewerkers beheren", color: "text-eritrea-red" },
                    { href: "/admin/instellingen", icon: Megaphone, label: "Site-instellingen", color: "text-eritrea-gold-dark" },
                  ] : []),
                ].map(link => (
                  <Link key={link.href} href={link.href} className="flex items-center gap-3 p-4 bg-white rounded-xl ring-1 ring-stone/40 hover:-translate-y-0.5 transition-all">
                    <link.icon size={18} className={link.color} />
                    <span className="text-sm font-medium text-charcoal">{link.label}</span>
                    <ChevronRight size={14} className="ml-auto text-warm-gray/40" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
