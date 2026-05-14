# Eritrese Ambassade Portal — Implementatieplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Voeg een volledig burger- en staffportaal toe aan de bestaande ambassade-site: auth, afspraken opslaan in SQLite, documentupload, en een staff-dashboard met agenda en dossiers.

**Architecture:** Custom JWT-sessies via `jose` + `cookies()`, Prisma + SQLite als database, Server Actions voor mutaties, Route Handler voor bestandsupload. Route-beveiliging happens in page/layout Server Components via `redirect()`.

**Tech Stack:** Next.js 16 (App Router), Prisma 5 + SQLite, jose, bcryptjs, zod 4

---

## Task 1: Bootstrap — deps, git, logo, CSS-fix

**Files:**
- Create: `prisma/schema.prisma`
- Create: `public/embassy-logo.svg` → copy als `public/embassy-logo.png`
- Modify: `src/app/globals.css`
- Modify: `package.json`

- [ ] **Stap 1: git init**
```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade
git init
git add .
git commit -m "chore: initial commit (broer z'n versie)"
```

- [ ] **Stap 2: installeer deps**
```bash
npm install prisma @prisma/client jose bcryptjs zod
npm install --save-dev @types/bcryptjs
```

- [ ] **Stap 3: Prisma initialiseren**
```bash
npx prisma init --datasource-provider sqlite
```

- [ ] **Stap 4: Schrijf `prisma/schema.prisma`**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  role         Role      @default(CITIZEN)
  firstName    String
  lastName     String
  dateOfBirth  String?
  phone        String?
  eritreanId   String?
  createdAt    DateTime  @default(now())

  appointments  Appointment[]
  documents     Document[]
  familyMembers FamilyMember[]
}

enum Role {
  CITIZEN
  STAFF
  ADMIN
}

model FamilyMember {
  id           String  @id @default(cuid())
  userId       String
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName    String
  lastName     String
  dateOfBirth  String?
  relationship String
}

model Appointment {
  id          String            @id @default(cuid())
  userId      String
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  serviceType String
  serviceTitle String
  date        String
  timeSlot    String
  status      AppointmentStatus @default(CONFIRMED)
  notes       String?
  createdAt   DateTime          @default(now())

  documents Document[]
}

enum AppointmentStatus {
  CONFIRMED
  CANCELLED
  COMPLETED
}

model Document {
  id            String       @id @default(cuid())
  userId        String
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  appointmentId String?
  appointment   Appointment? @relation(fields: [appointmentId], references: [id], onDelete: SetNull)
  filename      String
  originalName  String
  mimetype      String
  size          Int
  reusable      Boolean      @default(true)
  createdAt     DateTime     @default(now())
}
```

- [ ] **Stap 5: Migratie draaien**
```bash
npx prisma migrate dev --name init
```
Verwacht: `✔ Your database is now in sync with your schema.`

- [ ] **Stap 6: Logo placeholder aanmaken**

Maak `public/embassy-logo.png` aan. Gebruik dit tijdelijke SVG-bestand dat je opslaat als PNG via een base64 embed, of run dit script:
```bash
# Maak een eenvoudige SVG als placeholder
cat > /Users/yh/Downloads/eritrean-embassy-ambassade/public/embassy-logo.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="58" fill="#1E5FA8" stroke="#C99A3C" stroke-width="4"/>
  <circle cx="60" cy="60" r="44" fill="none" stroke="#C99A3C" stroke-width="2"/>
  <text x="60" y="52" text-anchor="middle" fill="#C99A3C" font-family="serif" font-size="18" font-weight="bold">ኤርትራ</text>
  <text x="60" y="74" text-anchor="middle" fill="white" font-family="serif" font-size="11">ERITREA</text>
</svg>
EOF
cp /Users/yh/Downloads/eritrean-embassy-ambassade/public/embassy-logo.svg /Users/yh/Downloads/eritrean-embassy-ambassade/public/embassy-logo.png
```

Voeg ook SVG toe als remotePattern in `next.config.ts` is niet nodig — het is een lokaal bestand.

Update `next.config.ts` om SVG te accepteren:
```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
};

export default nextConfig;
```

- [ ] **Stap 7: Fix `bg-slate-warm` in globals.css**

Voeg toe aan het einde van `@layer components` in `src/app/globals.css`:
```css
  .bg-slate-warm {
    background-color: #F8F6F3;
  }
```

- [ ] **Stap 8: Commit**
```bash
git add -A
git commit -m "chore: setup prisma, logo, css fix"
```

---

## Task 2: Auth foundation — session, db, definities

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/session.ts`
- Create: `src/lib/definitions.ts`
- Create: `.env.local`

- [ ] **Stap 1: `.env.local`**
```bash
cat > /Users/yh/Downloads/eritrean-embassy-ambassade/.env.local << 'EOF'
AUTH_SECRET=eritrese-ambassade-den-haag-geheim-2026-sleutel
DATABASE_URL="file:./prisma/dev.db"
EOF
```

- [ ] **Stap 2: `src/lib/db.ts`**
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Stap 3: `src/lib/session.ts`**
```ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-min-32-chars-2026!!"
);

export type SessionPayload = {
  userId: string;
  role: "CITIZEN" | "STAFF" | "ADMIN";
  email: string;
  firstName: string;
  lastName: string;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  const store = await cookies();
  store.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const store = await cookies();
  store.delete("session");
}
```

- [ ] **Stap 4: `src/lib/definitions.ts`**
```ts
import { z } from "zod";

export const RegisterSchema = z.object({
  firstName: z.string().min(2, "Minimaal 2 tekens"),
  lastName: z.string().min(2, "Minimaal 2 tekens"),
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(8, "Minimaal 8 tekens"),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(1, "Vereist"),
});

export type FormState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;
```

- [ ] **Stap 5: Commit**
```bash
git add -A
git commit -m "feat: auth foundation — session, db, definitions"
```

---

## Task 3: Auth Server Actions + seed data

**Files:**
- Create: `src/app/actions/auth.ts`
- Create: `prisma/seed.ts`
- Modify: `package.json`

- [ ] **Stap 1: `src/app/actions/auth.ts`**
```ts
"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { RegisterSchema, LoginSchema, FormState } from "@/lib/definitions";

export async function register(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = RegisterSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { firstName, lastName, email, password, phone } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ["Dit e-mailadres is al in gebruik"] } };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { firstName, lastName, email, passwordHash, phone: phone ?? null },
  });

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  redirect("/mijn-account");
}

export async function login(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { message: "Ongeldig e-mailadres of wachtwoord" };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  if (user.role === "CITIZEN") redirect("/mijn-account");
  redirect("/admin/agenda");
}

export async function logout() {
  await deleteSession();
  redirect("/inloggen");
}
```

- [ ] **Stap 2: `prisma/seed.ts`**
```ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 12);

  // Admin
  await db.user.upsert({
    where: { email: "admin@ambassade.nl" },
    update: {},
    create: {
      email: "admin@ambassade.nl",
      passwordHash: await hash("Admin@2026"),
      role: "ADMIN",
      firstName: "Admin",
      lastName: "Ambassade",
    },
  });

  // Staff
  await db.user.upsert({
    where: { email: "medewerker@ambassade.nl" },
    update: {},
    create: {
      email: "medewerker@ambassade.nl",
      passwordHash: await hash("Staff@2026"),
      role: "STAFF",
      firstName: "Sara",
      lastName: "Tesfai",
    },
  });

  // Burger met afspraken
  const burger = await db.user.upsert({
    where: { email: "demo@burger.nl" },
    update: {},
    create: {
      email: "demo@burger.nl",
      passwordHash: await hash("Burger@2026"),
      role: "CITIZEN",
      firstName: "Abraham",
      lastName: "Haile",
      phone: "+31612345678",
      eritreanId: "ER-123456",
    },
  });

  await db.appointment.upsert({
    where: { id: "demo-apt-1" },
    update: {},
    create: {
      id: "demo-apt-1",
      userId: burger.id,
      serviceType: "paspoort-nieuw",
      serviceTitle: "Eritrees nieuw paspoort",
      date: "2026-05-20",
      timeSlot: "09:30",
      status: "CONFIRMED",
    },
  });

  console.log("✅ Seed klaar");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
```

- [ ] **Stap 3: Voeg seed script toe aan `package.json`**

In het `scripts` object:
```json
"seed": "npx tsx prisma/seed.ts"
```

Installeer tsx:
```bash
npm install --save-dev tsx
```

- [ ] **Stap 4: Seed draaien**
```bash
npm run seed
```
Verwacht: `✅ Seed klaar`

- [ ] **Stap 5: Commit**
```bash
git add -A
git commit -m "feat: auth actions + seed data"
```

---

## Task 4: Auth pagina's — /inloggen en /registreren

**Files:**
- Create: `src/app/inloggen/page.tsx`
- Create: `src/app/registreren/page.tsx`
- Create: `src/components/AuthForm.tsx`

- [ ] **Stap 1: `src/components/AuthForm.tsx`** (gedeeld formulier-component)
```tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormState } from "@/lib/definitions";

interface Field {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

interface AuthFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  fields: Field[];
  submitLabel: string;
  footerText: string;
  footerLinkHref: string;
  footerLinkText: string;
}

export default function AuthForm({
  action,
  fields,
  submitLabel,
  footerText,
  footerLinkHref,
  footerLinkText,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      {state?.message && (
        <div className="bg-eritrea-red/8 text-eritrea-red text-sm px-4 py-3 rounded-lg">
          {state.message}
        </div>
      )}
      {fields.map((field) => (
        <div key={field.name}>
          <label className="form-label">
            {field.label}
            {field.required && <span className="text-eritrea-red ml-1">*</span>}
          </label>
          <input
            name={field.name}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            className="form-input"
            required={field.required}
          />
          {state?.errors?.[field.name] && (
            <p className="text-eritrea-red text-xs mt-1">
              {state.errors[field.name][0]}
            </p>
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full disabled:opacity-50"
      >
        {pending ? "Even geduld..." : submitLabel}
      </button>
      <p className="text-center text-sm text-warm-gray">
        {footerText}{" "}
        <Link href={footerLinkHref} className="text-eritrea-blue font-medium hover:underline">
          {footerLinkText}
        </Link>
      </p>
    </form>
  );
}
```

- [ ] **Stap 2: `src/app/inloggen/page.tsx`**
```tsx
import AuthForm from "@/components/AuthForm";
import { login } from "@/app/actions/auth";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function InloggenPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "CITIZEN" ? "/mijn-account" : "/admin/agenda");
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-medium text-charcoal mb-2">
            Inloggen
          </h1>
          <p className="text-warm-gray text-sm">Welkom terug bij de Eritrese Ambassade</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-lg shadow-charcoal/5 ring-1 ring-stone/40">
          <AuthForm
            action={login}
            submitLabel="Inloggen"
            footerText="Nog geen account?"
            footerLinkHref="/registreren"
            footerLinkText="Registreer hier"
            fields={[
              { name: "email", label: "E-mailadres", type: "email", placeholder: "uw@email.nl", required: true },
              { name: "password", label: "Wachtwoord", type: "password", placeholder: "••••••••", required: true },
            ]}
          />
          <div className="mt-6 pt-6 border-t border-stone/50 text-xs text-warm-gray/60 space-y-1">
            <p><strong className="text-charcoal">Demo burger:</strong> demo@burger.nl / Burger@2026</p>
            <p><strong className="text-charcoal">Demo staff:</strong> medewerker@ambassade.nl / Staff@2026</p>
            <p><strong className="text-charcoal">Demo admin:</strong> admin@ambassade.nl / Admin@2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Stap 3: `src/app/registreren/page.tsx`**
```tsx
import AuthForm from "@/components/AuthForm";
import { register } from "@/app/actions/auth";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RegistrerenPage() {
  const session = await getSession();
  if (session) redirect("/mijn-account");

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-medium text-charcoal mb-2">
            Account Aanmaken
          </h1>
          <p className="text-warm-gray text-sm">Maak een account aan voor consulaire diensten</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-lg shadow-charcoal/5 ring-1 ring-stone/40">
          <AuthForm
            action={register}
            submitLabel="Account Aanmaken"
            footerText="Al een account?"
            footerLinkHref="/inloggen"
            footerLinkText="Log hier in"
            fields={[
              { name: "firstName", label: "Voornaam", placeholder: "Abraham", required: true },
              { name: "lastName", label: "Achternaam", placeholder: "Tesfamariam", required: true },
              { name: "email", label: "E-mailadres", type: "email", placeholder: "uw@email.nl", required: true },
              { name: "phone", label: "Telefoonnummer", placeholder: "+31 6 12345678" },
              { name: "password", label: "Wachtwoord", type: "password", placeholder: "Min. 8 tekens", required: true },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Stap 4: Update Navbar met sessie-info**

Voeg toe aan `src/components/Navbar.tsx` — importeer en toon uitlogknop als ingelogd. Maak een aparte server component wrapper:

Maak `src/components/NavbarWrapper.tsx`:
```tsx
import { getSession } from "@/lib/session";
import Navbar from "./Navbar";

export default async function NavbarWrapper() {
  const session = await getSession();
  return <Navbar session={session} />;
}
```

Vervang in `src/app/layout.tsx`:
```tsx
// Vervang: import Navbar from "@/components/Navbar";
import NavbarWrapper from "@/components/NavbarWrapper";
// En vervang: <Navbar /> met <NavbarWrapper />
```

Voeg toe aan `src/components/Navbar.tsx` — voeg `session` prop toe:
```tsx
// Bovenaan het bestand, na imports:
import type { SessionPayload } from "@/lib/session";
import { logout } from "@/app/actions/auth";
import { User } from "lucide-react";

// Wijzig de functie-signatuur:
export default function Navbar({ session }: { session: SessionPayload | null }) {
```

Voeg rechts in de desktop nav, vóór `<LanguageSwitcher>`, toe:
```tsx
{session ? (
  <div className="flex items-center gap-2 ml-2 border-l border-gray-200 pl-3">
    <Link href={session.role === "CITIZEN" ? "/mijn-account" : "/admin/agenda"}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-600">
      <User size={16} />
      <span className="hidden sm:inline">{session.firstName}</span>
    </Link>
    <form action={logout}>
      <button type="submit" className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-500 hover:text-eritrea-red transition-colors">
        Uitloggen
      </button>
    </form>
  </div>
) : (
  <Link href="/inloggen" className="ml-2 btn-primary text-sm !px-4 !py-2">
    Inloggen
  </Link>
)}
```

- [ ] **Stap 5: Test — open browser op http://localhost:3000**
```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && npm run dev
```
Controleer:
- `/inloggen` laadt zonder fouten
- Inloggen met `demo@burger.nl / Burger@2026` → redirect naar `/mijn-account` (nog 404, is OK)
- Navbar toont naam na inloggen
- Uitloggen werkt

- [ ] **Stap 6: Commit**
```bash
git add -A
git commit -m "feat: auth pages — inloggen, registreren, navbar sessie"
```

---

## Task 5: Mijn Account — burgerprofiel

**Files:**
- Create: `src/app/mijn-account/layout.tsx`
- Create: `src/app/mijn-account/page.tsx`
- Create: `src/app/mijn-account/afspraken/page.tsx`
- Create: `src/app/actions/profile.ts`

- [ ] **Stap 1: `src/app/mijn-account/layout.tsx`** (auth guard)
```tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Calendar, FileText, Users } from "lucide-react";

export default async function MijnAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "CITIZEN") redirect("/inloggen");

  const navItems = [
    { href: "/mijn-account", label: "Mijn Profiel", icon: User },
    { href: "/mijn-account/afspraken", label: "Mijn Afspraken", icon: Calendar },
    { href: "/mijn-account/documenten", label: "Mijn Documenten", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-ivory">
      <div className="bg-navy text-white py-8">
        <div className="max-w-6xl mx-auto px-8">
          <p className="text-white/50 text-sm mb-1">Welkom terug</p>
          <h1 className="font-display text-2xl font-medium">
            {session.firstName} {session.lastName}
          </h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex gap-10">
          <aside className="w-56 shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-warm-gray hover:bg-white hover:text-eritrea-blue transition-all"
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Stap 2: `src/app/actions/profile.ts`**
```ts
"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return;

  await db.user.update({
    where: { id: session.userId },
    data: {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      eritreanId: formData.get("eritreanId") as string,
    },
  });

  revalidatePath("/mijn-account");
}
```

- [ ] **Stap 3: `src/app/mijn-account/page.tsx`**
```tsx
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { updateProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";

export default async function MijnAccountPage() {
  const session = await getSession();
  if (!session) redirect("/inloggen");

  const user = await db.user.findUniqueOrThrow({ where: { id: session.userId } });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-medium text-charcoal mb-1">Mijn Profiel</h2>
        <p className="text-warm-gray text-sm">Beheer uw persoonlijke gegevens</p>
      </div>

      <form action={updateProfile} className="bg-white rounded-2xl p-8 ring-1 ring-stone/40 space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="form-label">Voornaam</label>
            <input name="firstName" defaultValue={user.firstName} className="form-input" />
          </div>
          <div>
            <label className="form-label">Achternaam</label>
            <input name="lastName" defaultValue={user.lastName} className="form-input" />
          </div>
          <div>
            <label className="form-label">Geboortedatum</label>
            <input name="dateOfBirth" type="date" defaultValue={user.dateOfBirth ?? ""} className="form-input" />
          </div>
          <div>
            <label className="form-label">Telefoonnummer</label>
            <input name="phone" defaultValue={user.phone ?? ""} className="form-input" />
          </div>
          <div className="col-span-2">
            <label className="form-label">E-mailadres</label>
            <input value={user.email} disabled className="form-input opacity-50 cursor-not-allowed" readOnly />
          </div>
          <div className="col-span-2">
            <label className="form-label">Eritrees ID-nummer</label>
            <input name="eritreanId" defaultValue={user.eritreanId ?? ""} placeholder="ER-XXXXXX" className="form-input" />
          </div>
        </div>
        <button type="submit" className="btn-primary">Opslaan</button>
      </form>
    </div>
  );
}
```

- [ ] **Stap 4: `src/app/mijn-account/afspraken/page.tsx`**
```tsx
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, ArrowRight, CheckCircle, XCircle, Clock } from "lucide-react";

const statusConfig = {
  CONFIRMED: { label: "Bevestigd", color: "text-eritrea-green", bg: "bg-eritrea-green/8", icon: CheckCircle },
  CANCELLED: { label: "Geannuleerd", color: "text-eritrea-red", bg: "bg-eritrea-red/8", icon: XCircle },
  COMPLETED: { label: "Afgerond", color: "text-warm-gray", bg: "bg-parchment", icon: CheckCircle },
};

export default async function MijnAfsprakenPage() {
  const session = await getSession();
  if (!session) redirect("/inloggen");

  const appointments = await db.appointment.findMany({
    where: { userId: session.userId },
    orderBy: { date: "desc" },
    include: { documents: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-medium text-charcoal mb-1">Mijn Afspraken</h2>
          <p className="text-warm-gray text-sm">{appointments.length} afspraken in totaal</p>
        </div>
        <Link href="/afspraken" className="btn-red text-sm flex items-center gap-2">
          <Calendar size={16} /> Nieuwe Afspraak
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center ring-1 ring-stone/40">
          <Calendar size={40} className="text-stone mx-auto mb-4" />
          <p className="text-warm-gray">U heeft nog geen afspraken</p>
          <Link href="/afspraken" className="btn-primary inline-flex mt-4 text-sm">Afspraak maken</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => {
            const status = statusConfig[apt.status];
            return (
              <div key={apt.id} className="bg-white rounded-2xl p-6 ring-1 ring-stone/40 flex items-center gap-5">
                <div className={`w-10 h-10 rounded-xl ${status.bg} ${status.color} flex items-center justify-center shrink-0`}>
                  <status.icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-display font-medium text-charcoal">{apt.serviceTitle}</p>
                  <p className="text-warm-gray text-sm mt-0.5">
                    {new Date(apt.date + "T12:00:00").toLocaleDateString("nl-NL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} om {apt.timeSlot}
                  </p>
                  <p className="text-xs text-warm-gray/50 mt-0.5">{apt.documents.length} document(en) geüpload</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Stap 5: Commit**
```bash
git add -A
git commit -m "feat: mijn-account burger portal"
```

---

## Task 6: Afspraak wizard — echt opslaan + docs hergebruiken

**Files:**
- Create: `src/app/actions/appointments.ts`
- Create: `src/app/api/uploads/route.ts`
- Modify: `src/components/AppointmentWizard.tsx`
- Modify: `src/app/afspraken/page.tsx`

- [ ] **Stap 1: `src/app/actions/appointments.ts`**
```ts
"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface BookingInput {
  serviceType: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  notes?: string;
  documentIds: string[];
}

export async function createAppointment(input: BookingInput) {
  const session = await getSession();
  if (!session) redirect("/inloggen");

  const appointment = await db.appointment.create({
    data: {
      userId: session.userId,
      serviceType: input.serviceType,
      serviceTitle: input.serviceTitle,
      date: input.date,
      timeSlot: input.timeSlot,
      notes: input.notes ?? null,
      status: "CONFIRMED",
    },
  });

  if (input.documentIds.length > 0) {
    await db.document.updateMany({
      where: { id: { in: input.documentIds }, userId: session.userId },
      data: { appointmentId: appointment.id },
    });
  }

  revalidatePath("/mijn-account/afspraken");
  return { appointmentId: appointment.id };
}

export async function getUserDocuments() {
  const session = await getSession();
  if (!session) return [];

  return db.document.findMany({
    where: { userId: session.userId, reusable: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
```

- [ ] **Stap 2: `src/app/api/uploads/route.ts`**
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "Geen bestand" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", session.userId);
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  const doc = await db.document.create({
    data: {
      userId: session.userId,
      filename: `${session.userId}/${filename}`,
      originalName: file.name,
      mimetype: file.type,
      size: file.size,
      reusable: true,
    },
  });

  return NextResponse.json({ id: doc.id, originalName: doc.originalName });
}
```

- [ ] **Stap 3: Vervang volledige `src/components/AppointmentWizard.tsx`**

De wizard krijgt twee nieuwe props en slaat echt op. Vervang de huidige `AppointmentWizard.tsx` volledig door de volgende versie. De structuur blijft hetzelfde (5 stappen) maar:
- Stap 1 en 2 al pre-filled als ingelogd
- Stap 3 (documenten): toont eerder geüploade docs om te hergebruiken + upload knop
- `setSubmitted(true)` wordt vervangen door een call naar `createAppointment`

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText, CreditCard, Users, Shield, Plane,
  Check, ChevronRight, ChevronLeft, Upload, X,
  Plus, Trash2, AlertCircle, Stamp, RefreshCw,
} from "lucide-react";
import { createAppointment, getUserDocuments } from "@/app/actions/appointments";
import type { SessionPayload } from "@/lib/session";

// serviceOptions blijft identiek aan het origineel
const serviceOptions = [
  { id: "id-nieuw", icon: FileText, title: "ID Nieuwe aanvragers", titleTi: "መንነት ሓድሽ", time: "10 min", color: "text-eritrea-blue", bg: "bg-eritrea-blue/8", requiredDocs: ["Geboorteakte", "2 pasfoto's", "Bewijs van Eritrese nationaliteit"] },
  { id: "id-vervanging", icon: FileText, title: "ID Vervanging", titleTi: "መተካእታ መንነት", time: "10 min", color: "text-eritrea-blue", bg: "bg-eritrea-blue/8", requiredDocs: ["Huidig ID (of kopie)", "1 pasfoto", "Geldig identiteitsbewijs"] },
  { id: "id-minderjarig", icon: Users, title: "Minderjarige ID-kaarten", titleTi: "ንቆልዑ", time: "10 min", color: "text-eritrea-blue", bg: "bg-eritrea-blue/8", requiredDocs: ["Geboorteakte kind", "ID van beide ouders", "2 pasfoto's van het kind"] },
  { id: "wroeging", icon: FileText, title: "Wroeging / Remorse", titleTi: "ጣዕሳ", time: "10 min", color: "text-eritrea-green", bg: "bg-eritrea-green/8", requiredDocs: ["Geldig identiteitsbewijs", "Ingevuld formulier"] },
  { id: "paspoort-nieuw", icon: Plane, title: "Eritrees nieuw paspoort", titleTi: "ሓድሽ ፓስፖርት", time: "10 min", color: "text-eritrea-green", bg: "bg-eritrea-green/8", requiredDocs: ["Eritrese ID-kaart", "4 pasfoto's", "Geboorteakte"] },
  { id: "paspoort-vervanging", icon: Plane, title: "Eritrese paspoortvervanging", titleTi: "ፓስፖርት ምትካእ", time: "10 min", color: "text-eritrea-green", bg: "bg-eritrea-green/8", requiredDocs: ["Huidig paspoort (of kopie)", "2 pasfoto's"] },
  { id: "visum", icon: Stamp, title: "Visum / Visa", titleTi: "ቪዛ", time: "10 min", color: "text-eritrea-red", bg: "bg-eritrea-red/8", requiredDocs: ["Geldig paspoort (min. 6 maanden)", "Pasfoto", "Visumaanvraagformulier"] },
  { id: "volmacht", icon: Shield, title: "Volmacht / Power of Attorney", titleTi: "ውክልና", time: "10 min", color: "text-eritrea-gold-dark", bg: "bg-eritrea-gold/10", requiredDocs: ["Geldig identiteitsbewijs", "Concept volmachttekst"] },
  { id: "huwelijk", icon: Users, title: "Huwelijksakte", titleTi: "ምስክር ወረቐት መርዓ", time: "10 min", color: "text-eritrea-blue", bg: "bg-eritrea-blue/8", requiredDocs: ["Huwelijksakte (met apostille)", "ID van beide partners"] },
  { id: "belasting", icon: CreditCard, title: "2% Belasting / 2% Tax", titleTi: "2% ቀረጽ", time: "10 min", color: "text-eritrea-gold-dark", bg: "bg-eritrea-gold/10", requiredDocs: ["Geldig identiteitsbewijs", "Loonstroken / jaaropgave"] },
];

const timeSlots = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30"];
const steps = ["Dienst", "Datum & Tijd", "Documenten", "Bevestiging"];

const availableDates = (() => {
  const dates: string[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (dates.length < 30) {
    if (d.getDay() >= 1 && d.getDay() <= 4) dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
})();

interface SavedDoc { id: string; originalName: string; }

export default function AppointmentWizard({ session }: { session: SessionPayload | null }) {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState<SavedDoc[]>([]);
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([]);
  const [selectedSavedIds, setSelectedSavedIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedService = serviceOptions.find((s) => s.id === service);

  useEffect(() => {
    if (session) {
      getUserDocuments().then(setSavedDocs);
    }
  }, [session]);

  const canProceed = () => {
    if (step === 0) return !!service;
    if (step === 1) return !!date && !!time;
    return true;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const doc = await res.json();
      setUploadedDocs((prev) => [...prev, doc]);
    }
    setUploading(false);
  };

  const toggleSavedDoc = (id: string) => {
    setSelectedSavedIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    if (!service || !date || !time || !selectedService) return;
    setSaving(true);
    const allDocIds = [
      ...uploadedDocs.map((d) => d.id),
      ...selectedSavedIds,
    ];
    await createAppointment({
      serviceType: service,
      serviceTitle: selectedService.title,
      date,
      timeSlot: time,
      documentIds: allDocIds,
    });
    setSaving(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-eritrea-green/8 text-eritrea-green flex items-center justify-center mx-auto mb-6">
          <Check size={40} strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-3xl font-medium text-charcoal mb-4">Afspraak Bevestigd!</h2>
        <p className="text-warm-gray text-lg mb-8">
          {session
            ? "Uw afspraak is opgeslagen in uw account."
            : "Uw afspraak is geregistreerd."}
        </p>
        <div className="bg-parchment/60 rounded-2xl p-8 text-left space-y-4 mb-8">
          {[
            ["Dienst", selectedService?.title ?? ""],
            ["Datum", date ? new Date(date + "T12:00:00").toLocaleDateString("nl-NL", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : ""],
            ["Tijd", `${time} uur`],
            ["Documenten", String(uploadedDocs.length + selectedSavedIds.length)],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between">
              <span className="text-warm-gray">{label}</span>
              <span className="font-medium text-charcoal">{val}</span>
            </div>
          ))}
        </div>
        {session && (
          <a href="/mijn-account/afspraken" className="btn-primary inline-flex">
            Bekijk mijn afspraken
          </a>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10 pb-8 border-b border-stone/30">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center">
            <button
              onClick={() => i < step && setStep(i)}
              className={`step-indicator ${i === step ? "step-active" : i < step ? "step-completed cursor-pointer" : "step-inactive"}`}
            >
              {i < step ? <Check size={16} /> : i + 1}
            </button>
            <span className={`hidden sm:block ml-2 text-xs ${i === step ? "text-eritrea-blue font-medium" : i < step ? "text-eritrea-green" : "text-warm-gray/40"}`}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-6 md:w-12 h-0.5 mx-1.5 md:mx-3 rounded-full ${i < step ? "bg-eritrea-green" : "bg-stone/50"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Service */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal mb-2">Waarvoor wilt u een afspraak maken?</h3>
            <p className="text-warm-gray text-sm">Selecteer het type dienst. Elke afspraak duurt 10 minuten.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {serviceOptions.map((s) => (
              <button key={s.id} onClick={() => setService(s.id)}
                className={`flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200 ${service === s.id ? "bg-eritrea-blue/5 ring-2 ring-eritrea-blue/30" : "bg-parchment/40 hover:bg-parchment/70"}`}>
                <div className={`w-9 h-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center shrink-0 mt-0.5`}>
                  <s.icon size={18} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-medium text-charcoal text-sm leading-snug">{s.title}</h4>
                  <p className="text-warm-gray/60 text-xs mt-0.5">{s.titleTi} · {s.time}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Date & Time */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal mb-2">Kies een datum en tijd</h3>
            <p className="text-warm-gray text-sm">Ma – Do, 09:00 – 15:00. Elke afspraak duurt 10 minuten.</p>
          </div>
          <div>
            <label className="form-label">Datum</label>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2 max-h-56 overflow-y-auto">
              {availableDates.map((dateStr) => {
                const d = new Date(dateStr + "T12:00:00");
                return (
                  <button key={dateStr} onClick={() => setDate(dateStr)}
                    className={`p-2.5 rounded-lg text-center transition-all duration-200 ${date === dateStr ? "bg-eritrea-blue text-white" : "bg-parchment/40 hover:bg-parchment text-charcoal"}`}>
                    <div className={`text-[10px] uppercase font-medium ${date === dateStr ? "text-white/60" : "text-warm-gray/50"}`}>{d.toLocaleDateString("nl-NL", { weekday: "short" })}</div>
                    <div className="text-base font-display font-medium">{d.getDate()}</div>
                    <div className={`text-[10px] ${date === dateStr ? "text-white/60" : "text-warm-gray/50"}`}>{d.toLocaleDateString("nl-NL", { month: "short" })}</div>
                  </button>
                );
              })}
            </div>
          </div>
          {date && (
            <div>
              <label className="form-label">Tijdstip</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlots.map((t) => (
                  <button key={t} onClick={() => setTime(t)}
                    className={`p-2.5 rounded-lg text-center text-sm font-medium transition-all duration-200 ${time === t ? "bg-eritrea-blue text-white" : "bg-parchment/40 hover:bg-parchment text-charcoal"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Documents */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal mb-2">Documenten uploaden</h3>
            <p className="text-warm-gray text-sm">Optioneel maar aanbevolen — bespaart tijd bij de ambassade.</p>
          </div>

          {selectedService && (
            <div className="bg-eritrea-blue/5 rounded-xl p-5">
              <h4 className="font-medium text-eritrea-blue mb-3 flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> Benodigde documenten voor {selectedService.title}
              </h4>
              <ul className="space-y-2">
                {selectedService.requiredDocs.map((doc) => (
                  <li key={doc} className="text-sm text-charcoal/70 flex items-start gap-2">
                    <Check size={14} className="shrink-0 mt-0.5 text-eritrea-green" /> {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Eerder geüploade docs hergebruiken */}
          {savedDocs.length > 0 && (
            <div>
              <h4 className="form-label flex items-center gap-2">
                <RefreshCw size={14} /> Eerder geüploade documenten hergebruiken
              </h4>
              <div className="space-y-2">
                {savedDocs.map((doc) => (
                  <label key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-parchment/40 hover:bg-parchment cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSavedIds.includes(doc.id)}
                      onChange={() => toggleSavedDoc(doc.id)}
                      className="w-4 h-4 text-eritrea-blue"
                    />
                    <FileText size={16} className="text-eritrea-blue shrink-0" />
                    <span className="text-sm text-charcoal">{doc.originalName}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Nieuwe upload */}
          <div onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone rounded-2xl p-8 text-center cursor-pointer hover:border-eritrea-blue hover:bg-eritrea-blue/3 transition-all duration-200 group">
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleUpload} />
            <div className="w-12 h-12 rounded-xl bg-parchment group-hover:bg-eritrea-blue/8 text-warm-gray group-hover:text-eritrea-blue flex items-center justify-center mx-auto mb-3 transition-colors duration-200">
              <Upload size={22} />
            </div>
            <p className="font-medium text-charcoal text-sm mb-1">{uploading ? "Uploaden..." : "Klik om bestanden te uploaden"}</p>
            <p className="text-xs text-warm-gray/50">PDF, JPG, PNG, DOC — max. 10MB per bestand</p>
          </div>

          {uploadedDocs.length > 0 && (
            <div className="space-y-2">
              {uploadedDocs.map((doc, idx) => (
                <div key={doc.id} className="flex items-center justify-between bg-parchment/30 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-eritrea-blue/8 text-eritrea-blue flex items-center justify-center"><FileText size={16} /></div>
                    <p className="text-sm font-medium text-charcoal">{doc.originalName}</p>
                  </div>
                  <button onClick={() => setUploadedDocs((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-warm-gray hover:text-eritrea-red p-1 rounded-lg hover:bg-eritrea-red/5 transition-colors"><X size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-xl font-medium text-charcoal mb-2">Controleer uw gegevens</h3>
            <p className="text-warm-gray text-sm">Controleer alles en bevestig uw afspraak.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-parchment/30 rounded-2xl p-6">
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-warm-gray/50 mb-3 font-semibold">Dienst</h4>
              <p className="font-medium text-charcoal">{selectedService?.title}</p>
            </div>
            <div className="bg-parchment/30 rounded-2xl p-6">
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-warm-gray/50 mb-3 font-semibold">Datum & Tijd</h4>
              <p className="font-medium text-charcoal">
                {date && new Date(date + "T12:00:00").toLocaleDateString("nl-NL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} om {time} uur
              </p>
            </div>
            <div className="bg-parchment/30 rounded-2xl p-6">
              <h4 className="text-[11px] uppercase tracking-[0.15em] text-warm-gray/50 mb-3 font-semibold">Documenten</h4>
              <p className="text-charcoal">{uploadedDocs.length + selectedSavedIds.length} document(en) bijgevoegd</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-stone/30">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="btn-secondary flex items-center gap-2 text-sm">
            <ChevronLeft size={16} /> Vorige
          </button>
        ) : <div />}
        {step < steps.length - 1 ? (
          <button onClick={() => canProceed() && setStep(step + 1)} disabled={!canProceed()}
            className={`btn-primary flex items-center gap-2 text-sm ${!canProceed() ? "opacity-40 cursor-not-allowed" : ""}`}>
            Volgende <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleConfirm} disabled={saving} className="btn-green flex items-center gap-2 text-sm disabled:opacity-50">
            <Check size={16} /> {saving ? "Bezig..." : "Afspraak Bevestigen"}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Stap 4: Update `src/app/afspraken/page.tsx`** — geef sessie door aan wizard
```tsx
import AppointmentWizard from "@/components/AppointmentWizard";
import PageHeader from "@/components/PageHeader";
import { Clock, FileText, AlertCircle } from "lucide-react";
import { getSession } from "@/lib/session";

export default async function AfsprakenPage() {
  const session = await getSession();

  return (
    <>
      <PageHeader titleKey="page.appointment.title" subtitleKey="page.appointment.subtitle" />
      <div className="eritrea-line" />
      <section className="bg-ivory pt-12 pb-24">
        <div className="max-w-4xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Clock, color: "text-eritrea-blue", bg: "bg-eritrea-blue/8", title: "Openingstijden", desc: "Ma – Do: 09:00 – 15:00, alleen op afspraak" },
              { icon: FileText, color: "text-eritrea-green", bg: "bg-eritrea-green/8", title: "Documenten", desc: "Upload vooraf of neem originelen mee" },
              { icon: AlertCircle, color: "text-eritrea-gold-dark", bg: "bg-eritrea-gold/10", title: "Let op", desc: "Elke persoon heeft een eigen afspraak nodig" },
            ].map((item) => (
              <div key={item.title} className="bg-parchment/60 rounded-2xl p-5 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="font-display font-medium text-charcoal text-sm">{item.title}</p>
                  <p className="text-warm-gray text-xs mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg shadow-charcoal/5 ring-1 ring-stone/40">
            <AppointmentWizard session={session} />
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Stap 5: Commit**
```bash
git add -A
git commit -m "feat: appointment wizard — echt opslaan, docs hergebruiken"
```

---

## Task 7: Staff dashboard — layout, agenda, afspraken

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/agenda/page.tsx`
- Create: `src/app/admin/afspraken/page.tsx`
- Create: `src/app/admin/afspraken/[id]/page.tsx`

- [ ] **Stap 1: `src/app/admin/layout.tsx`**
```tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, List, Users, UserCog, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role === "CITIZEN") redirect("/inloggen");

  const navItems = [
    { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
    { href: "/admin/afspraken", label: "Afspraken", icon: List },
    { href: "/admin/burgers", label: "Burgers", icon: Users },
    ...(session.role === "ADMIN" ? [{ href: "/admin/medewerkers", label: "Medewerkers", icon: UserCog }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-ivory">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-navy text-white flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Ambassade</p>
          <p className="font-display font-semibold text-white">Staff Portal</p>
          <p className="text-white/50 text-xs mt-1">{session.firstName} {session.lastName}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-eritrea-gold/20 text-eritrea-gold-light text-xs font-medium">
            {session.role === "ADMIN" ? "Beheerder" : "Medewerker"}
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all">
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <form action={logout}>
            <button type="submit" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/8 transition-all w-full">
              <LogOut size={18} /> Uitloggen
            </button>
          </form>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
```

- [ ] **Stap 2: `src/app/admin/page.tsx`**
```tsx
import { redirect } from "next/navigation";
export default function AdminPage() {
  redirect("/admin/agenda");
}
```

- [ ] **Stap 3: `src/app/admin/agenda/page.tsx`**
```tsx
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";

function getTodayAndNextDays(n: number) {
  const days: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    const dow = day.getDay();
    if (dow >= 1 && dow <= 4) days.push(day.toISOString().split("T")[0]);
  }
  return days.slice(0, 5);
}

export default async function AgendaPage() {
  const session = await getSession();
  if (!session || session.role === "CITIZEN") redirect("/inloggen");

  const days = getTodayAndNextDays(14);
  const appointments = await db.appointment.findMany({
    where: { date: { in: days }, status: "CONFIRMED" },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
    include: { user: true, documents: true },
  });

  const byDay = days.map((day) => ({
    day,
    items: appointments.filter((a) => a.date === day),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-medium text-charcoal mb-1">Agenda</h1>
        <p className="text-warm-gray text-sm">Komende afspraken — maandag t/m donderdag</p>
      </div>

      {byDay.map(({ day, items }) => (
        <div key={day}>
          <div className="flex items-center gap-3 mb-3">
            <Calendar size={16} className="text-eritrea-blue" />
            <h2 className="font-display font-medium text-charcoal">
              {new Date(day + "T12:00:00").toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
            </h2>
            <span className="text-xs text-warm-gray bg-parchment px-2 py-0.5 rounded-full">{items.length} afspraken</span>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-xl p-4 text-warm-gray text-sm ring-1 ring-stone/30">Geen afspraken</div>
          ) : (
            <div className="space-y-2">
              {items.map((apt) => (
                <Link key={apt.id} href={`/admin/afspraken/${apt.id}`}
                  className="bg-white rounded-xl p-4 ring-1 ring-stone/30 flex items-center gap-4 hover:ring-eritrea-blue/30 hover:shadow-sm transition-all group">
                  <div className="w-14 text-center shrink-0">
                    <p className="font-display font-semibold text-eritrea-blue text-lg leading-none">{apt.timeSlot}</p>
                    <p className="text-[10px] text-warm-gray/50 mt-0.5">10 min</p>
                  </div>
                  <div className="w-px h-10 bg-stone/50" />
                  <div className="flex-1">
                    <p className="font-medium text-charcoal text-sm">{apt.serviceTitle}</p>
                    <p className="text-warm-gray text-xs mt-0.5 flex items-center gap-1">
                      <User size={11} /> {apt.user.firstName} {apt.user.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {apt.documents.length > 0 ? (
                      <span className="text-xs bg-eritrea-green/10 text-eritrea-green px-2 py-0.5 rounded-full">
                        {apt.documents.length} doc(s) ✓
                      </span>
                    ) : (
                      <span className="text-xs bg-eritrea-gold/10 text-eritrea-gold-dark px-2 py-0.5 rounded-full">
                        Geen docs
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Stap 4: `src/app/admin/afspraken/page.tsx`**
```tsx
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function AfsprakenPage() {
  const session = await getSession();
  if (!session || session.role === "CITIZEN") redirect("/inloggen");

  const appointments = await db.appointment.findMany({
    orderBy: [{ date: "desc" }, { timeSlot: "asc" }],
    include: { user: true, documents: true },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-charcoal mb-1">Alle Afspraken</h1>
        <p className="text-warm-gray text-sm">{appointments.length} afspraken totaal</p>
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-stone/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-stone/40">
            <tr className="text-left">
              {["Datum", "Tijd", "Dienst", "Burger", "Docs", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-semibold text-warm-gray/60 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone/20">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-ivory transition-colors">
                <td className="px-5 py-3 text-charcoal">
                  {new Date(apt.date + "T12:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                </td>
                <td className="px-5 py-3 font-medium text-eritrea-blue">{apt.timeSlot}</td>
                <td className="px-5 py-3 text-charcoal max-w-[180px] truncate">{apt.serviceTitle}</td>
                <td className="px-5 py-3">
                  <Link href={`/admin/burgers/${apt.userId}`} className="text-eritrea-blue hover:underline">
                    {apt.user.firstName} {apt.user.lastName}
                  </Link>
                </td>
                <td className="px-5 py-3 text-warm-gray">{apt.documents.length}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    apt.status === "CONFIRMED" ? "bg-eritrea-green/10 text-eritrea-green" :
                    apt.status === "CANCELLED" ? "bg-eritrea-red/10 text-eritrea-red" :
                    "bg-parchment text-warm-gray"
                  }`}>{apt.status === "CONFIRMED" ? "Bevestigd" : apt.status === "CANCELLED" ? "Geannuleerd" : "Afgerond"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Stap 5: `src/app/admin/afspraken/[id]/page.tsx`**
```tsx
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, User } from "lucide-react";

export default async function AfspraakDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role === "CITIZEN") redirect("/inloggen");

  const { id } = await params;
  const apt = await db.appointment.findUnique({
    where: { id },
    include: { user: true, documents: true },
  });
  if (!apt) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/afspraken" className="text-warm-gray hover:text-eritrea-blue transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-2xl font-medium text-charcoal">Afspraakdetails</h1>
      </div>

      <div className="bg-white rounded-2xl p-8 ring-1 ring-stone/40 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[
            ["Dienst", apt.serviceTitle],
            ["Datum", new Date(apt.date + "T12:00:00").toLocaleDateString("nl-NL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })],
            ["Tijdstip", apt.timeSlot],
            ["Status", apt.status],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-warm-gray/50 uppercase tracking-wider mb-1">{label}</p>
              <p className="font-medium text-charcoal">{val}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-stone/40 pt-6">
          <p className="text-xs text-warm-gray/50 uppercase tracking-wider mb-3 flex items-center gap-2">
            <User size={12} /> Burger
          </p>
          <Link href={`/admin/burgers/${apt.user.id}`} className="font-medium text-eritrea-blue hover:underline">
            {apt.user.firstName} {apt.user.lastName}
          </Link>
          <p className="text-warm-gray text-sm">{apt.user.email}</p>
          {apt.user.phone && <p className="text-warm-gray text-sm">{apt.user.phone}</p>}
        </div>

        <div className="border-t border-stone/40 pt-6">
          <p className="text-xs text-warm-gray/50 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText size={12} /> Documenten ({apt.documents.length})
          </p>
          {apt.documents.length === 0 ? (
            <p className="text-warm-gray text-sm">Geen documenten geüpload</p>
          ) : (
            <ul className="space-y-2">
              {apt.documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-parchment/40">
                  <FileText size={16} className="text-eritrea-blue shrink-0" />
                  <span className="text-sm text-charcoal">{doc.originalName}</span>
                  <a href={`/uploads/${doc.filename}`} target="_blank" rel="noopener noreferrer"
                    className="ml-auto text-xs text-eritrea-blue hover:underline">Bekijken</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Stap 6: Commit**
```bash
git add -A
git commit -m "feat: staff dashboard — layout, agenda, afspraken"
```

---

## Task 8: Admin burgers + medewerkers beheer

**Files:**
- Create: `src/app/admin/burgers/page.tsx`
- Create: `src/app/admin/burgers/[id]/page.tsx`
- Create: `src/app/admin/medewerkers/page.tsx`
- Create: `src/app/actions/admin.ts`

- [ ] **Stap 1: `src/app/admin/burgers/page.tsx`**
```tsx
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BurgersPage() {
  const session = await getSession();
  if (!session || session.role === "CITIZEN") redirect("/inloggen");

  const burgers = await db.user.findMany({
    where: { role: "CITIZEN" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { appointments: true, documents: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-charcoal mb-1">Burgers</h1>
        <p className="text-warm-gray text-sm">{burgers.length} geregistreerde burgers</p>
      </div>
      <div className="bg-white rounded-2xl ring-1 ring-stone/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-stone/40">
            <tr className="text-left">
              {["Naam", "E-mail", "Telefoon", "Afspraken", "Documenten", "Geregistreerd"].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-semibold text-warm-gray/60 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone/20">
            {burgers.map((u) => (
              <tr key={u.id} className="hover:bg-ivory transition-colors">
                <td className="px-5 py-3">
                  <Link href={`/admin/burgers/${u.id}`} className="font-medium text-eritrea-blue hover:underline">
                    {u.firstName} {u.lastName}
                  </Link>
                </td>
                <td className="px-5 py-3 text-warm-gray">{u.email}</td>
                <td className="px-5 py-3 text-warm-gray">{u.phone ?? "—"}</td>
                <td className="px-5 py-3 text-charcoal">{u._count.appointments}</td>
                <td className="px-5 py-3 text-charcoal">{u._count.documents}</td>
                <td className="px-5 py-3 text-warm-gray text-xs">
                  {new Date(u.createdAt).toLocaleDateString("nl-NL")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Stap 2: `src/app/admin/burgers/[id]/page.tsx`**
```tsx
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BurgerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role === "CITIZEN") redirect("/inloggen");

  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      appointments: { orderBy: { date: "desc" }, include: { documents: true } },
      documents: { orderBy: { createdAt: "desc" } },
      familyMembers: true,
    },
  });
  if (!user || user.role !== "CITIZEN") notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/burgers" className="text-warm-gray hover:text-eritrea-blue transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-2xl font-medium text-charcoal">
          {user.firstName} {user.lastName}
        </h1>
      </div>

      {/* Persoonlijke gegevens */}
      <div className="bg-white rounded-2xl p-8 ring-1 ring-stone/40">
        <h2 className="font-display font-medium text-charcoal mb-5">Persoonlijke Gegevens</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ["E-mail", user.email],
            ["Telefoon", user.phone ?? "—"],
            ["Geboortedatum", user.dateOfBirth ?? "—"],
            ["Eritrees ID", user.eritreanId ?? "—"],
            ["Geregistreerd", new Date(user.createdAt).toLocaleDateString("nl-NL")],
          ].map(([label, val]) => (
            <div key={String(label)}>
              <p className="text-xs text-warm-gray/50 uppercase tracking-wider mb-1">{label}</p>
              <p className="font-medium text-charcoal">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Afspraken */}
      <div className="bg-white rounded-2xl p-8 ring-1 ring-stone/40">
        <h2 className="font-display font-medium text-charcoal mb-5">Afspraken ({user.appointments.length})</h2>
        {user.appointments.length === 0 ? (
          <p className="text-warm-gray text-sm">Geen afspraken</p>
        ) : (
          <div className="space-y-2">
            {user.appointments.map((apt) => (
              <Link key={apt.id} href={`/admin/afspraken/${apt.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-parchment/40 hover:bg-parchment transition-colors">
                <div>
                  <p className="font-medium text-charcoal text-sm">{apt.serviceTitle}</p>
                  <p className="text-warm-gray text-xs mt-0.5">
                    {new Date(apt.date + "T12:00:00").toLocaleDateString("nl-NL")} om {apt.timeSlot} · {apt.documents.length} doc(s)
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  apt.status === "CONFIRMED" ? "bg-eritrea-green/10 text-eritrea-green" : "bg-parchment text-warm-gray"
                }`}>{apt.status === "CONFIRMED" ? "Bevestigd" : apt.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Stap 3: `src/app/actions/admin.ts`**
```ts
"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createStaffMember(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return;

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const role = formData.get("role") as "STAFF" | "ADMIN";

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return;

  await db.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      firstName,
      lastName,
      role,
    },
  });

  revalidatePath("/admin/medewerkers");
}
```

- [ ] **Stap 4: `src/app/admin/medewerkers/page.tsx`**
```tsx
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { createStaffMember } from "@/app/actions/admin";

export default async function MedewerkersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/admin/agenda");

  const medewerkers = await db.user.findMany({
    where: { role: { in: ["STAFF", "ADMIN"] } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-medium text-charcoal mb-1">Medewerkers</h1>
        <p className="text-warm-gray text-sm">{medewerkers.length} accounts</p>
      </div>

      <div className="bg-white rounded-2xl ring-1 ring-stone/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-stone/40">
            <tr className="text-left">
              {["Naam", "E-mail", "Rol", "Aangemaakt"].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-semibold text-warm-gray/60 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone/20">
            {medewerkers.map((u) => (
              <tr key={u.id} className="hover:bg-ivory">
                <td className="px-5 py-3 font-medium text-charcoal">{u.firstName} {u.lastName}</td>
                <td className="px-5 py-3 text-warm-gray">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    u.role === "ADMIN" ? "bg-eritrea-gold/15 text-eritrea-gold-dark" : "bg-eritrea-blue/10 text-eritrea-blue"
                  }`}>{u.role === "ADMIN" ? "Beheerder" : "Medewerker"}</span>
                </td>
                <td className="px-5 py-3 text-warm-gray text-xs">{new Date(u.createdAt).toLocaleDateString("nl-NL")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl p-8 ring-1 ring-stone/40">
        <h2 className="font-display font-medium text-charcoal mb-5">Nieuwe Medewerker Toevoegen</h2>
        <form action={createStaffMember} className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Voornaam</label>
            <input name="firstName" className="form-input" required />
          </div>
          <div>
            <label className="form-label">Achternaam</label>
            <input name="lastName" className="form-input" required />
          </div>
          <div>
            <label className="form-label">E-mailadres</label>
            <input name="email" type="email" className="form-input" required />
          </div>
          <div>
            <label className="form-label">Tijdelijk wachtwoord</label>
            <input name="password" type="password" className="form-input" required />
          </div>
          <div className="col-span-2">
            <label className="form-label">Rol</label>
            <select name="role" className="form-input">
              <option value="STAFF">Medewerker</option>
              <option value="ADMIN">Beheerder</option>
            </select>
          </div>
          <div className="col-span-2">
            <button type="submit" className="btn-primary">Toevoegen</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Stap 5: Commit**
```bash
git add -A
git commit -m "feat: admin burgers + medewerkers beheer"
```

---

## Task 9: Eindcheck + demo-voorbereiding

**Files:**
- Modify: `src/app/mijn-account/documenten/page.tsx` (aanmaken)
- Check: build werkt

- [ ] **Stap 1: `src/app/mijn-account/documenten/page.tsx`**
```tsx
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";

export default async function DocumentenPage() {
  const session = await getSession();
  if (!session) redirect("/inloggen");

  const documents = await db.document.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-medium text-charcoal mb-1">Mijn Documenten</h2>
        <p className="text-warm-gray text-sm">{documents.length} documenten opgeslagen</p>
      </div>
      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center ring-1 ring-stone/40">
          <FileText size={40} className="text-stone mx-auto mb-4" />
          <p className="text-warm-gray">Nog geen documenten geüpload</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl p-4 ring-1 ring-stone/40 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-eritrea-blue/8 text-eritrea-blue flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-charcoal text-sm">{doc.originalName}</p>
                <p className="text-warm-gray text-xs mt-0.5">
                  {(doc.size / 1024).toFixed(0)} KB · {new Date(doc.createdAt).toLocaleDateString("nl-NL")}
                </p>
              </div>
              <a href={`/uploads/${doc.filename}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-eritrea-blue hover:underline">Bekijken</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Stap 2: Build check**
```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade && npm run build
```
Fix eventuele TypeScript errors voor je doorgaat.

- [ ] **Stap 3: Seed nogmaals draaien**
```bash
npm run seed
```

- [ ] **Stap 4: Demo walkthrough testen**

Controleer deze flows in de browser (`npm run dev`):
1. `/` → homepage laadt met logo
2. `/inloggen` met `demo@burger.nl / Burger@2026` → `/mijn-account`
3. `/afspraken` → wizard, kies dienst, datum, upload doc → bevestig → zichtbaar in `/mijn-account/afspraken`
4. Uitloggen → `/inloggen`
5. Inloggen met `medewerker@ambassade.nl / Staff@2026` → `/admin/agenda`
6. Klik op afspraak → detailpagina met burger en documenten
7. `/admin/burgers` → lijst, klik op Abraham Haile → dossier
8. Inloggen als `admin@ambassade.nl / Admin@2026` → `/admin/medewerkers` zichtbaar

- [ ] **Stap 5: Eindcommit**
```bash
git add -A
git commit -m "feat: complete ambassade portal — burger + staff dashboard"
```

---

## Demo Accounts

| Rol | E-mail | Wachtwoord |
|-----|--------|------------|
| Burger | demo@burger.nl | Burger@2026 |
| Medewerker | medewerker@ambassade.nl | Staff@2026 |
| Beheerder | admin@ambassade.nl | Admin@2026 |

## Snelstart

```bash
cd /Users/yh/Downloads/eritrean-embassy-ambassade
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```
