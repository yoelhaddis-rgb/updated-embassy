"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { sendAppointmentConfirmation, sendCancellationConfirmation } from "@/lib/email";
import { getServiceInfo } from "@/lib/services";

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

  // Fetch user email for confirmation
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { email: true, firstName: true, lastName: true },
  });

  if (user) {
    // Fire-and-forget: don't block the response on email sending
    const serviceInfo = getServiceInfo(serviceId);
    sendAppointmentConfirmation({
      to: user.email,
      firstName: user.firstName,
      serviceTitle,
      date,
      timeSlot,
      appointmentId: appointment.id,
      requiredDocs: serviceInfo?.requiredDocs,
    }).catch((err) => console.error("Email send failed:", err));
  }

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

  const appointment = await db.appointment.update({
    where: { id: appointmentId, userId: session.id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/mijn-account");

  // Send cancellation confirmation email
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { email: true, firstName: true },
  });

  if (user) {
    sendCancellationConfirmation({
      to: user.email,
      firstName: user.firstName,
      serviceTitle: appointment.serviceTitle,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
    }).catch((err) => console.error("Cancel email failed:", err));
  }

  return { success: true };
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: "CONFIRMED" | "CANCELLED" | "ATTENDED" | "NO_SHOW"
) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return { error: "Geen toegang." };
  }

  await db.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });

  revalidatePath("/admin/afspraken");
  revalidatePath("/admin");
  return { success: true };
}

export async function updatePaymentStatusAction(
  appointmentId: string,
  paymentStatus: "NONE" | "PENDING" | "PAID" | "WAIVED"
) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return { error: "Geen toegang." };
  }

  await db.appointment.update({
    where: { id: appointmentId },
    data: { paymentStatus },
  });

  revalidatePath("/admin/afspraken");
  return { success: true };
}

export async function createWalkInAction(data: {
  serviceId: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  notes?: string;
}) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return { error: "Geen toegang." };
  }

  // Find or create the system walk-in user
  const WALKIN_EMAIL = "walkin@ambassade.internal";
  let walkInUser = await db.user.findUnique({ where: { email: WALKIN_EMAIL } });
  if (!walkInUser) {
    walkInUser = await db.user.create({
      data: {
        email: WALKIN_EMAIL,
        passwordHash: "SYSTEM_ACCOUNT_NO_LOGIN",
        role: "CITIZEN",
        firstName: "Inloper",
        lastName: "",
      },
    });
  }

  await db.appointment.create({
    data: {
      userId: walkInUser.id,
      serviceId: data.serviceId,
      serviceTitle: data.serviceTitle,
      date: data.date,
      timeSlot: data.timeSlot,
      notes: data.notes || null,
      status: "CONFIRMED",
      walkIn: true,
    },
  });

  revalidatePath("/admin/dagschema");
  return { success: true };
}

export async function rescheduleAppointmentAction(
  appointmentId: string,
  newDate: string,
  newTimeSlot: string
) {
  const session = await getSession();
  if (!session) return { error: "Niet ingelogd." };

  // Check if new slot is available
  const existing = await db.appointment.findFirst({
    where: { date: newDate, timeSlot: newTimeSlot, status: "CONFIRMED", NOT: { id: appointmentId } },
  });
  if (existing) return { error: "Dit tijdslot is al bezet. Kies een ander tijdstip." };

  const appointment = await db.appointment.update({
    where: { id: appointmentId, userId: session.id },
    data: { date: newDate, timeSlot: newTimeSlot },
  });

  revalidatePath("/mijn-account");

  // Send confirmation email for the new date
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { email: true, firstName: true, lastName: true },
  });

  if (user) {
    const serviceInfo = getServiceInfo(appointment.serviceId);
    sendAppointmentConfirmation({
      to: user.email,
      firstName: user.firstName,
      serviceTitle: appointment.serviceTitle,
      date: newDate,
      timeSlot: newTimeSlot,
      appointmentId: appointment.id,
      requiredDocs: serviceInfo?.requiredDocs,
    }).catch((err) => console.error("Reschedule email failed:", err));
  }

  return { success: true };
}
