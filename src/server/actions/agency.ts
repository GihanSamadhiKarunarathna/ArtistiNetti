"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import {
  acceptInviteSchema,
  inviteAgencyStaffSchema,
  inviteBandMemberSchema,
  switchAgencySchema,
  updateAgencySchema,
} from "@/lib/validation/agency"
import {
  acceptAgencyInvite,
  acceptBandInvite,
  createAgencyInvite,
  createBandInvite,
  revertToSelfManaged,
  switchArtistAgency,
  updateAgency,
} from "@/server/services/agency"
import type { ActionState } from "./auth"

function fieldErrorsFrom(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> }
}) {
  const { fieldErrors } = error.flatten()
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([, v]) => v && v.length > 0),
  ) as Record<string, string[]>
}

const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

export type AcceptInviteState = {
  error?: string | null
  fieldErrors?: Record<string, string[]>
  success?: boolean
} | null

export async function switchAgencyAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("ARTIST")
  const parsed = switchAgencySchema.safeParse({
    businessId: formData.get("businessId"),
  })
  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  try {
    await switchArtistAgency(user.id, parsed.data.businessId)
  } catch (error) {
    if (error instanceof Error && error.message === "AGENCY_NOT_FOUND") {
      return { error: "agencyNotFound" }
    }
    if (error instanceof Error && error.message === "ALREADY_REPRESENTED") {
      return { error: "alreadyRepresented" }
    }
    throw error
  }

  revalidatePath("/artist/agency")
  return { error: "saved" }
}

export async function revertToSelfManagedAction() {
  const user = await requireRole("ARTIST")
  await revertToSelfManaged(user.id)
  revalidatePath("/artist/agency")
}

export async function updateAgencyAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("AGENT")
  const parsed = updateAgencySchema.safeParse({
    name: formData.get("name"),
    businessId: formData.get("businessId") || "",
  })
  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  await updateAgency(user.id, parsed.data)
  revalidatePath("/agent/agency")
  return { error: "saved" }
}

export async function inviteAgencyStaffAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("AGENT")
  const parsed = inviteAgencyStaffSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
  })
  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  let invite
  try {
    invite = await createAgencyInvite(user.id, parsed.data.email, parsed.data.name)
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return { fieldErrors: { email: ["An account with this email already exists."] } }
    }
    throw error
  }

  await sendEmail({
    to: parsed.data.email,
    subject: "You've been invited to join an agency on ArtistiNetti",
    html: `<p>${parsed.data.name}, you've been invited to join an agency on ArtistiNetti.</p><p><a href="${APP_URL}/join/agency/${invite.token}">Accept invitation</a></p>`,
  })

  revalidatePath("/agent/agency")
  return { error: "saved" }
}

export async function inviteBandMemberAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("ARTIST")
  const parsed = inviteBandMemberSchema.safeParse({
    email: formData.get("email"),
    displayName: formData.get("displayName"),
    instrument: formData.get("instrument") || undefined,
  })
  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  let invite
  try {
    invite = await createBandInvite(user.id, parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return { fieldErrors: { email: ["An account with this email already exists."] } }
    }
    throw error
  }

  await sendEmail({
    to: parsed.data.email,
    subject: "You've been invited to join a band on ArtistiNetti",
    html: `<p>${parsed.data.displayName}, you've been invited to join a band on ArtistiNetti.</p><p><a href="${APP_URL}/join/band/${invite.token}">Accept invitation</a></p>`,
  })

  revalidatePath("/artist/profile")
  return { error: "saved" }
}

export async function acceptAgencyInviteAction(
  token: string,
  _prevState: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const parsed = acceptInviteSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  try {
    await acceptAgencyInvite(token, parsed.data.password)
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_ACCEPTED") {
      return { error: "alreadyAccepted" }
    }
    if (error instanceof Error && error.message === "EXPIRED") {
      return { error: "expired" }
    }
    throw error
  }

  return { success: true, error: null }
}

export async function acceptBandInviteAction(
  token: string,
  _prevState: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const parsed = acceptInviteSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  try {
    await acceptBandInvite(token, parsed.data.password)
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_ACCEPTED") {
      return { error: "alreadyAccepted" }
    }
    if (error instanceof Error && error.message === "EXPIRED") {
      return { error: "expired" }
    }
    throw error
  }

  return { success: true, error: null }
}
