"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function saveBannerSettingAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Geen toegang." };

  const active = formData.get("active") === "on";
  const text = (formData.get("text") as string)?.trim() ?? "";
  const type = (formData.get("type") as string) ?? "warning";

  await db.siteSetting.upsert({
    where: { key: "banner_active" },
    create: { key: "banner_active", value: active ? "true" : "false" },
    update: { value: active ? "true" : "false" },
  });

  await db.siteSetting.upsert({
    where: { key: "banner_text" },
    create: { key: "banner_text", value: text },
    update: { value: text },
  });

  await db.siteSetting.upsert({
    where: { key: "banner_type" },
    create: { key: "banner_type", value: type },
    update: { value: type },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/instellingen");
  return { success: true };
}

export async function getBannerSettings() {
  const settings = await db.siteSetting.findMany({
    where: { key: { in: ["banner_active", "banner_text", "banner_type"] } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return {
    active: map.banner_active === "true",
    text: map.banner_text ?? "",
    type: (map.banner_type ?? "warning") as "warning" | "info" | "closed",
  };
}
