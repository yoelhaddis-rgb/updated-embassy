import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendTaxReminder } from "@/lib/email";

// GET /api/cron/tax-reminders?secret=...
// Run this every year in October/November.
// Finds all users whose last paid tax year <= current year and sends a reminder.
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentYear = new Date().getFullYear();

  // Find all users who have at least one tax payment
  // Group by userId, get the max year paid
  const payments = await db.taxPayment.findMany({
    select: { userId: true, year: true },
  });

  if (payments.length === 0) {
    return NextResponse.json({ message: "Geen belastingbetalers gevonden", sent: 0 });
  }

  // Build map: userId → maxYear
  const maxYearByUser = new Map<string, number>();
  for (const p of payments) {
    const current = maxYearByUser.get(p.userId) ?? 0;
    if (p.year > current) maxYearByUser.set(p.userId, p.year);
  }

  // Only notify users whose last paid year <= current year
  const toNotify = [...maxYearByUser.entries()].filter(
    ([, lastYear]) => lastYear <= currentYear
  );

  if (toNotify.length === 0) {
    return NextResponse.json({
      message: "Iedereen is al betaald voor volgend jaar",
      sent: 0,
    });
  }

  // Fetch user details
  const userIds = toNotify.map(([id]) => id);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, firstName: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));
  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const [userId, lastPaidYear] of toNotify) {
    const user = userMap.get(userId);
    if (!user) continue;

    const result = await sendTaxReminder({
      to: user.email,
      firstName: user.firstName,
      lastPaidYear,
      nextYear: currentYear + 1,
    });

    results.push({ email: user.email, success: result.success, error: result.error });
  }

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`📧 Belasting-herinneringen: ${sent} verstuurd, ${failed} mislukt`);

  return NextResponse.json({ total: toNotify.length, sent, failed, results });
}
