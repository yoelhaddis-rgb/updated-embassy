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

  const appointments = await db.appointment.findMany({
    where: { date: today, status: { in: ["CONFIRMED", "ATTENDED", "NO_SHOW"] } },
    include: { user: { select: { firstName: true, lastName: true, phone: true } } },
    orderBy: { timeSlot: "asc" },
  });

  const staffUsers = await db.user.findMany({
    where: { role: { in: ["STAFF", "ADMIN"] } },
    select: { email: true, firstName: true },
  });

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
