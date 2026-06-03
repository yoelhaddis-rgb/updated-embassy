"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function registerTaxPaymentAction(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return { error: "Geen toegang." };
  }

  const userId = formData.get("userId") as string;
  const years = formData.getAll("years") as string[];
  const totalAmount = parseFloat(formData.get("totalAmount") as string);
  const paidAtStr = formData.get("paidAt") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!userId || years.length === 0 || isNaN(totalAmount) || totalAmount <= 0) {
    return { error: "Vul alle verplichte velden in." };
  }

  const paidAt = paidAtStr ? new Date(paidAtStr + "T12:00:00") : new Date();
  const amountPerYear = totalAmount / years.length;
  const paymentGroupId = years.length > 1 ? randomUUID() : null;
  const registeredByName = `${session.firstName} ${session.lastName}`;

  // Check for duplicate years
  const existing = await db.taxPayment.findMany({
    where: { userId, year: { in: years.map(Number) } },
    select: { year: true },
  });

  if (existing.length > 0) {
    const duplicates = existing.map((e) => e.year).join(", ");
    return { error: `Jaar ${duplicates} is al geregistreerd voor deze persoon.` };
  }

  await db.taxPayment.createMany({
    data: years.map((year) => ({
      userId,
      year: parseInt(year),
      amountPaid: amountPerYear,
      currency: "EUR",
      paidAt,
      paymentGroupId,
      registeredByName,
      notes,
    })),
  });

  revalidatePath(`/admin/burgers/${userId}`);
  return { success: true };
}

export async function deleteTaxPaymentAction(paymentId: string, userId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Alleen admins kunnen betalingen verwijderen." };
  }

  await db.taxPayment.delete({ where: { id: paymentId } });
  revalidatePath(`/admin/burgers/${userId}`);
  return { success: true };
}
