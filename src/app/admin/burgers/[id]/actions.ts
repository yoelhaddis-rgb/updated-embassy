"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { sendDocumentReadyNotification } from "@/lib/email";

export async function updateDocumentStatusAction(
  documentId: string,
  status: "PENDING" | "READY" | "REJECTED",
  statusNote?: string
) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return { error: "Geen toegang." };
  }

  const document = await db.document.update({
    where: { id: documentId },
    data: { status, statusNote: statusNote ?? null },
    include: { user: true },
  });

  if (status === "READY") {
    // Fire-and-forget — don't await, don't block the response
    sendDocumentReadyNotification({
      to: document.user.email,
      firstName: document.user.firstName,
      originalName: document.originalName,
    }).catch((err) => console.error("❌ Document ready email fout:", err));
  }

  revalidatePath("/admin/burgers");
  return { success: true };
}
