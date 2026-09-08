"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import { addArtistByEmail } from "@/server/services/agent"
import type { ActionState } from "./auth"

export async function addArtistByEmailAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("AGENT")
  const email = String(formData.get("email") ?? "").trim()
  if (!email) return { error: "validation" }

  try {
    await addArtistByEmail(user.id, email)
  } catch (error) {
    if (error instanceof Error && error.message === "ARTIST_NOT_FOUND") {
      return { error: "artistNotFound" }
    }
    if (error instanceof Error && error.message === "ALREADY_MANAGED") {
      return { error: "alreadyManaged" }
    }
    throw error
  }

  revalidatePath("/agent/artists")
  return null
}
