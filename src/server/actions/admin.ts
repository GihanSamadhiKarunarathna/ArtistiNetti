"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import { setUserStatus } from "@/server/services/admin"

export async function setUserStatusAction(
  userId: string,
  status: "APPROVED" | "REJECTED" | "SUSPENDED",
) {
  await requireRole("ADMIN")
  await setUserStatus(userId, status)
  revalidatePath("/admin/users")
  revalidatePath("/admin/artists")
  revalidatePath("/admin")
}
