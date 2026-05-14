"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createAppointmentAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Niet ingelogd." };

  const serviceId = formData.get("serviceId") as string;
  const serviceTitle = formData.get("serviceTitle") as string;
  const date = formData.get("date") as string;
  const timeSlot = formData.get("timeSlot") as string;
  const notes = formData.get("notes") as string;

  if (!serviceId || !date || !timeSlot) {
    return { error: "Vul alle verplichte velden in." };
  }

  // Check if slot is still available
  const existing = await db.appointment.findFirst({
    where: { date, timeSlot, status: "CONFIRMED" },
  });
  if (existing) {
    return { error: "Dit tijdslot is al bezet. Kies een ander tijdstip." };
  }

  const appointment = await db.appointment.create({
    data: {
      userId: session.id,
      serviceId,
      serviceTitle,
      date,
      timeSlot,
      notes: notes || null,
      status: "CONFIRMED",
    },
  });

  revalidatePath("/mijn-account");
  return { success: true, appointmentId: appointment.id };
}

export async function getAvailableSlots(date: string) {
  const booked = await db.appointment.findMany({
    where: { date, status: "CONFIRMED" },
    select: { timeSlot: true },
  });
  return booked.map(b => b.timeSlot);
}

export async function cancelAppointmentAction(appointmentId: string) {
  const session = await getSession();
  if (!session) return { error: "Niet ingelogd." };

  await db.appointment.update({
    where: { id: appointmentId, userId: session.id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/mijn-account");
  return { success: true };
}
