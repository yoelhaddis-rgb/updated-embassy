import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const db = new PrismaClient({ adapter } as any);

function workday(offsetDays: number): string {
  const d = new Date();
  // Start from Monday of current week
  const day = d.getDay();
  const toMonday = day === 0 ? 1 : day === 6 ? 2 : -(day - 1);
  d.setDate(d.getDate() + toMonday);
  let added = 0;
  const direction = offsetDays >= 0 ? 1 : -1;
  const steps = Math.abs(offsetDays);
  while (added < steps) {
    d.setDate(d.getDate() + direction);
    if (d.getDay() >= 1 && d.getDay() <= 4) added++;
  }
  return d.toISOString().split("T")[0];
}

async function main() {
  console.log("🌱 Seeding rich demo data...");

  // ─── Staff ───────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin123", 12);
  const staffHash = await bcrypt.hash("medewerker123", 12);
  const citizenHash = await bcrypt.hash("burger123", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@eritreanembassy.nl" },
    update: {},
    create: {
      email: "admin@eritreanembassy.nl",
      passwordHash: adminHash,
      role: "ADMIN",
      firstName: "Yohannes",
      lastName: "Tesfay",
      phone: "+31 70 427 6812",
    },
  });

  await db.user.upsert({
    where: { email: "medewerker@eritreanembassy.nl" },
    update: {},
    create: {
      email: "medewerker@eritreanembassy.nl",
      passwordHash: staffHash,
      role: "STAFF",
      firstName: "Miriam",
      lastName: "Haile",
      phone: "+31 70 427 6813",
    },
  });

  await db.user.upsert({
    where: { email: "samuel@eritreanembassy.nl" },
    update: {},
    create: {
      email: "samuel@eritreanembassy.nl",
      passwordHash: staffHash,
      role: "STAFF",
      firstName: "Samuel",
      lastName: "Ghebremedhin",
      phone: "+31 70 427 6814",
    },
  });

  // ─── Citizens ────────────────────────────────────────────
  const citizen1 = await db.user.upsert({
    where: { email: "abraham@demo.nl" },
    update: {},
    create: {
      email: "abraham@demo.nl",
      passwordHash: citizenHash,
      role: "CITIZEN",
      firstName: "Abraham",
      lastName: "Tesfamariam",
      dateOfBirth: "1985-03-15",
      phone: "+31 6 12345678",
      eritreanIdNumber: "ER-1985-003421",
      address: "Pijnboomstraat 12, Amsterdam",
    },
  });

  const citizen2 = await db.user.upsert({
    where: { email: "asmeret@demo.nl" },
    update: {},
    create: {
      email: "asmeret@demo.nl",
      passwordHash: citizenHash,
      role: "CITIZEN",
      firstName: "Asmeret",
      lastName: "Habtezion",
      dateOfBirth: "1990-07-22",
      phone: "+31 6 98765432",
      eritreanIdNumber: "ER-1990-007854",
      address: "Merwedestraat 45, Rotterdam",
    },
  });

  const citizen3 = await db.user.upsert({
    where: { email: "dawit@demo.nl" },
    update: {},
    create: {
      email: "dawit@demo.nl",
      passwordHash: citizenHash,
      role: "CITIZEN",
      firstName: "Dawit",
      lastName: "Berhane",
      dateOfBirth: "1978-11-08",
      phone: "+31 6 55512345",
      eritreanIdNumber: "ER-1978-001209",
      address: "Leidseweg 78, Den Haag",
    },
  });

  const citizen4 = await db.user.upsert({
    where: { email: "selam@demo.nl" },
    update: {},
    create: {
      email: "selam@demo.nl",
      passwordHash: citizenHash,
      role: "CITIZEN",
      firstName: "Selam",
      lastName: "Woldemichael",
      dateOfBirth: "1995-04-30",
      phone: "+31 6 23456789",
      eritreanIdNumber: "ER-1995-009312",
      address: "Koningsplein 3, Utrecht",
    },
  });

  const citizen5 = await db.user.upsert({
    where: { email: "henok@demo.nl" },
    update: {},
    create: {
      email: "henok@demo.nl",
      passwordHash: citizenHash,
      role: "CITIZEN",
      firstName: "Henok",
      lastName: "Gebremeskel",
      dateOfBirth: "1982-09-14",
      phone: "+31 6 34567890",
      eritreanIdNumber: "ER-1982-004567",
      address: "Admiraliteitskade 22, Rotterdam",
    },
  });

  const citizen6 = await db.user.upsert({
    where: { email: "miriam@demo.nl" },
    update: {},
    create: {
      email: "miriam@demo.nl",
      passwordHash: citizenHash,
      role: "CITIZEN",
      firstName: "Miriam",
      lastName: "Tekeste",
      dateOfBirth: "1970-12-01",
      phone: "+31 6 45678901",
      eritreanIdNumber: "ER-1970-000892",
      address: "Kloosterstraat 9, Den Haag",
    },
  });

  const citizen7 = await db.user.upsert({
    where: { email: "yonas@demo.nl" },
    update: {},
    create: {
      email: "yonas@demo.nl",
      passwordHash: citizenHash,
      role: "CITIZEN",
      firstName: "Yonas",
      lastName: "Araya",
      dateOfBirth: "1988-06-20",
      phone: "+31 6 56789012",
      eritreanIdNumber: "ER-1988-005632",
      address: "Bloemenmarkt 1, Amsterdam",
    },
  });

  // ─── Family members ───────────────────────────────────────
  await db.familyMember.upsert({
    where: { id: "family-demo-1" },
    update: {},
    create: { id: "family-demo-1", userId: citizen1.id, firstName: "Sara", lastName: "Tesfamariam", dateOfBirth: "1987-06-10", relationship: "partner" },
  });
  await db.familyMember.upsert({
    where: { id: "family-demo-2" },
    update: {},
    create: { id: "family-demo-2", userId: citizen1.id, firstName: "Mikael", lastName: "Tesfamariam", dateOfBirth: "2015-02-28", relationship: "kind" },
  });
  await db.familyMember.upsert({
    where: { id: "family-demo-3" },
    update: {},
    create: { id: "family-demo-3", userId: citizen1.id, firstName: "Liya", lastName: "Tesfamariam", dateOfBirth: "2018-09-05", relationship: "kind" },
  });
  await db.familyMember.upsert({
    where: { id: "family-demo-4" },
    update: {},
    create: { id: "family-demo-4", userId: citizen3.id, firstName: "Tigist", lastName: "Berhane", dateOfBirth: "1980-03-22", relationship: "partner" },
  });
  await db.familyMember.upsert({
    where: { id: "family-demo-5" },
    update: {},
    create: { id: "family-demo-5", userId: citizen5.id, firstName: "Rahel", lastName: "Gebremeskel", dateOfBirth: "2010-07-11", relationship: "kind" },
  });

  // ─── Past appointments (for stats — 8 weken terug) ────────
  const pastAppts = [
    // W-8
    { id: "appt-p01", userId: citizen3.id, service: "visum", title: "Visum / Visa", date: workday(-38), time: "09:00", status: "ATTENDED" },
    { id: "appt-p02", userId: citizen6.id, service: "2pct", title: "2% Belasting / 2% Tax", date: workday(-37), time: "10:00", status: "ATTENDED" },
    // W-7
    { id: "appt-p03", userId: citizen2.id, service: "paspoort-nieuw", title: "Eritrees nieuw paspoort", date: workday(-33), time: "09:00", status: "ATTENDED" },
    { id: "appt-p04", userId: citizen7.id, service: "id-nieuw", title: "ID Nieuwe aanvragers", date: workday(-32), time: "09:30", status: "NO_SHOW" },
    { id: "appt-p05", userId: citizen4.id, service: "legalisatie", title: "Legalisatie van Documenten", date: workday(-31), time: "11:00", status: "ATTENDED" },
    // W-6
    { id: "appt-p06", userId: citizen5.id, service: "visum", title: "Visum / Visa", date: workday(-28), time: "09:00", status: "ATTENDED" },
    { id: "appt-p07", userId: citizen1.id, service: "paspoort-nieuw", title: "Eritrees nieuw paspoort", date: workday(-27), time: "09:30", status: "ATTENDED" },
    { id: "appt-p08", userId: citizen3.id, service: "belasting", title: "Belastingzaken", date: workday(-26), time: "10:00", status: "ATTENDED" },
    { id: "appt-p09", userId: citizen6.id, service: "volmacht", title: "Volmacht & Notariële Diensten", date: workday(-25), time: "10:30", status: "NO_SHOW" },
    // W-5
    { id: "appt-p10", userId: citizen7.id, service: "visum", title: "Visum / Visa", date: workday(-23), time: "09:00", status: "ATTENDED" },
    { id: "appt-p11", userId: citizen2.id, service: "burgerstand", title: "Burgerlijke Stand", date: workday(-22), time: "09:30", status: "ATTENDED" },
    { id: "appt-p12", userId: citizen4.id, service: "paspoort-nieuw", title: "Eritrees nieuw paspoort", date: workday(-21), time: "10:00", status: "ATTENDED" },
    // W-4
    { id: "appt-p13", userId: citizen1.id, service: "id-nieuw", title: "ID Nieuwe aanvragers", date: workday(-18), time: "09:00", status: "ATTENDED" },
    { id: "appt-p14", userId: citizen5.id, service: "legalisatie", title: "Legalisatie van Documenten", date: workday(-17), time: "09:30", status: "ATTENDED" },
    { id: "appt-p15", userId: citizen6.id, service: "visum", title: "Visum / Visa", date: workday(-16), time: "10:00", status: "ATTENDED" },
    { id: "appt-p16", userId: citizen3.id, service: "2pct", title: "2% Belasting / 2% Tax", date: workday(-15), time: "11:00", status: "NO_SHOW" },
    // W-3
    { id: "appt-p17", userId: citizen7.id, service: "paspoort-nieuw", title: "Eritrees nieuw paspoort", date: workday(-13), time: "09:00", status: "ATTENDED" },
    { id: "appt-p18", userId: citizen2.id, service: "visum", title: "Visum / Visa", date: workday(-12), time: "09:30", status: "ATTENDED" },
    { id: "appt-p19", userId: citizen4.id, service: "belasting", title: "Belastingzaken", date: workday(-11), time: "10:00", status: "ATTENDED" },
    { id: "appt-p20", userId: citizen1.id, service: "volmacht", title: "Volmacht & Notariële Diensten", date: workday(-10), time: "10:30", status: "ATTENDED" },
    // W-2
    { id: "appt-p21", userId: citizen5.id, service: "paspoort-nieuw", title: "Eritrees nieuw paspoort", date: workday(-8), time: "09:00", status: "ATTENDED" },
    { id: "appt-p22", userId: citizen6.id, service: "id-nieuw", title: "ID Nieuwe aanvragers", date: workday(-7), time: "09:30", status: "ATTENDED" },
    { id: "appt-p23", userId: citizen3.id, service: "visum", title: "Visum / Visa", date: workday(-6), time: "10:00", status: "ATTENDED" },
    { id: "appt-p24", userId: citizen7.id, service: "burgerstand", title: "Burgerlijke Stand", date: workday(-5), time: "10:30", status: "NO_SHOW" },
    // W-1 (vorige week)
    { id: "appt-p25", userId: citizen2.id, service: "legalisatie", title: "Legalisatie van Documenten", date: workday(-4), time: "09:00", status: "ATTENDED" },
    { id: "appt-p26", userId: citizen4.id, service: "visum", title: "Visum / Visa", date: workday(-3), time: "09:30", status: "ATTENDED" },
    { id: "appt-p27", userId: citizen1.id, service: "2pct", title: "2% Belasting / 2% Tax", date: workday(-2), time: "10:00", status: "ATTENDED" },
    { id: "appt-p28", userId: citizen5.id, service: "paspoort-nieuw", title: "Eritrees nieuw paspoort", date: workday(-1), time: "10:30", status: "ATTENDED" },
  ];

  for (const a of pastAppts) {
    await db.appointment.upsert({
      where: { id: a.id },
      update: {},
      create: { id: a.id, userId: a.userId, serviceId: a.service, serviceTitle: a.title, date: a.date, timeSlot: a.time, status: a.status, persons: "1" },
    });
  }

  // ─── Komende week (voor admin dashboard + dagschema demo) ──
  const upcoming = [
    { id: "appt-u01", userId: citizen1.id, service: "paspoort-nieuw", title: "Eritrees nieuw paspoort", date: workday(0), time: "09:00", status: "CONFIRMED", notes: "Eerste aanvraag" },
    { id: "appt-u02", userId: citizen2.id, service: "visum", title: "Visum / Visa", date: workday(0), time: "09:30", status: "CONFIRMED" },
    { id: "appt-u03", userId: citizen3.id, service: "id-nieuw", title: "ID Nieuwe aanvragers", date: workday(0), time: "10:00", status: "CONFIRMED" },
    { id: "appt-u04", userId: citizen4.id, service: "legalisatie", title: "Legalisatie van Documenten", date: workday(0), time: "10:30", status: "CONFIRMED", notes: "Huwelijksakte mee" },
    { id: "appt-u05", userId: citizen5.id, service: "2pct", title: "2% Belasting / 2% Tax", date: workday(0), time: "11:00", status: "CONFIRMED" },
    { id: "appt-u06", userId: citizen6.id, service: "belasting", title: "Belastingzaken", date: workday(1), time: "09:00", status: "CONFIRMED" },
    { id: "appt-u07", userId: citizen7.id, service: "paspoort-nieuw", title: "Eritrees nieuw paspoort", date: workday(1), time: "09:30", status: "CONFIRMED" },
    { id: "appt-u08", userId: citizen1.id, service: "volmacht", title: "Volmacht & Notariële Diensten", date: workday(2), time: "09:00", status: "CONFIRMED" },
    { id: "appt-u09", userId: citizen2.id, service: "burgerstand", title: "Burgerlijke Stand", date: workday(2), time: "09:30", status: "CONFIRMED" },
    { id: "appt-u10", userId: citizen3.id, service: "visum", title: "Visum / Visa", date: workday(3), time: "09:00", status: "CONFIRMED" },
    // Walk-in voor dagschema demo
    { id: "appt-u11", userId: admin.id, service: "walkin", title: "Walk-in — Paspoort verlengd", date: workday(0), time: "13:00", status: "CONFIRMED", walkIn: true },
  ];

  for (const a of upcoming) {
    await db.appointment.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        userId: a.userId,
        serviceId: a.service,
        serviceTitle: a.title,
        date: a.date,
        timeSlot: a.time,
        status: a.status,
        persons: "1",
        notes: (a as any).notes ?? null,
        walkIn: (a as any).walkIn ?? false,
      },
    });
  }

  // ─── Documenten (voor dossier demo) ───────────────────────
  const u01Id = "appt-u01";
  await db.document.upsert({
    where: { id: "doc-demo-1" },
    update: {},
    create: {
      id: "doc-demo-1",
      userId: citizen1.id,
      appointmentId: u01Id,
      filename: "paspoort-scan.pdf",
      originalName: "paspoort_abraham.pdf",
      mimeType: "application/pdf",
      size: 204800,
      status: "READY",
      statusNote: "Document geverifieerd en klaar voor afhalen",
      reusable: false,
    },
  });

  await db.document.upsert({
    where: { id: "doc-demo-2" },
    update: {},
    create: {
      id: "doc-demo-2",
      userId: citizen1.id,
      appointmentId: null,
      filename: "geboorteakte.pdf",
      originalName: "geboorteakte_abraham.pdf",
      mimeType: "application/pdf",
      size: 153600,
      status: "PENDING",
      reusable: true,
    },
  });

  await db.document.upsert({
    where: { id: "doc-demo-3" },
    update: {},
    create: {
      id: "doc-demo-3",
      userId: citizen2.id,
      appointmentId: null,
      filename: "visum-aanvraag.pdf",
      originalName: "visum_asmeret.pdf",
      mimeType: "application/pdf",
      size: 307200,
      status: "PENDING",
      reusable: false,
    },
  });

  await db.document.upsert({
    where: { id: "doc-demo-4" },
    update: {},
    create: {
      id: "doc-demo-4",
      userId: citizen3.id,
      appointmentId: null,
      filename: "huwelijksakte-vertaling.pdf",
      originalName: "huwelijksakte_dawit_en.pdf",
      mimeType: "application/pdf",
      size: 256000,
      status: "REJECTED",
      statusNote: "Vertaling niet gecertificeerd. Lever een officieel gecertificeerde vertaling aan.",
      reusable: false,
    },
  });

  await db.document.upsert({
    where: { id: "doc-demo-5" },
    update: {},
    create: {
      id: "doc-demo-5",
      userId: citizen4.id,
      appointmentId: null,
      filename: "id-kaart-scan.jpg",
      originalName: "id_selam.jpg",
      mimeType: "image/jpeg",
      size: 98304,
      status: "READY",
      statusNote: "Identiteitskaart klaar voor afhalen",
      reusable: true,
    },
  });

  // ─── 2% Tax payments ──────────────────────────────────────
  const groupId1 = "tax-group-1";
  const groupId2 = "tax-group-2";

  await db.taxPayment.upsert({
    where: { userId_year: { userId: citizen1.id, year: 2024 } },
    update: {},
    create: { userId: citizen1.id, year: 2024, amountPaid: 650, currency: "EUR", paymentGroupId: groupId1, paidAt: new Date("2025-02-15") },
  });
  await db.taxPayment.upsert({
    where: { userId_year: { userId: citizen1.id, year: 2025 } },
    update: {},
    create: { userId: citizen1.id, year: 2025, amountPaid: 680, currency: "EUR", paymentGroupId: groupId1, paidAt: new Date("2025-02-15") },
  });
  await db.taxPayment.upsert({
    where: { userId_year: { userId: citizen3.id, year: 2024 } },
    update: {},
    create: { userId: citizen3.id, year: 2024, amountPaid: 720, currency: "EUR", paymentGroupId: groupId2, paidAt: new Date("2025-03-10") },
  });
  await db.taxPayment.upsert({
    where: { userId_year: { userId: citizen5.id, year: 2025 } },
    update: {},
    create: { userId: citizen5.id, year: 2025, amountPaid: 590, currency: "EUR", paymentGroupId: "tax-group-3", paidAt: new Date("2025-04-22") },
  });
  await db.taxPayment.upsert({
    where: { userId_year: { userId: citizen6.id, year: 2023 } },
    update: {},
    create: { userId: citizen6.id, year: 2023, amountPaid: 800, currency: "EUR", paymentGroupId: "tax-group-4", paidAt: new Date("2024-11-05") },
  });
  await db.taxPayment.upsert({
    where: { userId_year: { userId: citizen6.id, year: 2024 } },
    update: {},
    create: { userId: citizen6.id, year: 2024, amountPaid: 800, currency: "EUR", paymentGroupId: "tax-group-4", paidAt: new Date("2024-11-05") },
  });

  // ─── Nieuws items ─────────────────────────────────────────
  const newsItems = [
    {
      id: "news-1",
      title: "Onafhankelijkheidsdag 2026 — Programma & Uitnodiging",
      category: "Aankondiging",
      summary: "De Eritrese gemeenschap in Nederland viert op 24 mei 2026 de 35e Onafhankelijkheidsdag. Aanmelden verplicht.",
      content: "De ambassade nodigt alle Eritrese gemeenschapsleden uit voor de viering van de 35e Onafhankelijkheidsdag op zaterdag 24 mei 2026. Het programma omvat een cultureel festival, toespraken en een gemeenschapslunch. Aanmelden via het portaal of per e-mail.",
      publishedAt: new Date("2026-05-19"),
      published: true,
    },
    {
      id: "news-2",
      title: "Nieuwe openingstijden per 1 april 2026",
      category: "Aankondiging",
      summary: "De ambassade is voortaan geopend van maandag t/m donderdag van 09:00–15:00 uur. Telefonisch bereikbaar tot 16:45.",
      content: "Vanaf 1 april 2026 hanteert de ambassade nieuwe openingstijden. De balie is open van maandag tot en met donderdag van 09:00 tot 15:00 uur, uitsluitend op afspraak. Telefonisch zijn wij bereikbaar tot 16:45 uur.",
      publishedAt: new Date("2026-03-11"),
      published: true,
    },
    {
      id: "news-3",
      title: "Operatie Fenkil Herdenking — 15 februari",
      category: "Nieuws",
      summary: "Op 15 februari herdenkt de Eritrese gemeenschap de bevrijding van Massawa in 1990. Ceremonie bij de ambassade.",
      content: "Op 15 februari 2026 herdenkt de Eritrese gemeenschap in Den Haag de historische bevrijding van Massawa in 1990. Er is een korte ceremonie bij de ambassade gevolgd door een gemeenschappelijk diner.",
      publishedAt: new Date("2026-02-10"),
      published: true,
    },
    {
      id: "news-4",
      title: "Consulaire diensten: Digitaal aanvragen nu mogelijk",
      category: "Nieuws",
      summary: "U kunt nu eenvoudig documenten digitaal uploaden bij uw afspraak. Dit scheelt tijd aan het loket.",
      content: "De ambassade heeft een nieuw portaal gelanceerd waarmee u documenten digitaal kunt uploaden vóór uw afspraak. Dit vermindert de wachttijd aan het loket aanzienlijk. Log in op het portaal om uw documenten alvast klaar te zetten.",
      publishedAt: new Date("2026-01-20"),
      published: true,
    },
    {
      id: "news-5",
      title: "Waarschuwing: Valse ambassade-websites in omloop",
      category: "Aankondiging",
      summary: "Er circuleren valse websites die zich voordoen als de Eritrese ambassade. Gebruik uitsluitend deze officiële website.",
      content: "De ambassade waarschuwt voor valse websites en sociale media-accounts die zich voordoen als de officiële Eritrese ambassade in Den Haag. Deze sites vragen om betaling en persoonlijke gegevens. De officiële website is de enige betrouwbare bron.",
      publishedAt: new Date("2025-12-05"),
      published: true,
    },
  ];

  for (const n of newsItems) {
    await db.newsItem.upsert({
      where: { id: n.id },
      update: {},
      create: n,
    });
  }

  // ─── Site settings (banner) ───────────────────────────────
  await db.siteSetting.upsert({
    where: { key: "banner_active" },
    update: { value: "true" },
    create: { key: "banner_active", value: "true" },
  });
  await db.siteSetting.upsert({
    where: { key: "banner_type" },
    update: { value: "warning" },
    create: { key: "banner_type", value: "warning" },
  });
  await db.siteSetting.upsert({
    where: { key: "banner_text" },
    update: { value: "De ambassade is gesloten op vrijdag 30 mei 2026 wegens een nationale feestdag. Afspraken op deze datum worden verzet." },
    create: { key: "banner_text", value: "De ambassade is gesloten op vrijdag 30 mei 2026 wegens een nationale feestdag. Afspraken op deze datum worden verzet." },
  });

  console.log("✅ Seed voltooid!");
  console.log("\n📋 Demo accounts:");
  console.log("  Admin:      admin@eritreanembassy.nl      / admin123");
  console.log("  Medewerker: medewerker@eritreanembassy.nl / medewerker123");
  console.log("  Burger 1:   abraham@demo.nl               / burger123");
  console.log("  Burger 2:   asmeret@demo.nl               / burger123");
  console.log("\n📊 Aangemaakt:");
  console.log("  - 7 burgers, 5 familieleden");
  console.log("  - 28 afgelopen afspraken (stats), 11 komende afspraken");
  console.log("  - 5 documenten (READY/PENDING/REJECTED)");
  console.log("  - 6 belastingbetalingen");
  console.log("  - 5 nieuwsartikelen");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
