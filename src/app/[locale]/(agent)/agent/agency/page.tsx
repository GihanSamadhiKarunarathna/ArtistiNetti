import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { requireRole } from "@/lib/auth"
import { UpdateAgencyForm } from "@/components/features/agency/update-agency-form"
import { InviteStaffForm } from "@/components/features/agency/invite-staff-form"
import { getOwnAgentProfile } from "@/server/services/agent"

export default async function AgentAgencyPage() {
  const user = await requireRole("AGENT")
  const agentProfile = await getOwnAgentProfile(user.id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Agency settings</h1>
        <p className="text-muted-foreground">
          Manage your agency&apos;s details and staff.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agency details</CardTitle>
        </CardHeader>
        <CardContent>
          {agentProfile.isPrimaryAdmin ? (
            <UpdateAgencyForm
              name={agentProfile.agency.name}
              businessId={agentProfile.agency.businessId}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Only the primary admin can edit agency details.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Staff</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {agentProfile.agency.staff.map((staff) => (
              <li
                key={staff.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span>
                  {staff.user.name ?? staff.user.email}{" "}
                  <span className="text-muted-foreground">({staff.user.email})</span>
                </span>
                {staff.isPrimaryAdmin && <Badge variant="secondary">Primary admin</Badge>}
              </li>
            ))}
          </ul>
          {agentProfile.isPrimaryAdmin && <InviteStaffForm />}
        </CardContent>
      </Card>
    </div>
  )
}
