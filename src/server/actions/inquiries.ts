"use server"

import { revalidatePath } from "next/cache"
import { signIn } from "@/lib/auth"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createInquirySchema } from "@/lib/validation/inquiry"
import { createInquiry, updateInquiryStatus } from "@/server/services/inquiries"

function fieldErrorsFrom(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> }
}) {
  const { fieldErrors } = error.flatten()
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(([, v]) => v && v.length > 0),
  ) as Record<string, string[]>
}

export type SubmitInquiryState = {
  error?: string | null
  fieldErrors?: Record<string, string[]>
  success?: boolean
} | null

export async function submitInquiryAction(
  bandSlug: string,
  _prevState: SubmitInquiryState,
  formData: FormData,
): Promise<SubmitInquiryState> {
  const artist = await prisma.artistProfile.findFirst({
    where: { bandSlug, isPublished: true, approvalStatus: "APPROVED" },
    select: { id: true },
  })
  if (!artist) return { error: "notFound" }

  const parsed = createInquirySchema.safeParse({
    eventType: formData.get("eventType"),
    eventDate: formData.get("eventDate"),
    eventCity: formData.get("eventCity") || undefined,
    guestCount: formData.get("guestCount") || undefined,
    budgetMinEur: formData.get("budgetMinEur") || undefined,
    budgetMaxEur: formData.get("budgetMaxEur") || undefined,
    message: formData.get("message") || undefined,
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
  })

  if (!parsed.success) {
    return { error: "validation", fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  await createInquiry({
    artistProfileId: artist.id,
    ...parsed.data,
    eventDate: new Date(parsed.data.eventDate),
  })

  try {
    await signIn("resend", {
      email: parsed.data.contactEmail,
      redirect: false,
    })
  } catch {
    // Non-fatal: the inquiry was still created even if the magic-link email fails to send.
  }

  return { success: true, error: null }
}

export async function updateInquiryStatusAction(
  inquiryId: string,
  status: "IN_REVIEW" | "DECLINED" | "CANCELLED",
) {
  const user = await requireRole("ARTIST")
  await updateInquiryStatus(user.id, inquiryId, status)
  revalidatePath("/artist/inquiries")
  revalidatePath(`/artist/inquiries/${inquiryId}`)
}
