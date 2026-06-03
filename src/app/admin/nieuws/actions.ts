"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function saveNewsItemAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Geen toegang." };
  }

  const id = formData.get("id") as string | null;
  const title = (formData.get("title") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim();
  const content = (formData.get("content") as string)?.trim() || null;
  const category = (formData.get("category") as string) || "Aankondiging";
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const publishedAtStr = formData.get("publishedAt") as string;
  const published = formData.get("published") === "on";

  if (!title || !summary) {
    return { error: "Titel en samenvatting zijn verplicht." };
  }

  const publishedAt = publishedAtStr
    ? new Date(publishedAtStr + "T12:00:00")
    : new Date();

  if (id) {
    // Update existing
    await db.newsItem.update({
      where: { id },
      data: { title, summary, content, category, imageUrl, publishedAt, published },
    });
  } else {
    // Create new
    await db.newsItem.create({
      data: { title, summary, content, category, imageUrl, publishedAt, published },
    });
  }

  revalidatePath("/admin/nieuws");
  revalidatePath("/nieuws");

  return { success: true };
}
