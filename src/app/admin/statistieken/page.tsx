import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingDown, Clock, CalendarCheck } from "lucide-react";

export const dynamic = "force-dynamic";

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `W${weekNum}`;
}

function getWeekStart(offsetWeeks: number): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 - offsetWeeks * 7);
  return d.toISOString().split("T")[0];
}

export default async function StatistiekenPage() {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) redirect("/inloggen");

  const eightWeeksAgo = getWeekStart(7);
  const today = new Date().toISOString().split("T")[0];

  const recentAppointments = await db.appointment.findMany({
    where: {
      date: { gte: eightWeeksAgo, lte: today },
      status: { in: ["CONFIRMED", "ATTENDED", "NO_SHOW"] },
    },
    select: { date: true, status: true, serviceTitle: true, timeSlot: true },
  });

  // Appointments per week
  const weekCounts = new Map<string, number>();
  for (const appt of recentAppointments) {
    const label = getWeekLabel(appt.date);
    weekCounts.set(label, (weekCounts.get(label) ?? 0) + 1);
  }

  const weekLabels: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const label = getWeekLabel(getWeekStart(i));
    if (!weekLabels.includes(label)) weekLabels.push(label);
  }
  const weekData = weekLabels.map(label => ({ label, count: weekCounts.get(label) ?? 0 }));
  const maxWeekCount = Math.max(...weekData.map(w => w.count), 1);

  // No-show rate
  const attended = recentAppointments.filter(a => a.status === "ATTENDED").length;
  const noShow = recentAppointments.filter(a => a.status === "NO_SHOW").length;
  const noShowDenominator = attended + noShow;
  const noShowRate = noShowDenominator > 0 ? Math.round((noShow / noShowDenominator) * 100) : 0;

  // Top 5 services
  const serviceCounts = new Map<string, number>();
  for (const appt of recentAppointments) {
    serviceCounts.set(appt.serviceTitle, (serviceCounts.get(appt.serviceTitle) ?? 0) + 1);
  }
  const topServices = Array.from(serviceCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxServiceCount = Math.max(...topServices.map(s => s[1]), 1);

  // Top 5 time slots
  const slotCounts = new Map<string, number>();
  for (const appt of recentAppointments) {
    slotCounts.set(appt.timeSlot, (slotCounts.get(appt.timeSlot) ?? 0) + 1);
  }
  const topSlots = Array.from(slotCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxSlotCount = Math.max(...topSlots.map(s => s[1]), 1);

  // Totals
  const totalThisMonth = recentAppointments.filter(a => a.date >= today.slice(0, 7)).length;
  const allTimeCount = await db.appointment.count({
    where: { status: { in: ["CONFIRMED", "ATTENDED", "NO_SHOW"] } },
  });

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy px-8 py-6">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/admin" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-medium text-white">Statistieken</h1>
            <p className="text-white/40 text-sm">Afgelopen 8 weken</p>
          </div>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Totaal (ooit)",    value: allTimeCount,              icon: CalendarCheck,  color: "text-eritrea-blue",      bg: "bg-eritrea-blue/8" },
            { label: "Deze maand",        value: totalThisMonth,            icon: CalendarCheck,  color: "text-eritrea-green",     bg: "bg-eritrea-green/8" },
            { label: "No-show rate",      value: `${noShowRate}%`,          icon: TrendingDown,   color: "text-eritrea-red",       bg: "bg-eritrea-red/8" },
            { label: "Afgelopen 8 wk",   value: recentAppointments.length, icon: BarChart3,      color: "text-eritrea-gold-dark", bg: "bg-eritrea-gold/15" },
          ].map(card => (
            <div key={card.label} className={`${card.bg} rounded-2xl p-5 flex flex-col gap-2`}>
              <card.icon size={18} className={card.color} />
              <p className={`text-2xl font-display font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-warm-gray">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Afspraken per week — bar chart */}
        <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-6">
          <h2 className="font-display font-medium text-charcoal text-lg mb-6">Afspraken per week</h2>
          <div className="flex items-end gap-2 h-32">
            {weekData.map(week => (
              <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-warm-gray font-medium">{week.count || ""}</span>
                <div
                  className="w-full bg-eritrea-blue rounded-t transition-all"
                  style={{ height: `${Math.max((week.count / maxWeekCount) * 100, week.count > 0 ? 4 : 0)}%` }}
                  title={`${week.label}: ${week.count} afspraken`}
                />
                <span className="text-[10px] text-warm-gray/70">{week.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Top services */}
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-6">
            <h2 className="font-display font-medium text-charcoal text-lg mb-5 flex items-center gap-2">
              <CalendarCheck size={16} className="text-eritrea-gold-dark" /> Drukste diensten
            </h2>
            {topServices.length === 0 ? (
              <p className="text-warm-gray text-sm">Geen data beschikbaar</p>
            ) : (
              <div className="space-y-3">
                {topServices.map(([title, count]) => (
                  <div key={title}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-charcoal truncate pr-2">{title}</span>
                      <span className="font-semibold text-eritrea-gold-dark shrink-0">{count}</span>
                    </div>
                    <div className="h-2 bg-stone/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-eritrea-gold/60 rounded-full"
                        style={{ width: `${(count / maxServiceCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top time slots */}
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-6">
            <h2 className="font-display font-medium text-charcoal text-lg mb-5 flex items-center gap-2">
              <Clock size={16} className="text-eritrea-blue" /> Drukste tijdsloten
            </h2>
            {topSlots.length === 0 ? (
              <p className="text-warm-gray text-sm">Geen data beschikbaar</p>
            ) : (
              <div className="space-y-3">
                {topSlots.map(([slot, count]) => (
                  <div key={slot}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-charcoal font-mono">{slot} uur</span>
                      <span className="font-semibold text-eritrea-blue">{count}</span>
                    </div>
                    <div className="h-2 bg-stone/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-eritrea-blue/50 rounded-full"
                        style={{ width: `${(count / maxSlotCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
