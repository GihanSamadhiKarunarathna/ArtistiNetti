"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import { createAvailabilitySchema } from "@/lib/validation/availability"
import {
  createAvailabilityEntry,
  deleteAvailabilityEntry,
} from "@/server/services/availability"
import { getArtistProfileForMember } from "@/server/services/artist-profile"
import type { ActionState } from "./auth"

function fieldErrorsFrom(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> }
}) {
  const { fieldErrors } = error.flatten()
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([, v]) => v && v.length > 0),
  ) as Record<string, string[]>
}

export async function createAvailabilityAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("ARTIST")

  const parsed = createAvailabilitySchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    notes: formData.get("notes") || undefined,
    isPublicBusy: formData.get("isPublicBusy") === "on",
  })

  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  const profile = await getArtistProfileForMember(user.id)
  try {
    await createAvailabilityEntry(profile.id, {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
    })
  } catch (error) {
    if (error instanceof Error && error.message === "DATE_CONFLICT") {
      return { error: "dateConflict" }
    }
    throw error
  }

  revalidatePath("/artist/availability")
  return null
}

export async function deleteAvailabilityAction(entryId: string) {
  const user = await requireRole("ARTIST")
  await deleteAvailabilityEntry(user.id, entryId)
  revalidatePath("/artist/availability")
}
