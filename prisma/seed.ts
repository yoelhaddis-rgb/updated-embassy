import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const db = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding demo data...");

  // Admin account
  const adminHash = await bcrypt.hash("admin123", 12);
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

  // Staff accounts
  const staffHash = await bcrypt.hash("medewerker123", 12);
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

  // Demo citizen accounts
  const citizenHash = await bcrypt.hash("burger123", 12);

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

  await db.user.upsert({
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

  // Family members for citizen1
  await db.familyMember.upsert({
    where: { id: "family-demo-1" },
    update: {},
    create: {
      id: "family-demo-1",
      userId: citizen1.id,
      firstName: "Sara",
      lastName: "Tesfamariam",
      dateOfBirth: "1987-06-10",
      relationship: "partner",
    },
  });

  await db.familyMember.upsert({
    where: { id: "family-demo-2" },
    update: {},
    create: {
      id: "family-demo-2",
      userId: citizen1.id,
      firstName: "Mikael",
      lastName: "Tesfamariam",
      dateOfBirth: "2015-02-28",
      relationship: "kind",
    },
  });

  // Demo appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  // Skip to Monday if weekend
  while (tomorrow.getDay() === 0 || tomorrow.getDay() === 5 || tomorrow.getDay() === 6) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  while (dayAfter.getDay() === 0 || dayAfter.getDay() === 5 || dayAfter.getDay() === 6) {
    dayAfter.setDate(dayAfter.getDate() + 1);
  }
  const dayAfterStr = dayAfter.toISOString().split("T")[0];

  await db.appointment.upsert({
    where: { id: "appt-demo-1" },
    update: {},
    create: {
      id: "appt-demo-1",
      userId: citizen1.id,
      serviceId: "paspoort-nieuw",
      serviceTitle: "Eritrees nieuw paspoort",
      date: tomorrowStr,
      timeSlot: "09:00",
      status: "CONFIRMED",
      persons: "1",
    },
  });

  await db.appointment.upsert({
    where: { id: "appt-demo-2" },
    update: {},
    create: {
      id: "appt-demo-2",
      userId: citizen2.id,
      serviceId: "visum",
      serviceTitle: "Visum / Visa",
      date: tomorrowStr,
      timeSlot: "09:30",
      status: "CONFIRMED",
      persons: "1",
    },
  });

  await db.appointment.upsert({
    where: { id: "appt-demo-3" },
    update: {},
    create: {
      id: "appt-demo-3",
      userId: citizen1.id,
      serviceId: "id-nieuw",
      serviceTitle: "ID Nieuwe aanvragers",
      date: dayAfterStr,
      timeSlot: "10:00",
      status: "CONFIRMED",
      persons: "1",
    },
  });

  console.log("✅ Seed voltooid!");
  console.log("\n📋 Demo accounts:");
  console.log("  Admin:      admin@eritreanembassy.nl     / admin123");
  console.log("  Medewerker: medewerker@eritreanembassy.nl / medewerker123");
  console.log("  Burger 1:   abraham@demo.nl              / burger123");
  console.log("  Burger 2:   asmeret@demo.nl              / burger123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
