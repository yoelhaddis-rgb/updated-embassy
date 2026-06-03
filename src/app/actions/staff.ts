"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createStaffAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Geen toegang. Alleen beheerders kunnen medewerkers toevoegen." };
  }

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string);
  const role = (formData.get("role") as string) as "STAFF" | "ADMIN";

  if (!firstName || !lastName || !email || !password) {
    return { error: "Vul alle verplichte velden in." };
  }

  if (password.length < 6) {
    return { error: "Wachtwoord moet minimaal 6 tekens zijn." };
  }

  if (!["STAFF", "ADMIN"].includes(role)) {
    return { error: "Ongeldige rol." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Dit e-mailadres is al geregistreerd." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role,
    },
  });

  revalidatePath("/admin/medewerkers");
  return { success: true };
}

export async function updateStaffRoleAction(staffId: string, role: "STAFF" | "ADMIN") {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Geen toegang. Alleen beheerders kunnen rollen wijzigen." };
  }

  if (session.id === staffId) {
    return { error: "U kunt uw eigen rol niet wijzigen." };
  }

  if (!["STAFF", "ADMIN"].includes(role)) {
    return { error: "Ongeldige rol." };
  }

  await db.user.update({
    where: { id: staffId },
    data: { role },
  });

  revalidatePath("/admin/medewerkers");
  return { success: true };
}
