# Admin Improvements, Stats & Digest — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the admin experience with a redesigned afspraken accordion view, stats dashboard, morning digest email, next-available-slot indicator on the booking page, and contact page design token fixes.

**Architecture:** Five independent tasks sharing the existing Next.js 16 App Router + Prisma/SQLite + nodemailer stack. No new dependencies. Three new pages/routes, two new client components, one new email function, one minor page edit, one trivial token fix.

**Tech Stack:** Next.js 16 App Router, Prisma ORM (sqlite), nodemailer (Ethereal fallback), Tailwind CSS, lucide-react.

---

## Context: key facts

- **Project root:** `/Users/yh/Downloads/eritrean-embassy-ambassade`
- **Design tokens in use:** `bg-parchment`, `bg-ivory`, `text-warm-gray`, `text-charcoal`, `ring-stone/40`, `text-eritrea-blue/green/red/gold-dark`, `bg-navy`
- **Working days:** Monday–Thursday only (embassy is closed Fri/Sat/Sun)
- **Max slots per day:** 12 (slots: 09:00–14:30 in 30-min intervals, defined in `AppointmentWizard.tsx`)
- **Email sender:** `src/lib/email.ts` — nodemailer, Ethereal fallback when no `SMTP_HOST`
- **Admin nav links array:** `src/app/admin/page.tsx` lines ~183–189
- **Walk-in system user:** `walkin@ambassade.internal` (appointments with `walkIn: true`)
- **Cron pattern:** See `src/app/api/cron/reminders/route.ts` — protected by `CRON_SECRET` env var

---

## Task 1: Fix contact page design tokens

**Files:**
- Modify: `src/app/contact/page.tsx`

The contact page uses raw Tailwind gray classes instead of the project's design tokens.

- [ ] **Step 1: Replace all gray tokens**

Read `src/app/contact/page.tsx`. Apply these replacements throughout the entire file:

| Old | New |
|-----|-----|
| `bg-gray-50` | `bg-parchment/60` |
| `hover:bg-gray-100` | `hover:bg-parchment` |
| `bg-gray-100` | `bg-stone/20` |
| `text-gray-600` | `text-warm-gray` |
| `border-gray-100` | `ring-1 ring-stone/30` (if used on a div, add `ring-1` too; if already inside `border` shorthand, use `border-stone/30`) |
| `shadow-sm` | keep as-is (this is fine) |

Also update headings: any `font-bold text-navy` heading → `font-display font-medium text-navy` for consistency with the rest of the site.

Specifically, in the contact page there is a `<h2>Contactgegevens</h2>` — change its className from `text-2xl font-bold text-navy mb-6` to `font-display text-2xl font-medium text-navy mb-6`.

- [ ] **Step 2: Verify visually**

Navigate to `http://localhost:3001/contact` — the info cards should use the warm parchment background instead of cold gray. The text should match the cream tone of the rest of the site.

- [ ] **Step 3: Commit**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && git add src/app/contact/page.tsx && git commit -m "fix: replace gray design tokens with project tokens on contact page"
```

---

## Task 2: Morning digest email + cron route

**Files:**
- Modify: `src/lib/email.ts` (add `sendMorningDigest`)
- Create: `src/app/api/cron/morning-digest/route.ts`

Staff receive an automated email at 08:00 with the full day's appointment list. Call the cron route daily via a scheduler (e.g. cron-job.org pointing at `GET /api/cron/morning-digest?secret=...`).

- [ ] **Step 1: Add `sendMorningDigest` to `src/lib/email.ts`**

Read `src/lib/email.ts` to understand the existing pattern (nodemailer transporter, `detailRow` helper, `FROM_ADDRESS`). Then add this function at the end of the file, before the closing:

```ts
export async function sendMorningDigest(params: {
  to: string;
  staffName: string;
  date: string;           // "2026-06-04"
  formattedDate: string;  // "woensdag 4 juni 2026"
  appointments: Array<{
    timeSlot: string;
    serviceTitle: string;
    userName: string;      // "Abraham Tesfamariam" or "Inloper"
    phone: string | null;
    walkIn: boolean;
  }>;
}): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const transporter = await getTransporter();

    const rowsHtml = params.appointments.map(appt => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5dece;font-size:13px;font-weight:600;color:#2d5fa6;width:56px;">${appt.timeSlot}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5dece;font-size:13px;color:#2c2c2c;">
          ${appt.walkIn ? `<em style="color:#8a8a8a;">Inloper${appt.phone ? ` · ${appt.phone}` : ""}</em>` : `${appt.userName}${appt.phone ? `<br/><span style="font-size:11px;color:#8a8a8a;">${appt.phone}</span>` : ""}`}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5dece;font-size:12px;color:#5a5a5a;">${appt.serviceTitle}</td>
      </tr>
    `).join("");

    const html = `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/><title>Dagschema ${params.formattedDate}</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#1a2744;border-radius:16px 16px 0 0;padding:28px 40px;">
            <table width="80" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
              <tr>
                <td width="27" height="5" style="background:#4d9e4d;border-radius:2px 0 0 2px;"></td>
                <td width="27" height="5" style="background:#2d5fa6;"></td>
                <td width="27" height="5" style="background:#c0392b;border-radius:0 2px 2px 0;"></td>
              </tr>
            </table>
            <h1 style="color:#ffffff;font-size:18px;font-weight:600;margin:0 0 4px;">Dagschema – ${params.formattedDate}</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">${params.appointments.length} afspraken vandaag · Eritrese Ambassade Den Haag</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <thead>
                <tr style="background:#f9f5ed;">
                  <th style="padding:8px 12px;text-align:left;font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5dece;">Tijd</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5dece;">Naam</th>
                  <th style="padding:8px 12px;text-align:left;font-size:11px;color:#8a8a8a;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5dece;">Dienst</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || `<tr><td colspan="3" style="padding:20px 12px;text-align:center;color:#8a8a8a;font-size:13px;">Geen afspraken vandaag.</td></tr>`}
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f5f0e8;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #e5dece;">
            <p style="color:#aaa;font-size:12px;margin:0;">Eritrese Ambassade · Javastraat 58 · 2585 AR Den Haag</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Dagschema ${params.formattedDate} – ${params.appointments.length} afspraken`,
      html,
      text: `Dagschema ${params.formattedDate}\n\n${params.appointments.map(a => `${a.timeSlot}  ${a.walkIn ? "Inloper" : a.userName}  ${a.serviceTitle}`).join("\n")}\n\nEritrese Ambassade Den Haag`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("📧 Morning digest preview URL:", previewUrl);
    return { success: true, previewUrl: previewUrl || undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Morning digest email fout:", message);
    return { success: false, error: message };
  }
}
```

- [ ] **Step 2: Create `src/app/api/cron/morning-digest/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMorningDigest } from "@/lib/email";

// GET /api/cron/morning-digest?secret=...
// Call daily at 08:00 via a scheduler (e.g. cron-job.org).
// Sends today's appointment list to all STAFF and ADMIN users.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const formattedDate = new Date(today + "T12:00:00").toLocaleDateString("nl-NL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Get today's appointments (all non-cancelled)
  const appointments = await db.appointment.findMany({
    where: { date: today, status: { in: ["CONFIRMED", "ATTENDED", "NO_SHOW"] } },
    include: { user: { select: { firstName: true, lastName: true, phone: true } } },
    orderBy: { timeSlot: "asc" },
  });

  // Get all staff/admin users to send digest to
  const staffUsers = await db.user.findMany({
    where: { role: { in: ["STAFF", "ADMIN"] } },
    select: { email: true, firstName: true },
  });

  // Don't send digest to the walk-in system account
  const realStaff = staffUsers.filter(u => u.email !== "walkin@ambassade.internal");

  if (realStaff.length === 0) {
    return NextResponse.json({ message: "Geen medewerkers gevonden", sent: 0 });
  }

  const apptList = appointments.map(a => ({
    timeSlot: a.timeSlot,
    serviceTitle: a.serviceTitle,
    userName: `${a.user.firstName} ${a.user.lastName}`,
    phone: a.user.phone,
    walkIn: a.walkIn,
  }));

  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const staff of realStaff) {
    const result = await sendMorningDigest({
      to: staff.email,
      staffName: staff.firstName,
      date: today,
      formattedDate,
      appointments: apptList,
    });
    results.push({ email: staff.email, success: result.success, error: result.error });
  }

  const sent = results.filter(r => r.success).length;
  console.log(`📧 Morning digest: ${sent}/${realStaff.length} verstuurd voor ${today}`);

  return NextResponse.json({ date: today, total: appointments.length, sent, results });
}
```

- [ ] **Step 3: Verify**

Start the dev server if not running:
```bash
nohup /bin/bash -c "cd /Users/yh/Downloads/eritrean-embassy-ambassade && npx next dev -p 3001" > /tmp/embassy-dev.log 2>&1 &
sleep 4 && tail -5 /tmp/embassy-dev.log
```

Call the cron endpoint (no CRON_SECRET set in dev, so no auth needed):
```bash
curl "http://localhost:3001/api/cron/morning-digest" 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Response received"
```

Expected: JSON with `sent: N` where N ≥ 1. Check server log for the Ethereal preview URL.

- [ ] **Step 4: Commit**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && git add src/lib/email.ts src/app/api/cron/morning-digest/route.ts && git commit -m "feat: add morning digest email and cron route"
```

---

## Task 3: Next available slot on booking page

**Files:**
- Modify: `src/app/afspraken/page.tsx`

Show a small banner above the booking wizard: "Vroegst beschikbaar: maandag 8 juni 2026". Computed server-side by finding the first Mon–Thu with fewer than 12 CONFIRMED appointments.

- [ ] **Step 1: Add the next-available-date query**

Read `src/app/afspraken/page.tsx`. Add this computation inside the `AfsprakenPage` async function, after the existing `Promise.all` call. Add a new import for `CalendarCheck` from lucide-react (check if it's already imported):

```ts
  // Find the next available booking date
  const MAX_SLOTS_PER_DAY = 12;
  const todayDate = new Date();
  const workingDays: string[] = [];
  const tempDate = new Date(todayDate);
  while (workingDays.length < 60) {
    const dow = tempDate.getDay(); // 0=Sun,1=Mon,...,5=Fri,6=Sat
    if (dow >= 1 && dow <= 4) {   // Mon–Thu only
      workingDays.push(tempDate.toISOString().split("T")[0]);
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }

  const bookedCounts = await db.appointment.groupBy({
    by: ["date"],
    where: {
      date: { in: workingDays },
      status: "CONFIRMED",
    },
    _count: { id: true },
  });

  const bookedByDate = new Map(bookedCounts.map(r => [r.date, r._count.id]));
  const nextAvailableDate = workingDays.find(d => (bookedByDate.get(d) ?? 0) < MAX_SLOTS_PER_DAY) ?? null;
  const nextAvailableFormatted = nextAvailableDate
    ? new Date(nextAvailableDate + "T12:00:00").toLocaleDateString("nl-NL", {
        weekday: "long", day: "numeric", month: "long",
      })
    : null;
```

- [ ] **Step 2: Add the banner in the JSX**

In the return JSX of `AfsprakenPage`, find where `<AppointmentWizard` is rendered. Add this banner immediately BEFORE the `<AppointmentWizard` tag:

```tsx
        {nextAvailableFormatted && (
          <div className="max-w-3xl mx-auto px-8 pb-4">
            <div className="bg-eritrea-green/8 border border-eritrea-green/20 rounded-xl px-4 py-3 text-sm text-charcoal/80 flex items-center gap-2.5">
              <CalendarCheck size={15} className="text-eritrea-green shrink-0" />
              <span>
                Vroegst beschikbare datum:{" "}
                <strong className="text-charcoal capitalize">{nextAvailableFormatted}</strong>
              </span>
            </div>
          </div>
        )}
```

Make sure `CalendarCheck` is imported from `lucide-react` at the top of the file. The existing imports include `Clock, FileText, AlertCircle` — add `CalendarCheck` to that list if not present.

- [ ] **Step 3: Verify**

Navigate to `http://localhost:3001/afspraken`. A green banner should appear above the wizard showing the next available date (e.g. "Vroegst beschikbare datum: maandag 9 juni 2026"). If all slots are wide open it should show today or tomorrow.

- [ ] **Step 4: Commit**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && git add src/app/afspraken/page.tsx && git commit -m "feat: show next available booking date on afspraken page"
```

---

## Task 4: Admin afspraken redesign — accordion, dossier links, date filter

**Files:**
- Create: `src/app/admin/afspraken/DayAccordion.tsx`
- Create: `src/app/admin/afspraken/DateRangeFilter.tsx`
- Modify: `src/app/admin/afspraken/page.tsx`

The current page is a flat table. Replace it with:
- A date range filter in the nav bar
- Appointments grouped by day in collapsible accordion sections
- Each day header shows date, count, first citizen names
- Each row shows citizen name (linked to dossier) + service + status
- Walk-ins show "Inloper" with no dossier link

- [ ] **Step 1: Create `src/app/admin/afspraken/DayAccordion.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ApptRow {
  id: string;
  userId: string;
  timeSlot: string;
  serviceTitle: string;
  status: string;
  notes: string | null;
  walkIn: boolean;
  user: { firstName: string; lastName: string; phone: string | null };
}

interface DayGroup {
  date: string;
  formattedDate: string;
  appointments: ApptRow[];
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: "Bevestigd",     color: "text-eritrea-blue" },
  ATTENDED:  { label: "Aanwezig",      color: "text-eritrea-green" },
  NO_SHOW:   { label: "Niet gekomen",  color: "text-eritrea-red" },
  CANCELLED: { label: "Geannuleerd",   color: "text-warm-gray/60" },
};

export function DayAccordion({
  groups,
  defaultOpenDate,
}: {
  groups: DayGroup[];
  defaultOpenDate?: string;
}) {
  const [openDates, setOpenDates] = useState<Set<string>>(
    new Set(defaultOpenDate ? [defaultOpenDate] : groups[0] ? [groups[0].date] : [])
  );

  const toggle = (date: string) => {
    setOpenDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-10 text-center text-warm-gray">
        Geen afspraken gevonden voor deze periode.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map(group => {
        const isOpen = openDates.has(group.date);
        const previewNames = group.appointments
          .filter(a => !a.walkIn)
          .slice(0, 3)
          .map(a => `${a.user.firstName} ${a.user.lastName[0] ?? ""}.`);
        const walkInCount = group.appointments.filter(a => a.walkIn).length;
        const extraCount = group.appointments.length - 3;

        return (
          <div key={group.date} className="bg-white rounded-2xl ring-1 ring-stone/40 overflow-hidden">
            {/* Accordion header */}
            <button
              onClick={() => toggle(group.date)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-parchment/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {isOpen
                  ? <ChevronDown size={15} className="text-warm-gray shrink-0" />
                  : <ChevronRight size={15} className="text-warm-gray shrink-0" />}
                <div>
                  <p className="font-display font-semibold text-charcoal capitalize text-sm">
                    {group.formattedDate}
                  </p>
                  <p className="text-xs text-warm-gray mt-0.5">
                    {group.appointments.length} afspra{group.appointments.length === 1 ? "ak" : "ken"}
                    {walkInCount > 0 && ` · ${walkInCount} inloper${walkInCount > 1 ? "s" : ""}`}
                    {previewNames.length > 0 && (
                      <span className="ml-1">
                        · {previewNames.join(", ")}
                        {extraCount > 0 && ` +${extraCount}`}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Link
                href={`/admin/dagschema?date=${group.date}`}
                onClick={e => e.stopPropagation()}
                className="text-xs text-eritrea-blue hover:underline shrink-0 ml-4 no-underline"
              >
                Dagschema →
              </Link>
            </button>

            {/* Expanded rows */}
            {isOpen && (
              <div className="border-t border-stone/30">
                <table className="w-full">
                  <tbody className="divide-y divide-stone/20">
                    {group.appointments.map(appt => {
                      const sc = STATUS_STYLE[appt.status] ?? { label: appt.status, color: "text-warm-gray" };
                      return (
                        <tr key={appt.id} className="hover:bg-parchment/20 transition-colors">
                          {/* Time */}
                          <td className="px-6 py-3 w-16">
                            <span className="font-bold text-eritrea-blue text-sm">{appt.timeSlot}</span>
                          </td>
                          {/* Citizen */}
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-eritrea-blue/10 text-eritrea-blue flex items-center justify-center text-xs font-bold shrink-0">
                                {appt.walkIn
                                  ? "?"
                                  : `${appt.user.firstName[0] ?? ""}${appt.user.lastName[0] ?? ""}`}
                              </div>
                              <div>
                                {appt.walkIn ? (
                                  <p className="text-sm text-warm-gray italic">
                                    Inloper{appt.notes ? ` — ${appt.notes}` : ""}
                                  </p>
                                ) : (
                                  <Link
                                    href={`/admin/burgers/${appt.userId}`}
                                    className="text-sm font-medium text-charcoal hover:text-eritrea-blue transition-colors"
                                  >
                                    {appt.user.firstName} {appt.user.lastName}
                                  </Link>
                                )}
                                <p className="text-xs text-warm-gray">{appt.serviceTitle}</p>
                              </div>
                            </div>
                          </td>
                          {/* Status */}
                          <td className="px-6 py-3 text-right">
                            <span className={`text-xs font-medium ${sc.color}`}>{sc.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/admin/afspraken/DateRangeFilter.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

export function DateRangeFilter({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const [fromVal, setFromVal] = useState(from);
  const [toVal, setToVal] = useState(to);

  const apply = () => {
    const params = new URLSearchParams();
    if (fromVal) params.set("from", fromVal);
    if (toVal) params.set("to", toVal);
    router.push(`/admin/afspraken?${params.toString()}`);
  };

  const reset = () => {
    setFromVal("");
    setToVal("");
    router.push("/admin/afspraken");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") apply();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="date"
        value={fromVal}
        onChange={e => setFromVal(e.target.value)}
        onKeyDown={handleKey}
        className="text-sm bg-white/90 text-charcoal rounded-lg px-3 py-2 border border-stone/30 focus:outline-none focus:ring-1 focus:ring-eritrea-blue"
      />
      <span className="text-white/50 text-sm">t/m</span>
      <input
        type="date"
        value={toVal}
        onChange={e => setToVal(e.target.value)}
        onKeyDown={handleKey}
        className="text-sm bg-white/90 text-charcoal rounded-lg px-3 py-2 border border-stone/30 focus:outline-none focus:ring-1 focus:ring-eritrea-blue"
      />
      <button
        onClick={apply}
        className="flex items-center gap-1.5 text-sm font-semibold text-white bg-eritrea-blue px-3 py-2 rounded-lg hover:bg-eritrea-blue/90 transition-colors"
      >
        <Search size={13} /> Filter
      </button>
      {(from || to) && (
        <button
          onClick={reset}
          className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
        >
          <X size={13} /> Reset
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `src/app/admin/afspraken/page.tsx`**

Replace the entire file with:

```tsx
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

  // Build date filter — default to today onwards when no filter set
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

  // Group by date (preserving sort order)
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
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && npx tsc --noEmit 2>&1 | head -20
```

Fix any errors related to your changes.

- [ ] **Step 5: Verify**

Navigate to `http://localhost:3001/admin/afspraken` as STAFF/ADMIN. You should see:
- Date filter inputs in the dark nav bar
- Appointments grouped by day in accordion cards
- Today's card is open by default
- Each row shows citizen name (blue link → dossier) and service
- Walk-in rows show "Inloper" without a dossier link
- "Dagschema →" link on each day header
- Filter by entering a date range and clicking "Filter"

- [ ] **Step 6: Commit**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && git add src/app/admin/afspraken/DayAccordion.tsx src/app/admin/afspraken/DateRangeFilter.tsx src/app/admin/afspraken/page.tsx && git commit -m "feat: redesign admin afspraken with day accordion, dossier links and date filter"
```

---

## Task 5: Stats dashboard `/admin/statistieken`

**Files:**
- Create: `src/app/admin/statistieken/page.tsx`
- Modify: `src/app/admin/page.tsx` (add nav link)

A server-rendered dashboard showing: appointments per week (last 8 weeks as CSS bars), no-show rate, top 5 services, and top 5 busiest time slots. No external chart library — pure CSS bars using inline `width` percentages.

- [ ] **Step 1: Create `src/app/admin/statistieken/page.tsx`**

```tsx
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingDown, Clock, CalendarCheck } from "lucide-react";

export const dynamic = "force-dynamic";

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  // ISO week number
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `W${weekNum}`;
}

function getWeekStart(offsetWeeks: number): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 - offsetWeeks * 7); // Monday
  return d.toISOString().split("T")[0];
}

export default async function StatistiekenPage() {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) redirect("/inloggen");

  // Date boundaries
  const eightWeeksAgo = getWeekStart(8);
  const today = new Date().toISOString().split("T")[0];

  // All appointments in the last 8 weeks
  const recentAppointments = await db.appointment.findMany({
    where: {
      date: { gte: eightWeeksAgo, lte: today },
      status: { in: ["CONFIRMED", "ATTENDED", "NO_SHOW"] },
    },
    select: { date: true, status: true, serviceTitle: true, timeSlot: true },
  });

  // ── Appointments per week ──────────────────────────────
  const weekCounts = new Map<string, number>();
  for (const appt of recentAppointments) {
    const label = getWeekLabel(appt.date);
    weekCounts.set(label, (weekCounts.get(label) ?? 0) + 1);
  }

  // Build last 8 week labels in order
  const weekLabels: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = getWeekStart(i);
    const label = getWeekLabel(weekStart);
    if (!weekLabels.includes(label)) weekLabels.push(label);
  }
  const weekData = weekLabels.map(label => ({ label, count: weekCounts.get(label) ?? 0 }));
  const maxWeekCount = Math.max(...weekData.map(w => w.count), 1);

  // ── No-show rate ──────────────────────────────────────
  const attended = recentAppointments.filter(a => a.status === "ATTENDED").length;
  const noShow = recentAppointments.filter(a => a.status === "NO_SHOW").length;
  const noShowDenominator = attended + noShow;
  const noShowRate = noShowDenominator > 0 ? Math.round((noShow / noShowDenominator) * 100) : 0;

  // ── Top 5 services ────────────────────────────────────
  const serviceCounts = new Map<string, number>();
  for (const appt of recentAppointments) {
    serviceCounts.set(appt.serviceTitle, (serviceCounts.get(appt.serviceTitle) ?? 0) + 1);
  }
  const topServices = Array.from(serviceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxServiceCount = Math.max(...topServices.map(s => s[1]), 1);

  // ── Top 5 time slots ──────────────────────────────────
  const slotCounts = new Map<string, number>();
  for (const appt of recentAppointments) {
    slotCounts.set(appt.timeSlot, (slotCounts.get(appt.timeSlot) ?? 0) + 1);
  }
  const topSlots = Array.from(slotCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxSlotCount = Math.max(...topSlots.map(s => s[1]), 1);

  // ── Totals ─────────────────────────────────────────────
  const totalThisMonth = recentAppointments.filter(a => a.date >= today.slice(0, 7)).length;
  const allTimeCount = await db.appointment.count({ where: { status: { in: ["CONFIRMED", "ATTENDED", "NO_SHOW"] } } });

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
            { label: "Totaal (ooit)", value: allTimeCount, icon: CalendarCheck, color: "text-eritrea-blue", bg: "bg-eritrea-blue/8" },
            { label: "Deze maand", value: totalThisMonth, icon: CalendarCheck, color: "text-eritrea-green", bg: "bg-eritrea-green/8" },
            { label: "No-show rate", value: `${noShowRate}%`, icon: TrendingDown, color: "text-eritrea-red", bg: "bg-eritrea-red/8" },
            { label: "Afgelopen 8 wk", value: recentAppointments.length, icon: BarChart3, color: "text-eritrea-gold-dark", bg: "bg-eritrea-gold/15" },
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
              <p className="text-warm-gray text-sm">Geen data</p>
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
              <p className="text-warm-gray text-sm">Geen data</p>
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
```

- [ ] **Step 2: Add statistieken link to admin homepage**

Read `src/app/admin/page.tsx`. Find the quick actions array (around line 183):
```ts
{ href: "/admin/afspraken", icon: CalendarCheck, label: "Alle afspraken", color: "text-eritrea-blue" },
```

Add this entry to the array (after "Alle afspraken"):
```ts
{ href: "/admin/statistieken", icon: BarChart3, label: "Statistieken", color: "text-eritrea-green" },
```

`BarChart3` is already imported on line 9 of admin/page.tsx.

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && npx tsc --noEmit 2>&1 | head -20
```

Fix any errors related to your changes.

- [ ] **Step 4: Verify**

Navigate to `http://localhost:3001/admin/statistieken`. You should see:
- 4 summary stat cards (totaal, deze maand, no-show rate, afgelopen 8 wk)
- A bar chart with weekly appointment counts (W22, W23, etc.)
- Two horizontal bar charts: drukste diensten and drukste tijdsloten
- "Statistieken" link on the admin homepage quick actions

- [ ] **Step 5: Commit**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && git add src/app/admin/statistieken/page.tsx src/app/admin/page.tsx && git commit -m "feat: add stats dashboard with weekly chart, no-show rate and top services"
```

---

## Final verification checklist

- [ ] `http://localhost:3001/contact` — parchment cards, no gray colors
- [ ] `curl http://localhost:3001/api/cron/morning-digest` — returns JSON with sent count, Ethereal URL in log
- [ ] `http://localhost:3001/afspraken` — green banner showing next available date
- [ ] `http://localhost:3001/admin/afspraken` — accordion view, date filter works, clicking citizen name → dossier
- [ ] `http://localhost:3001/admin/statistieken` — 4 cards + bar charts render, link from admin homepage works
- [ ] `npx tsc --noEmit` in project root — 0 errors
