import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PayoutBreakdown } from "@/server/services/payouts"

export function PayoutBreakdownCard({ breakdown }: { breakdown: PayoutBreakdown }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payout breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Gross amount</span>
          <span className="font-medium">{breakdown.grossEur}€</span>
        </div>
        {!breakdown.isSelfManaged && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {breakdown.agencyName} commission ({breakdown.commissionPct}%)
            </span>
            <span className="font-medium text-destructive">
              −{breakdown.commissionEur}€
            </span>
          </div>
        )}
        <div className="flex items-center justify-between border-t pt-2 font-medium">
          <span>Band pool</span>
          <span>{breakdown.netPoolEur}€</span>
        </div>
        <ul className="space-y-1.5 border-t pt-2">
          {breakdown.members.map((member) => (
            <li key={member.memberId} className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {member.displayName} ({member.sharePct.toFixed(0)}%)
              </span>
              <span>{member.amountEur}€</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
