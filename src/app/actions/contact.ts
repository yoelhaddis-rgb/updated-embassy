"use server";

import { db } from "@/lib/db";
import { sendContactMessage } from "@/lib/email";

export async function sendContactMessageAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { error: "Vul alle verplichte velden in." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Voer een geldig e-mailadres in." };
  }

  const result = await sendContactMessage({
    name,
    email,
    subject: subject || "Algemeen",
    message,
  });

  if (!result.success) {
    return { error: "Het versturen van uw bericht is mislukt. Probeer het opnieuw." };
  }

  return { success: true };
}

export async function subscribeNewsletterAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Voer een geldig e-mailadres in." };
  }

  await db.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  return { success: true };
}
