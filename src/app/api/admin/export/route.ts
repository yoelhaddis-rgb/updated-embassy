import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

// GET /api/admin/export?from=YYYY-MM-DD&to=YYYY-MM-DD&status=CONFIRMED
// Returns appointments as CSV file for download.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, string>).gte = from;
    if (to) (where.date as Record<string, string>).lte = to;
  }

  const appointments = await db.appointment.findMany({
    where,
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, eritreanIdNumber: true } },
    },
    orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
  });

  // Build CSV
  const headers = [
    "ID",
    "Datum",
    "Tijdstip",
    "Voornaam",
    "Achternaam",
    "Email",
    "Telefoon",
    "Eritrees ID",
    "Dienst",
    "Status",
    "Betalingsstatus",
    "Notities",
    "Aangemaakt",
  ];

  function escapeCsv(val: string | null | undefined): string {
    if (val == null) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const rows = appointments.map((appt) => [
    appt.id,
    appt.date,
    appt.timeSlot,
    appt.user.firstName,
    appt.user.lastName,
    appt.user.email,
    appt.user.phone ?? "",
    appt.user.eritreanIdNumber ?? "",
    appt.serviceTitle,
    appt.status,
    appt.paymentStatus,
    appt.notes ?? "",
    new Date(appt.createdAt).toISOString().split("T")[0],
  ].map(escapeCsv).join(","));

  const csv = [headers.join(","), ...rows].join("\n");

  const fileName = `afspraken-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
