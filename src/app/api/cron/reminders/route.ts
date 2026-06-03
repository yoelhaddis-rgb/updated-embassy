import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAppointmentReminder } from "@/lib/email";

// GET /api/cron/reminders
// Call this via a cron job every day at e.g. 09:00 to send reminders for tomorrow's appointments.
// Protect with CRON_SECRET env var (set this in production).
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (
    process.env.CRON_SECRET &&
    secret !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Calculate tomorrow's date string
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  // Fetch all confirmed appointments for tomorrow
  const appointments = await db.appointment.findMany({
    where: { date: tomorrowStr, status: "CONFIRMED" },
    include: {
      user: { select: { email: true, firstName: true } },
    },
  });

  if (appointments.length === 0) {
    return NextResponse.json({ message: "Geen afspraken morgen", sent: 0 });
  }

  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const appt of appointments) {
    const result = await sendAppointmentReminder({
      to: appt.user.email,
      firstName: appt.user.firstName,
      serviceTitle: appt.serviceTitle,
      date: appt.date,
      timeSlot: appt.timeSlot,
      appointmentId: appt.id,
    });
    results.push({
      email: appt.user.email,
      success: result.success,
      error: result.error,
    });
  }

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`📧 Herinneringen: ${sent} verstuurd, ${failed} mislukt voor ${tomorrowStr}`);

  return NextResponse.json({
    date: tomorrowStr,
    total: appointments.length,
    sent,
    failed,
    results,
  });
}
