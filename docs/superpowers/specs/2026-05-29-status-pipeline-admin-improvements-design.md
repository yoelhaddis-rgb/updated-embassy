# Status Pipeline & Admin Improvements — Design

**Date:** 2026-05-29  
**Project:** Eritrese Ambassade Den Haag

---

## What was already there (don't rebuild)

Before scoping this spec, a full codebase audit revealed that much of the "status pipeline" already exists:

- ✅ `nodemailer` email infra with Ethereal test fallback
- ✅ `sendAppointmentConfirmation`, `sendAppointmentReminder`, `sendCancellationConfirmation`, `sendDocumentReadyNotification` in `src/lib/email.ts`
- ✅ Daily reminder cron at `GET /api/cron/reminders`
- ✅ `Document.status: PENDING | READY | REJECTED` + `statusNote` in schema
- ✅ `DocumentStatusDropdown` component in admin burgers view
- ✅ `updateDocumentStatusAction` fires `sendDocumentReadyNotification` on `READY`
- ✅ `CheckInButton` (CONFIRMED/ATTENDED/NO_SHOW) on dagschema

**This spec covers only what's missing.**

---

## Gaps to fill

### Citizen side

#### 1. Document status visibility (`/mijn-account/documenten`)
The document page shows each document's `reusable` flag but completely ignores `status`. Citizens cannot see if their passport/ID application is PENDING, READY for pickup, or REJECTED.

**Fix:** Add a status badge to each document card:
- `PENDING` → amber badge "In behandeling"
- `READY` → green badge "Klaar voor ophaling" + pickup instructions
- `REJECTED` → red badge "Afgewezen" + show `statusNote` if present

Also surface READY documents on the main `/mijn-account` page as a prominent callout.

#### 2. Service-specific document checklist in confirmation email
Current confirmation email says "bring all original documents" generically. The specific checklist per service (from `src/lib/services.ts`) is never injected into the email.

**Fix:** Update `sendAppointmentConfirmation` to accept an optional `requiredDocs: string[]` param. When provided, render a bulleted checklist block in the email HTML.
`createAppointmentAction` calls `getServiceInfo(serviceId)` and passes `requiredDocs` to the email function.

#### 3. Document status indicator on main account page
On `/mijn-account`, if any of the user's documents are `READY`, show a callout card: "📦 X document(en) klaar voor ophaling" with a link to `/mijn-account/documenten`.

### Admin side

#### 4. Walk-in quick-add on dagschema
Staff currently cannot register citizens who arrive without an appointment. This makes the dagschema an incomplete picture of the actual day.

**Fix:** Add a "+ Inloper" button at the top of the dagschema. Clicking opens an inline form (no page navigation):
- Service type (dropdown from SERVICE_CATALOGUE)
- Optional name (defaults to "Inloper")
- Time slot (defaults to current time rounded to nearest 15 min)
- Submit creates a new Appointment with `status: "CONFIRMED"`, `userId` linked to a special walk-in guest account or null (requires schema consideration — see below)

**Schema approach:** Add nullable `walkIn: Boolean @default(false)` to Appointment. Walk-ins are created with `walkIn: true`. Since `userId` is required in the current schema, create a server action that uses the admin's own session userId or a dedicated "walk-in" user seeded in the DB.

Actually simpler: make `userId` optional (`userId String?`) — walk-ins have no user account. This requires a migration.

**Decided approach:** Add `walkIn: Boolean @default(false)` flag. Walk-in appointments still require a userId — admin creates them on behalf of a system "walk-in" user that's seeded. This avoids a nullable foreign key migration.

Actually, simplest viable approach: walk-ins store the admin's userId as the creator. This creates noise in the admin's account. **Better:** seed a dedicated `walk-in@ambassade.nl` system user during migration. Walk-in appointments point to this user.

#### 5. Overdue badge on dagschema
When a scheduled appointment is past its start time and not yet marked ATTENDED/NO_SHOW, staff have no visual indicator. A busy front desk loses track quickly.

**Fix:** In the dagschema, each appointment row computes overdue status client-side: if `appt.status === "CONFIRMED"` and `appt.timeSlot < currentTime` (on `selectedDate === today`), show a badge "+Nmin" in amber. This is purely a UI change, no server changes needed.

Since dagschema is a server component, we need a thin `"use client"` wrapper `OverdueBadge` that reads `new Date()` at mount and shows the badge only when relevant.

#### 6. Staff notes on appointments
Staff need to annotate appointments with internal notes ("brought extra documents", "didn't speak Dutch"). These should never be shown to citizens.

**Fix:**
- Add `staffNotes: String?` to `Appointment` schema
- Run migration
- Add `StaffNotesInput` client component on dagschema (expandable textarea per row)
- `saveStaffNotesAction` server action (staff/admin only)

---

## Architecture

```
src/
├── app/
│   ├── actions/
│   │   └── appointments.ts         ← add saveStaffNotesAction, createWalkInAction
│   ├── admin/
│   │   └── dagschema/
│   │       ├── OverdueBadge.tsx     ← NEW: client component, shows +Nmin
│   │       ├── WalkInForm.tsx       ← NEW: client component, inline walk-in form
│   │       └── StaffNotesInput.tsx  ← NEW: client component, expandable notes
│   └── mijn-account/
│       ├── page.tsx                 ← add READY documents callout
│       └── documenten/
│           └── page.tsx             ← add status badge per document
└── lib/
    └── email.ts                     ← add requiredDocs param to sendAppointmentConfirmation
prisma/
└── schema.prisma                    ← add staffNotes, walkIn fields
```

---

## Data flow: walk-in creation

```
Staff clicks "+ Inloper"
  → WalkInForm opens inline
  → Staff selects service + optional name
  → createWalkInAction called
    → finds or creates walk-in system user (email: walkin@ambassade.internal)
    → creates Appointment { walkIn: true, userId: systemUserId, ... }
    → revalidatePath("/admin/dagschema")
  → WalkInForm closes, new row appears in table
```

## Data flow: document status → citizen email

Already works:
```
Admin changes doc status to READY via DocumentStatusDropdown
  → updateDocumentStatusAction
    → db.document.update({ status: "READY" })
    → sendDocumentReadyNotification (fire-and-forget)
  → Citizen sees READY badge on /mijn-account/documenten
```

The only missing piece is the **citizen-side display** (gap 1).

---

## Testing plan

- Visit `/mijn-account/documenten` as citizen — verify PENDING/READY/REJECTED badges appear
- Change document to READY as admin — verify email is logged to console (Ethereal preview URL)
- Main `/mijn-account` page — verify READY callout appears when docs are READY
- Book an appointment — verify confirmation email now includes service-specific document list
- On dagschema for today — verify overdue badge appears after appointment time passes
- Click "+ Inloper" — fill form, submit, verify walk-in row appears in dagschema
- Expand staff notes on an appointment row, type a note, refresh — verify it persists

---

## Out of scope (deferred)

- SMS reminders (needs SMS provider setup)
- Waitlist management
- Multi-service single booking
- Waiting room display screen (`/display` route)
- Morning agenda digest email (cron + email reuse, low effort but deferring)
- Per-staff presence toggle
