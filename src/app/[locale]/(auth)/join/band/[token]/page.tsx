import { AcceptInviteForm } from "@/components/features/agency/accept-invite-form"
import { acceptBandInviteAction } from "@/server/actions/agency"
import { getBandInvite } from "@/server/services/agency"

export default async function JoinBandPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  let invite
  let errorMessage: string | null = null
  try {
    invite = await getBandInvite(token)
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
        <h1 className="text-2xl font-semibold">
          Join {invite?.artistProfile.bandName ?? "a band"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {invite ? `Set a password to join as ${invite.displayName}.` : errorMessage}
        </p>
      </div>
      {invite && <AcceptInviteForm action={acceptBandInviteAction.bind(null, token)} />}
    </div>
  )
}
