"use server";

import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

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
