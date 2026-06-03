"use server";

import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const dateOfBirth = formData.get("dateOfBirth") as string;

  if (!email || !password || !firstName || !lastName) {
    return { error: "Vul alle verplichte velden in." };
  }
  if (password.length < 6) {
    return { error: "Wachtwoord moet minimaal 6 tekens zijn." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Dit e-mailadres is al geregistreerd." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      phone: phone || null,
      dateOfBirth: dateOfBirth || null,
      role: "CITIZEN",
    },
  });

  await createSession({
    id: user.id,
    email: user.email,
    role: "CITIZEN",
    firstName: user.firstName,
    lastName: user.lastName,
  });

  redirect("/mijn-account");
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Vul e-mail en wachtwoord in." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Onbekend e-mailadres of onjuist wachtwoord." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Onbekend e-mailadres of onjuist wachtwoord." };
  }

  await createSession({
    id: user.id,
    email: user.email,
    role: user.role as "CITIZEN" | "STAFF" | "ADMIN",
    firstName: user.firstName,
    lastName: user.lastName,
  });

  if (user.role === "STAFF" || user.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/mijn-account");
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect("/inloggen");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { error: "Voer een e-mailadres in." };
  }

  // Always show success even if email not found (security)
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
  const resetUrl = `${baseUrl}/wachtwoord-resetten?token=${token}`;

  await sendPasswordResetEmail({
    to: user.email,
    firstName: user.firstName,
    resetUrl,
  });

  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  const token = (formData.get("token") as string)?.trim();
  const password = (formData.get("password") as string);
  const passwordConfirm = (formData.get("passwordConfirm") as string);

  if (!token || !password) {
    return { error: "Ongeldige aanvraag." };
  }

  if (password.length < 6) {
    return { error: "Wachtwoord moet minimaal 6 tekens zijn." };
  }

  if (password !== passwordConfirm) {
    return { error: "Wachtwoorden komen niet overeen." };
  }

  const resetToken = await db.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "Deze link is ongeldig of verlopen. Vraag een nieuwe aan." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });

  await db.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() },
  });

  redirect("/inloggen");
}
