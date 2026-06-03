# Status Pipeline & Admin Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface document status to citizens, inject service-specific doc checklists into confirmation emails, and add walk-in support + overdue badges + staff notes to the admin dagschema.

**Architecture:** Six targeted changes sharing the existing Next.js App Router + Prisma/SQLite + nodemailer stack. Two schema fields are added (staffNotes, walkIn) requiring a migration. Three new client components are created for dagschema. Two existing pages (documenten, mijn-account) get minor additions.

**Tech Stack:** Next.js 16 App Router, Prisma ORM (sqlite), nodemailer (Ethereal fallback), Tailwind CSS, lucide-react icons.

---

## Context: key file locations

- **DB schema:** `prisma/schema.prisma`
- **Email templates + sender:** `src/lib/email.ts`
- **Service catalogue:** `src/lib/services.ts` — `getServiceInfo(serviceId)` returns `{ requiredDocs: string[] }`
- **Appointment actions:** `src/app/actions/appointments.ts`
- **Dagschema page:** `src/app/admin/dagschema/page.tsx`
- **Citizen documents page:** `src/app/mijn-account/documenten/page.tsx`
- **Citizen account page:** `src/app/mijn-account/page.tsx`
- **Prisma client:** `src/generated/prisma` — regenerate with `npx prisma generate` after schema changes
- **Dev server:** `nohup /bin/bash -c "cd /Users/yh/Downloads/eritrean-embassy-ambassade && npx next dev -p 3001" > /tmp/embassy-dev.log 2>&1 &`

## Context: existing appointment statuses

`Appointment.status` values: `CONFIRMED | ATTENDED | NO_SHOW | CANCELLED`  
`Document.status` values: `PENDING | READY | REJECTED`

---

## Task 1: Schema migration — add staffNotes and walkIn to Appointment

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add two fields to the Appointment model**

Open `prisma/schema.prisma`. Find the `model Appointment {` block. After the `notes String?` line, add:

```prisma
  staffNotes    String?
  walkIn        Boolean    @default(false)
```

The Appointment model should now look like:
```prisma
model Appointment {
  id           String     @id @default(cuid())
  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  serviceId     String
  serviceTitle  String
  date          String
  timeSlot      String
  status        String     @default("CONFIRMED")
  paymentStatus String     @default("NONE")
  notes         String?
  staffNotes    String?
  walkIn        Boolean    @default(false)
  persons       String     @default("1")
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  documents    Document[]
}
```

- [ ] **Step 2: Run the migration**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && npx prisma migrate dev --name add-staffnotes-walkin
```

Expected output: `✔ Generated Prisma Client` and `The following migration(s) have been applied`.

- [ ] **Step 3: Regenerate the Prisma client**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && npx prisma generate
```

Expected: `✔ Generated Prisma Client (v6.x.x)`

- [ ] **Step 4: Verify the migration applied**

```bash
sqlite3 /Users/yh/Downloads/eritrean-embassy-ambassade/dev.db "PRAGMA table_info(Appointment);" | grep -E "staffNotes|walkIn"
```

Expected output includes two rows: `staffNotes` (type TEXT) and `walkIn` (type INT or BOOLEAN).

- [ ] **Step 5: Commit**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && git add prisma/schema.prisma prisma/migrations/ src/generated/ && git commit -m "feat: add staffNotes and walkIn fields to Appointment"
```

---

## Task 2: Document status badges on citizen `/mijn-account/documenten`

**Files:**
- Modify: `src/app/mijn-account/documenten/page.tsx`

**Context:** The page currently shows each document with a `reusable` badge (green "Herbruikbaar" or grey "Eenmalig"). The `doc.status` field (`PENDING | READY | REJECTED`) is fetched but never displayed. Citizens cannot see if their passport/ID is ready for pickup.

- [ ] **Step 1: Replace the reusable badge with a status badge + show reusable as secondary info**

Replace the entire file content of `src/app/mijn-account/documenten/page.tsx` with:

```tsx
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, CalendarCheck, Clock, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const statusConfig = {
  PENDING:  { label: "In behandeling", classes: "bg-eritrea-gold/15 text-eritrea-gold-dark", Icon: Clock },
  READY:    { label: "Klaar voor ophaling", classes: "bg-eritrea-green/10 text-eritrea-green", Icon: CheckCircle },
  REJECTED: { label: "Afgewezen", classes: "bg-eritrea-red/10 text-eritrea-red", Icon: XCircle },
} as const;

type DocStatus = keyof typeof statusConfig;

export default async function DocumentenPage() {
  const session = await getSession();
  if (!session) redirect("/inloggen");

  const documents = await db.document.findMany({
    where: { userId: session.id },
    include: {
      appointment: { select: { serviceTitle: true, date: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const readyCount = documents.filter(d => d.status === "READY").length;

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy px-8 py-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/mijn-account" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-medium text-white">Mijn documenten</h1>
            <p className="text-white/40 text-sm">{documents.length} bestanden opgeslagen</p>
          </div>
        </div>
      </div>
      <div className="eritrea-line" />

      <div className="max-w-2xl mx-auto px-8 py-10 space-y-4">
        {/* Ready for pickup callout */}
        {readyCount > 0 && (
          <div className="bg-eritrea-green/8 border border-eritrea-green/25 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle size={18} className="shrink-0 mt-0.5 text-eritrea-green" />
            <div>
              <p className="font-semibold text-charcoal text-sm">
                {readyCount === 1 ? "1 document klaar voor ophaling" : `${readyCount} documenten klaar voor ophaling`}
              </p>
              <p className="text-xs text-warm-gray mt-0.5">
                Kom langs tijdens openingstijden (ma–do 09:00–15:00) met een geldig identiteitsbewijs.
              </p>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="bg-white rounded-2xl ring-1 ring-stone/40 p-10 text-center">
            <FileText size={32} className="mx-auto text-warm-gray/30 mb-3" />
            <p className="text-warm-gray text-sm mb-4">Nog geen documenten geüpload.</p>
            <Link href="/afspraken" className="btn-primary inline-flex text-sm">
              Afspraak maken &amp; uploaden
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-eritrea-gold/8 border border-eritrea-gold/20 rounded-xl p-4 text-sm text-charcoal/70 flex items-start gap-3">
              <FileText size={16} className="shrink-0 mt-0.5 text-eritrea-gold-dark" />
              <p>Documenten gemarkeerd als <strong>herbruikbaar</strong> worden automatisch aangeboden bij een nieuwe afspraak.</p>
            </div>

            {documents.map(doc => {
              const status = (doc.status ?? "PENDING") as DocStatus;
              const cfg = statusConfig[status] ?? statusConfig.PENDING;
              const StatusIcon = cfg.Icon;
              return (
                <div key={doc.id} className="bg-white rounded-2xl ring-1 ring-stone/40 p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-eritrea-blue/8 text-eritrea-blue flex items-center justify-center shrink-0">
                    <FileText size={20} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal truncate">{doc.originalName}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-warm-gray">
                      <span>{(doc.size / 1024).toFixed(0)} KB</span>
                      <span>·</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString("nl-NL", { dateStyle: "medium" })}</span>
                      {doc.reusable && (
                        <span className="text-eritrea-green font-medium">· Herbruikbaar</span>
                      )}
                    </div>
                    {doc.appointment && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-warm-gray/70">
                        <CalendarCheck size={12} />
                        {doc.appointment.serviceTitle} · {new Date(doc.appointment.date + "T12:00:00").toLocaleDateString("nl-NL", { dateStyle: "medium" })}
                      </div>
                    )}
                    {/* Status note (shown when REJECTED) */}
                    {status === "REJECTED" && doc.statusNote && (
                      <p className="mt-2 text-xs text-eritrea-red/80 italic">{doc.statusNote}</p>
                    )}
                    {/* Pickup instructions (shown when READY) */}
                    {status === "READY" && (
                      <p className="mt-2 text-xs text-eritrea-green/80">
                        Kom langs: Javastraat 58, Den Haag · ma–do 09:00–15:00 · Neem geldig ID mee
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${cfg.classes}`}>
                    <StatusIcon size={11} />
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3001/mijn-account/documenten` as Abraham (abraham@demo.nl / test password).
- Each document card should show a status badge (amber "In behandeling" by default)
- If any document has `status = "READY"` in the DB, the green callout and green badge appear
- If any document has `status = "REJECTED"` with a `statusNote`, the note appears in red italic

To test READY state quickly:
```bash
sqlite3 /Users/yh/Downloads/eritrean-embassy-ambassade/dev.db "UPDATE Document SET status='READY' WHERE userId = (SELECT id FROM User WHERE email='abraham@demo.nl') LIMIT 1;"
```
Then refresh the page.

Reset after testing:
```bash
sqlite3 /Users/yh/Downloads/eritrean-embassy-ambassade/dev.db "UPDATE Document SET status='PENDING' WHERE userId = (SELECT id FROM User WHERE email='abraham@demo.nl');"
```

- [ ] **Step 3: Commit**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && git add src/app/mijn-account/documenten/page.tsx && git commit -m "feat: show document status badges (PENDING/READY/REJECTED) to citizens"
```

---

## Task 3: READY documents callout on main `/mijn-account` page

**Files:**
- Modify: `src/app/mijn-account/page.tsx` (lines ~17–25, the DB query, and the right-column section)

**Context:** The main account page fetches `documents` but only uses `.length`. We need to check for READY docs and show a callout between the stats row and the appointments section.

- [ ] **Step 1: Update the DB query to fetch document statuses**

In `src/app/mijn-account/page.tsx`, find the `db.user.findUnique` call. The `documents` include currently fetches the last 5. Change it to also fetch `status`:

The existing line is:
```ts
      documents: { orderBy: { createdAt: "desc" }, take: 5 },
```

This already fetches all fields including `status` — no change needed to the query.

Add this derived value after the `pastAppointments` filter (around line 37):

```ts
  const readyDocuments = user.documents.filter(d => d.status === "READY");
```

- [ ] **Step 2: Add the callout block in the JSX**

In `src/app/mijn-account/page.tsx`, find the `{/* Right: Tax + Appointments */}` section. Add this block just before the `{/* 2% Belasting */}` section (around line 144):

```tsx
          {/* Ready documents callout */}
          {readyDocuments.length > 0 && (
            <div className="bg-eritrea-green/8 border border-eritrea-green/25 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle size={18} className="shrink-0 text-eritrea-green" />
              <div className="flex-1">
                <p className="font-semibold text-charcoal text-sm">
                  {readyDocuments.length === 1
                    ? "1 document klaar voor ophaling"
                    : `${readyDocuments.length} documenten klaar voor ophaling`}
                </p>
                <p className="text-xs text-warm-gray mt-0.5">
                  Bezoek de ambassade ma–do 09:00–15:00 met een geldig identiteitsbewijs.
                </p>
              </div>
              <Link href="/mijn-account/documenten" className="text-xs font-semibold text-eritrea-green hover:underline shrink-0">
                Bekijken →
              </Link>
            </div>
          )}
```

Make sure `CheckCircle` is in the imports at the top (it already is: `import { ..., CheckCircle, ... } from "lucide-react"`).

- [ ] **Step 3: Verify in browser**

Set one of Abraham's documents to READY using the sqlite3 command from Task 2 Step 2, then navigate to `http://localhost:3001/mijn-account`. A green callout should appear in the right column.

Reset after testing with the sqlite3 reset command from Task 2.

- [ ] **Step 4: Commit**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && git add src/app/mijn-account/page.tsx && git commit -m "feat: show ready-for-pickup callout on main account page"
```

---

## Task 4: Service-specific document checklist in confirmation email

**Files:**
- Modify: `src/lib/email.ts` (function `appointmentConfirmationHtml`, `appointmentConfirmationText`, `sendAppointmentConfirmation`)
- Modify: `src/app/actions/appointments.ts` (function `createAppointmentAction`)

**Context:** `sendAppointmentConfirmation` currently receives `{ to, firstName, serviceTitle, date, timeSlot, appointmentId }`. The email body says "bring all original documents" generically. `src/lib/services.ts` exports `getServiceInfo(serviceId)` which returns `{ requiredDocs: string[] }`. The `createAppointmentAction` has access to `serviceId`.

- [ ] **Step 1: Add `requiredDocs` param to the HTML template helper**

In `src/lib/email.ts`, find the `appointmentConfirmationHtml` function. Its params interface is:
```ts
function appointmentConfirmationHtml(params: {
  firstName: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  appointmentId: string;
})
```

Change it to:
```ts
function appointmentConfirmationHtml(params: {
  firstName: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  appointmentId: string;
  requiredDocs?: string[];
})
```

Then destructure `requiredDocs` inside:
```ts
  const { firstName, serviceTitle, date, timeSlot, appointmentId, requiredDocs } = params;
```

- [ ] **Step 2: Replace the generic warning box with a service-specific checklist**

In `appointmentConfirmationHtml`, find the "Warning box" section:
```html
              <!-- Warning box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #f0d080;border-radius:10px;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#8a6a00;font-size:13px;margin:0;line-height:1.6;">
                      <strong>⚠️ Belangrijk:</strong> Breng alle originele documenten mee naar uw afspraak.
                      Zonder originele documenten kan uw aanvraag niet worden verwerkt.
                    </p>
                  </td>
                </tr>
              </table>
```

Replace it with:
```ts
              <!-- Documents checklist -->
              ${requiredDocs && requiredDocs.length > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #f0d080;border-radius:10px;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#8a6a00;font-size:13px;margin:0 0 10px;font-weight:600;">📋 Neem mee naar de ambassade:</p>
                    ${requiredDocs.map(doc => `
                    <p style="color:#5a4000;font-size:13px;margin:0 0 5px;padding-left:4px;">☐ ${doc}</p>
                    `).join('')}
                  </td>
                </tr>
              </table>
              ` : `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #f0d080;border-radius:10px;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#8a6a00;font-size:13px;margin:0;line-height:1.6;">
                      <strong>⚠️ Belangrijk:</strong> Breng alle originele documenten mee naar uw afspraak.
                      Zonder originele documenten kan uw aanvraag niet worden verwerkt.
                    </p>
                  </td>
                </tr>
              </table>
              `}
```

- [ ] **Step 3: Add `requiredDocs` to the plain-text template**

In `src/lib/email.ts`, find the `appointmentConfirmationText` function. Its params interface needs the same addition:

```ts
function appointmentConfirmationText(params: {
  firstName: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  appointmentId: string;
  requiredDocs?: string[];
})
```

Destructure `requiredDocs` and add after the `BELANGRIJK` section:

Change:
```ts
BELANGRIJK
Breng alle originele documenten mee. Zonder originele documenten kan uw aanvraag niet worden verwerkt.
```

To:
```ts
${requiredDocs && requiredDocs.length > 0
  ? `NEEM MEE\n${requiredDocs.map(d => `  ☐ ${d}`).join('\n')}`
  : `BELANGRIJK\nBreng alle originele documenten mee. Zonder originele documenten kan uw aanvraag niet worden verwerkt.`
}
```

- [ ] **Step 4: Add `requiredDocs` to `sendAppointmentConfirmation`'s params**

In `src/lib/email.ts`, find `export async function sendAppointmentConfirmation`. Change its params type:

```ts
export async function sendAppointmentConfirmation(params: {
  to: string;
  firstName: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  appointmentId: string;
  requiredDocs?: string[];
}): Promise<{ success: boolean; previewUrl?: string; error?: string }>
```

Pass `requiredDocs` through to both template functions:
```ts
      html: appointmentConfirmationHtml(params),   // params already contains requiredDocs
      text: appointmentConfirmationText(params),
```

No change needed to the sendMail call body since `params` is passed directly.

- [ ] **Step 5: Pass `requiredDocs` from `createAppointmentAction`**

In `src/app/actions/appointments.ts`, the file already imports `sendAppointmentConfirmation`. Add the import for `getServiceInfo`:

At the top of the file, after the existing imports, add:
```ts
import { getServiceInfo } from "@/lib/services";
```

Then find the block where the email is sent (around line 52):
```ts
    sendAppointmentConfirmation({
      to: user.email,
      firstName: user.firstName,
      serviceTitle,
      date,
      timeSlot,
      appointmentId: appointment.id,
    }).catch((err) => console.error("Email send failed:", err));
```

Change it to:
```ts
    const serviceInfo = getServiceInfo(serviceId);
    sendAppointmentConfirmation({
      to: user.email,
      firstName: user.firstName,
      serviceTitle,
      date,
      timeSlot,
      appointmentId: appointment.id,
      requiredDocs: serviceInfo?.requiredDocs,
    }).catch((err) => console.error("Email send failed:", err));
```

Also update the `rescheduleAppointmentAction` email call (around line 169) similarly — but since we don't have `serviceId` in scope there, we fetch it from the appointment:

Find:
```ts
    const { sendAppointmentConfirmation } = await import("@/lib/email");
    sendAppointmentConfirmation({
      to: user.email,
      firstName: user.firstName,
      serviceTitle: appointment.serviceTitle,
      date: newDate,
      timeSlot: newTimeSlot,
      appointmentId: appointment.id,
    }).catch((err) => console.error("Reschedule email failed:", err));
```

Change to:
```ts
    const { sendAppointmentConfirmation } = await import("@/lib/email");
    const { getServiceInfo } = await import("@/lib/services");
    const serviceInfo = getServiceInfo(appointment.serviceId);
    sendAppointmentConfirmation({
      to: user.email,
      firstName: user.firstName,
      serviceTitle: appointment.serviceTitle,
      date: newDate,
      timeSlot: newTimeSlot,
      appointmentId: appointment.id,
      requiredDocs: serviceInfo?.requiredDocs,
    }).catch((err) => console.error("Reschedule email failed:", err));
```

- [ ] **Step 6: Verify in browser**

Make a new test appointment at `http://localhost:3001/afspraken`. After booking, check the dev server log for the Ethereal preview URL:

```bash
tail -20 /tmp/embassy-dev.log
```

Open the preview URL in the browser. The email should now show a "📋 Neem mee naar de ambassade:" section with checkboxes listing the service-specific documents.

- [ ] **Step 7: Commit**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && git add src/lib/email.ts src/app/actions/appointments.ts && git commit -m "feat: inject service-specific document checklist into confirmation email"
```

---

## Task 5: Walk-in quick-add on dagschema

**Files:**
- Create: `src/app/admin/dagschema/WalkInForm.tsx`
- Modify: `src/app/actions/appointments.ts` (add `createWalkInAction`)
- Modify: `src/app/admin/dagschema/page.tsx` (add WalkInForm to the header)

**Context:** Staff need to register citizens who arrive without an appointment. Walk-ins are stored as regular Appointment rows with `walkIn: true`. Since `userId` is required in the schema, walk-ins use a dedicted system user (`walkin@ambassade.internal`) that is found-or-created by the server action.

- [ ] **Step 1: Add `createWalkInAction` to appointments.ts**

In `src/app/actions/appointments.ts`, add this function at the end of the file:

```ts
export async function createWalkInAction(data: {
  serviceId: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  notes?: string;
}) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return { error: "Geen toegang." };
  }

  // Find or create the system walk-in user
  const WALKIN_EMAIL = "walkin@ambassade.internal";
  let walkInUser = await db.user.findUnique({ where: { email: WALKIN_EMAIL } });
  if (!walkInUser) {
    walkInUser = await db.user.create({
      data: {
        email: WALKIN_EMAIL,
        passwordHash: "SYSTEM_ACCOUNT_NO_LOGIN",
        role: "CITIZEN",
        firstName: "Inloper",
        lastName: "",
      },
    });
  }

  await db.appointment.create({
    data: {
      userId: walkInUser.id,
      serviceId: data.serviceId,
      serviceTitle: data.serviceTitle,
      date: data.date,
      timeSlot: data.timeSlot,
      notes: data.notes || null,
      status: "CONFIRMED",
      walkIn: true,
    },
  });

  revalidatePath("/admin/dagschema");
  return { success: true };
}
```

- [ ] **Step 2: Create `WalkInForm.tsx`**

Create the file `src/app/admin/dagschema/WalkInForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createWalkInAction } from "@/app/actions/appointments";

const SERVICES = [
  { id: "id-nieuw", title: "ID Nieuwe aanvragers" },
  { id: "id-vervanging", title: "ID Vervanging" },
  { id: "id-minderjarig", title: "Minderjarige ID-kaarten" },
  { id: "paspoort-nieuw", title: "Eritrees nieuw paspoort" },
  { id: "paspoort-vervanging", title: "Eritrese paspoortvervanging" },
  { id: "visum", title: "Visum / Visa" },
  { id: "volmacht", title: "Volmacht / Power of Attorney" },
  { id: "huwelijk", title: "Huwelijksakte / Marriage Certificate" },
  { id: "wroeging", title: "Wroeging / Remorse" },
  { id: "belasting", title: "2% Belasting / 2% Tax" },
  { id: "persoonlijk-doc", title: "Persoonlijk officieel document" },
];

function getCurrentTimeSlot(): string {
  const now = new Date();
  const minutes = Math.round(now.getMinutes() / 15) * 15;
  const h = now.getHours();
  const m = minutes === 60 ? 0 : minutes;
  const hh = (minutes === 60 ? h + 1 : h).toString().padStart(2, "0");
  return `${hh}:${m.toString().padStart(2, "0")}`;
}

export function WalkInForm({ date }: { date: string }) {
  const [open, setOpen] = useState(false);
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [timeSlot, setTimeSlot] = useState(getCurrentTimeSlot());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const service = SERVICES.find(s => s.id === serviceId)!;
    const result = await createWalkInAction({
      serviceId,
      serviceTitle: service.title,
      date,
      timeSlot,
      notes: notes || undefined,
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setNotes("");
      setTimeSlot(getCurrentTimeSlot());
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-semibold text-white bg-eritrea-blue px-3 py-2 rounded-lg hover:bg-eritrea-blue/90 transition-colors"
      >
        <Plus size={14} /> Inloper
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 flex-wrap bg-white/10 rounded-lg px-3 py-2"
    >
      <select
        value={serviceId}
        onChange={e => setServiceId(e.target.value)}
        className="text-xs bg-white/90 text-charcoal rounded px-2 py-1.5 border-0 focus:outline-none focus:ring-1 focus:ring-eritrea-blue"
      >
        {SERVICES.map(s => (
          <option key={s.id} value={s.id}>{s.title}</option>
        ))}
      </select>
      <input
        type="time"
        value={timeSlot}
        onChange={e => setTimeSlot(e.target.value)}
        className="text-xs bg-white/90 text-charcoal rounded px-2 py-1.5 border-0 w-24 focus:outline-none focus:ring-1 focus:ring-eritrea-blue"
      />
      <input
        type="text"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Naam (optioneel)"
        className="text-xs bg-white/90 text-charcoal rounded px-2 py-1.5 border-0 w-32 focus:outline-none focus:ring-1 focus:ring-eritrea-blue"
      />
      <button
        type="submit"
        disabled={loading}
        className="text-xs font-semibold text-white bg-eritrea-green px-3 py-1.5 rounded-lg hover:bg-eritrea-green/90 disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : "Toevoegen"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-white/60 hover:text-white"
      >
        <X size={16} />
      </button>
      {error && <p className="text-xs text-eritrea-red w-full">{error}</p>}
    </form>
  );
}
```

- [ ] **Step 3: Add WalkInForm to dagschema page header**

In `src/app/admin/dagschema/page.tsx`, add the import at the top:
```ts
import { WalkInForm } from "./WalkInForm";
```

In the nav bar div (the `no-print` header), find this block:
```tsx
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-white/60 hover:text-white text-sm">← Terug</a>
            <PrintButton />
          </div>
```

Change it to:
```tsx
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-white/60 hover:text-white text-sm">← Terug</a>
            <WalkInForm date={selectedDate} />
            <PrintButton />
          </div>
```

Also, in the dagschema table, add a visual indicator on walk-in rows. Find the `<tr key={appt.id}` row and add a yellow-left-border class when `appt.walkIn`:

```tsx
                  <tr key={appt.id} className={`${i % 2 === 0 ? "bg-white print:bg-white" : "bg-parchment/30 print:bg-gray-50"} ${appt.walkIn ? "border-l-2 border-eritrea-gold" : ""}`}>
```

And in the name cell, show a small "Inloper" badge when `appt.walkIn` is true:

Find:
```tsx
                      <p className="font-semibold text-charcoal print:text-gray-900 text-sm">
                        {appt.user.firstName} {appt.user.lastName}
                      </p>
```

Change to:
```tsx
                      <p className="font-semibold text-charcoal print:text-gray-900 text-sm flex items-center gap-2">
                        {appt.user.firstName} {appt.user.lastName}
                        {appt.walkIn && (
                          <span className="text-[10px] font-semibold text-eritrea-gold-dark bg-eritrea-gold/15 px-1.5 py-0.5 rounded">
                            Inloper
                          </span>
                        )}
                      </p>
```

Note: the `user` include in the dagschema query must be updated to also fetch `walkIn`. Find the `db.appointment.findMany` call and ensure `walkIn` is returned (it will be by default since we're selecting `include: { user: ... }` not a `select` on appointment itself — all appointment fields are returned automatically).

- [ ] **Step 4: Verify in browser**

Navigate to `http://localhost:3001/admin/dagschema` as admin/staff. An "Inloper" button should appear next to PrintButton. Click it, fill in the form, click "Toevoegen". The page should refresh and show a new row with the "Inloper" badge and a gold left border.

- [ ] **Step 5: Commit**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && git add src/app/admin/dagschema/WalkInForm.tsx src/app/actions/appointments.ts src/app/admin/dagschema/page.tsx && git commit -m "feat: add walk-in quick-add button to dagschema"
```

---

## Task 6: Overdue badge on dagschema

**Files:**
- Create: `src/app/admin/dagschema/OverdueBadge.tsx`
- Modify: `src/app/admin/dagschema/page.tsx`

**Context:** When a scheduled appointment time has passed and the status is still CONFIRMED (not yet attended/no-show), staff need a visual cue. Since dagschema is a server component, a client component reads `new Date()` at mount.

- [ ] **Step 1: Create `OverdueBadge.tsx`**

Create `src/app/admin/dagschema/OverdueBadge.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

export function OverdueBadge({
  date,
  timeSlot,
  status,
}: {
  date: string;       // "2026-05-29"
  timeSlot: string;   // "10:00"
  status: string;
}) {
  const [minutesLate, setMinutesLate] = useState<number | null>(null);

  useEffect(() => {
    function compute() {
      if (status !== "CONFIRMED") {
        setMinutesLate(null);
        return;
      }
      const [h, m] = timeSlot.split(":").map(Number);
      const apptTime = new Date(`${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
      const diff = Math.floor((Date.now() - apptTime.getTime()) / 60000);
      setMinutesLate(diff > 0 ? diff : null);
    }

    compute();
    const interval = setInterval(compute, 30000); // re-check every 30s
    return () => clearInterval(interval);
  }, [date, timeSlot, status]);

  if (minutesLate === null) return null;

  return (
    <span className="ml-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded no-print">
      +{minutesLate}min
    </span>
  );
}
```

- [ ] **Step 2: Add OverdueBadge to the time cell in dagschema**

In `src/app/admin/dagschema/page.tsx`, add the import:
```ts
import { OverdueBadge } from "./OverdueBadge";
```

Find the time cell:
```tsx
                    <td className="px-4 py-4 print:py-3">
                      <span className="font-bold text-eritrea-blue print:text-gray-900 text-sm">{appt.timeSlot}</span>
                    </td>
```

Change to:
```tsx
                    <td className="px-4 py-4 print:py-3">
                      <span className="font-bold text-eritrea-blue print:text-gray-900 text-sm">{appt.timeSlot}</span>
                      <OverdueBadge date={selectedDate} timeSlot={appt.timeSlot} status={appt.status} />
                    </td>
```

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3001/admin/dagschema?date=2026-05-28` (a past date with confirmed appointments). The time cells for CONFIRMED appointments that are past their scheduled time should show amber "+Nmin" badges. ATTENDED/NO_SHOW rows should show nothing.

- [ ] **Step 4: Commit**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && git add src/app/admin/dagschema/OverdueBadge.tsx src/app/admin/dagschema/page.tsx && git commit -m "feat: add overdue elapsed-time badge to dagschema"
```

---

## Task 7: Staff notes on dagschema appointments

**Files:**
- Create: `src/app/admin/dagschema/StaffNotesInput.tsx`
- Modify: `src/app/actions/appointments.ts` (add `saveStaffNotesAction`)
- Modify: `src/app/admin/dagschema/page.tsx` (add StaffNotesInput column)

**Context:** Staff need to annotate appointments with internal notes. The `staffNotes` field was added in Task 1. Notes are never shown to citizens.

- [ ] **Step 1: Add `saveStaffNotesAction` to appointments.ts**

In `src/app/actions/appointments.ts`, add at the end of the file:

```ts
export async function saveStaffNotesAction(appointmentId: string, notes: string) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return { error: "Geen toegang." };
  }

  await db.appointment.update({
    where: { id: appointmentId },
    data: { staffNotes: notes || null },
  });

  revalidatePath("/admin/dagschema");
  return { success: true };
}
```

- [ ] **Step 2: Create `StaffNotesInput.tsx`**

Create `src/app/admin/dagschema/StaffNotesInput.tsx`:

```tsx
"use client";

import { useState, useRef } from "react";
import { MessageSquare, Check, Loader2 } from "lucide-react";
import { saveStaffNotesAction } from "@/app/actions/appointments";

export function StaffNotesInput({
  appointmentId,
  initialNotes,
}: {
  appointmentId: string;
  initialNotes: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => ref.current?.focus(), 50);
  };

  const handleSave = async () => {
    setLoading(true);
    await saveStaffNotesAction(appointmentId, notes);
    setLoading(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
    if (e.key === "Escape") setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded no-print transition-colors ${
          initialNotes
            ? "text-eritrea-blue bg-eritrea-blue/10 hover:bg-eritrea-blue/20"
            : "text-warm-gray/50 hover:text-warm-gray hover:bg-stone/20"
        }`}
        title={initialNotes ? `Notitie: ${initialNotes}` : "Notitie toevoegen"}
      >
        <MessageSquare size={11} />
        {initialNotes ? "Notitie" : "＋"}
      </button>
    );
  }

  return (
    <div className="flex items-start gap-1.5 no-print">
      <textarea
        ref={ref}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        placeholder="Interne notitie (niet zichtbaar voor burger)…"
        className="text-xs text-charcoal bg-parchment/60 border border-stone/40 rounded px-2 py-1.5 w-48 resize-none focus:outline-none focus:ring-1 focus:ring-eritrea-blue"
      />
      <button
        onClick={handleSave}
        disabled={loading || saved}
        className="text-white bg-eritrea-blue rounded px-2 py-1.5 hover:bg-eritrea-blue/90 disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 size={11} className="animate-spin" /> : saved ? <Check size={11} /> : <Check size={11} />}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Add StaffNotesInput to dagschema table**

In `src/app/admin/dagschema/page.tsx`, add the import:
```ts
import { StaffNotesInput } from "./StaffNotesInput";
```

In the `<thead>`, after the "Dienst" column header, add a "Notities" header:
```tsx
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider no-print">Notities</th>
```

Make sure it's before the `print:table-cell` "Telefoon" column and before "Aanwezig".

In the `<tbody>`, add a new `<td>` for the notes input. After the "Dienst" cell and before the "Telefoon" cell:
```tsx
                    <td className="px-4 py-4 print:py-3 no-print">
                      <StaffNotesInput
                        appointmentId={appt.id}
                        initialNotes={appt.staffNotes ?? null}
                      />
                    </td>
```

Note: `appt.staffNotes` is now available since the schema was migrated in Task 1 and the Prisma client regenerated.

- [ ] **Step 4: Verify in browser**

Navigate to `http://localhost:3001/admin/dagschema`. Each appointment row now has a "Notities" column with a small `+` button (or "Notitie" if a note exists). Click `+`, type a note, press Ctrl+Enter or click the checkmark. Refresh the page — the note should persist (shown as "Notitie" button in blue).

- [ ] **Step 5: Commit**

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && git add src/app/admin/dagschema/StaffNotesInput.tsx src/app/actions/appointments.ts src/app/admin/dagschema/page.tsx && git commit -m "feat: add internal staff notes per appointment on dagschema"
```

---

## Final verification checklist

- [ ] `http://localhost:3001/mijn-account/documenten` — documents show PENDING/READY/REJECTED badge
- [ ] Set a doc to READY via sqlite3 → green callout appears on `/mijn-account` main page
- [ ] Admin changes doc to READY via DocumentStatusDropdown → Ethereal preview URL logged to console
- [ ] Book a new appointment → confirmation email in console includes service-specific document list
- [ ] `http://localhost:3001/admin/dagschema` — "+ Inloper" button visible; add one → row appears with gold border + "Inloper" badge
- [ ] Past-date dagschema — overdue CONFIRMED appointments show amber "+Nmin" badge
- [ ] Staff notes — type and save; persist on refresh; button turns blue when note exists
- [ ] Walk-in "Inloper" rows do NOT appear in citizen account (they're linked to system user)
