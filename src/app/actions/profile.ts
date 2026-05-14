"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Niet ingelogd." };

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const dateOfBirth = (formData.get("dateOfBirth") as string)?.trim();
  const eritreanIdNumber = (formData.get("eritreanIdNumber") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();

  if (!firstName || !lastName) return { error: "Voornaam en achternaam zijn verplicht." };

  await db.user.update({
    where: { id: session.id },
    data: {
      firstName,
      lastName,
      phone: phone || null,
      dateOfBirth: dateOfBirth || null,
      eritreanIdNumber: eritreanIdNumber || null,
      address: address || null,
    },
  });

  revalidatePath("/mijn-account");
  revalidatePath("/mijn-account/profiel");
  return { success: true };
}

export async function addFamilyMemberAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Niet ingelogd." };

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const dateOfBirth = (formData.get("dateOfBirth") as string)?.trim();
  const relationship = (formData.get("relationship") as string)?.trim();

  if (!firstName || !lastName || !relationship) return { error: "Naam en relatie zijn verplicht." };

  await db.familyMember.create({
    data: {
      userId: session.id,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || null,
      relationship,
    },
  });

  revalidatePath("/mijn-account");
  revalidatePath("/mijn-account/familie");
  return { success: true };
}

export async function deleteFamilyMemberAction(memberId: string) {
  const session = await getSession();
  if (!session) return { error: "Niet ingelogd." };

  await db.familyMember.deleteMany({
    where: { id: memberId, userId: session.id },
  });

  revalidatePath("/mijn-account/familie");
  return { success: true };
}
