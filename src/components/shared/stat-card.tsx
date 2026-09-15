import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  icon,
  action,
  accent = "primary",
}: {
  label: string
  value: string | number
  icon: ReactNode
  action?: ReactNode
  accent?: "primary" | "chart-2" | "chart-3" | "chart-4"
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-3xl font-semibold tabular-nums">{value}</p>
          {action && <div className="mt-2">{action}</div>}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl [&>svg]:size-5",
            accent === "primary" && "bg-primary/10 text-primary",
            accent === "chart-2" && "bg-chart-2/15 text-chart-2",
            accent === "chart-3" && "bg-chart-3/15 text-chart-3",
            accent === "chart-4" && "bg-chart-4/15 text-chart-4",
          )}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}
