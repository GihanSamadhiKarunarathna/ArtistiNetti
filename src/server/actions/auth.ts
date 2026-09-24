"use server"

import { AuthError } from "next-auth"
import { signIn } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  loginSchema,
  registerAgentSchema,
  registerArtistSchema,
} from "@/lib/validation/auth"
import { registerAgent, registerArtist } from "@/server/services/auth"

export type ActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
} | null

const DASHBOARD_BY_ROLE: Record<string, string> = {
  ADMIN: "/admin",
  ARTIST: "/artist/dashboard",
  AGENT: "/agent/dashboard",
  CLIENT: "/client/quotes",
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: "invalidCredentials" }
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { role: true },
  })
  const redirectTo = user ? (DASHBOARD_BY_ROLE[user.role] ?? "/") : "/"

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "invalidCredentials" }
    }
    throw error
  }

  return null
}

function fieldErrorsFrom(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> }
}) {
  const { fieldErrors } = error.flatten()
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([, v]) => v && v.length > 0),
  ) as Record<string, string[]>
}

export async function registerArtistAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerArtistSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    bandName: formData.get("bandName"),
    genres: formData.getAll("genres"),
    city: formData.get("city"),
    region: formData.get("region") || undefined,
    streetAddress: formData.get("streetAddress") || undefined,
    postalCode: formData.get("postalCode") || undefined,
    country: formData.get("country") || "FI",
    bio: formData.get("bio") || undefined,
    eventTypes: formData.getAll("eventTypes"),
    minBudgetEur: formData.get("minBudgetEur") || undefined,
  })

  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  try {
    await registerArtist(parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return { fieldErrors: { email: ["emailTaken"] } }
    }
    throw error
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/artist/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) return { error: "invalidCredentials" }
    throw error
  }

  return null
}

export async function registerAgentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerAgentSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    agencyName: formData.get("agencyName"),
    businessId: formData.get("businessId") || "",
    city: formData.get("city") || undefined,
    commissionPct: formData.get("commissionPct") || undefined,
  })

  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  try {
    await registerAgent(parsed.data)
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return { fieldErrors: { email: ["emailTaken"] } }
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { fieldErrors: { businessId: ["businessIdTaken"] } }
    }
    throw error
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/agent/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) return { error: "invalidCredentials" }
    throw error
  }

  return null
}
