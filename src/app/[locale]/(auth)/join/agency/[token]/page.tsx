import { AcceptInviteForm } from "@/components/features/agency/accept-invite-form"
import { acceptAgencyInviteAction } from "@/server/actions/agency"
import { getAgencyInvite } from "@/server/services/agency"

export default async function JoinAgencyPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  let invite
  let errorMessage: string | null = null
  try {
    invite = await getAgencyInvite(token)
  } catch (error) {
    errorMessage =
      error instanceof Error && error.message === "ALREADY_ACCEPTED"
        ? "This invite has already been used."
        : error instanceof Error && error.message === "EXPIRED"
          ? "This invite has expired. Ask for a new one."
          : "This invite link isn't valid."
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl font-semibold">Join {invite?.agency.name ?? "an agency"}</h1>
        <p className="text-sm text-muted-foreground">
          {invite ? `Set a password to join as ${invite.name ?? invite.email}.` : errorMessage}
        </p>
      </div>
      {invite && (
        <AcceptInviteForm action={acceptAgencyInviteAction.bind(null, token)} />
      )}
    </div>
  )
}
