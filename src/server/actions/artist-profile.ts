"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import { putFile } from "@/lib/storage"
import {
  addBandMemberSchema,
  updateArtistProfileSchema,
} from "@/lib/validation/artist-profile"
import {
  addBandMember,
  addGalleryImage,
  removeBandMember,
  setPublished,
  updateArtistProfile,
  updateMediaFields,
} from "@/server/services/artist-profile"
import type { ActionState } from "./auth"

function fieldErrorsFrom(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> }
}) {
  const { fieldErrors } = error.flatten()
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([, v]) => v && v.length > 0),
  ) as Record<string, string[]>
}

export async function updateArtistProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("ARTIST")

  const parsed = updateArtistProfileSchema.safeParse({
    bandName: formData.get("bandName"),
    bio: formData.get("bio") || undefined,
    bioEn: formData.get("bioEn") || undefined,
    genres: formData.getAll("genres"),
    eventTypes: formData.getAll("eventTypes"),
    city: formData.get("city"),
    region: formData.get("region") || undefined,
    minBudgetEur: formData.get("minBudgetEur") || undefined,
    maxBudgetEur: formData.get("maxBudgetEur") || undefined,
    spotifyUrl: formData.get("spotifyUrl") || "",
    youtubeUrl: formData.get("youtubeUrl") || "",
    websiteUrl: formData.get("websiteUrl") || "",
    instagramUrl: formData.get("instagramUrl") || "",
  })

  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  await updateArtistProfile(user.id, parsed.data)
  revalidatePath("/artist/profile")
  revalidatePath("/artist/dashboard")
  return { error: "saved" }
}

export async function togglePublishAction(isPublished: boolean) {
  const user = await requireRole("ARTIST")
  try {
    await setPublished(user.id, isPublished)
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_APPROVED") {
      return { error: "notApproved" as const }
    }
    throw error
  }
  revalidatePath("/artist/profile")
  revalidatePath("/artist/dashboard")
  return { error: null }
}

export async function uploadHeroImageAction(formData: FormData) {
  const user = await requireRole("ARTIST")
  const file = formData.get("file") as File | null
  if (!file || file.size === 0) return { error: "noFile" as const }

  const { url } = await putFile(file, "hero")
  await updateMediaFields(user.id, { heroImageUrl: url })
  revalidatePath("/artist/profile")
  return { error: null, url }
}

export async function uploadGalleryImageAction(formData: FormData) {
  const user = await requireRole("ARTIST")
  const file = formData.get("file") as File | null
  if (!file || file.size === 0) return { error: "noFile" as const }

  const { url } = await putFile(file, "gallery")
  await addGalleryImage(user.id, url)
  revalidatePath("/artist/profile")
  return { error: null, url }
}

export async function uploadTechRiderAction(formData: FormData) {
  const user = await requireRole("ARTIST")
  const file = formData.get("file") as File | null
  if (!file || file.size === 0) return { error: "noFile" as const }

  const { url } = await putFile(file, "tech-rider")
  await updateMediaFields(user.id, { techRiderUrl: url })
  revalidatePath("/artist/profile")
  return { error: null, url }
}

export async function uploadStagePlanAction(formData: FormData) {
  const user = await requireRole("ARTIST")
  const file = formData.get("file") as File | null
  if (!file || file.size === 0) return { error: "noFile" as const }

  const { url } = await putFile(file, "stage-plan")
  await updateMediaFields(user.id, { stagePlanUrl: url })
  revalidatePath("/artist/profile")
  return { error: null, url }
}

export async function addBandMemberAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("ARTIST")

  const parsed = addBandMemberSchema.safeParse({
    displayName: formData.get("displayName"),
    instrument: formData.get("instrument") || undefined,
    payoutSharePct: formData.get("payoutSharePct") || undefined,
  })

  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  await addBandMember(user.id, parsed.data)
  revalidatePath("/artist/profile")
  return null
}

export async function removeBandMemberAction(memberId: string) {
  const user = await requireRole("ARTIST")
  await removeBandMember(user.id, memberId)
  revalidatePath("/artist/profile")
}
