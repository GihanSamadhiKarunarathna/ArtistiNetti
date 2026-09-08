"use client"

import { useTransition } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { setUserStatusAction } from "@/server/actions/admin"

export type UserRow = {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  createdAt: string
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  APPROVED: "default",
  PENDING: "secondary",
  REJECTED: "destructive",
  SUSPENDED: "destructive",
}

function RowActions({ user }: { user: UserRow }) {
  const [isPending, startTransition] = useTransition()

  function act(status: "APPROVED" | "REJECTED" | "SUSPENDED") {
    startTransition(async () => {
      await setUserStatusAction(user.id, status)
      toast.success(`${user.email} is now ${status.toLowerCase()}`)
    })
  }

  return (
    <div className="flex justify-end gap-2">
      {user.status !== "APPROVED" && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => act("APPROVED")}>
          Approve
        </Button>
      )}
      {user.status !== "SUSPENDED" && user.status !== "REJECTED" && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => act("SUSPENDED")}>
          Suspend
        </Button>
      )}
      {user.status === "SUSPENDED" && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => act("APPROVED")}>
          Reinstate
        </Button>
      )}
    </div>
  )
}

const columns: ColumnDef<UserRow, unknown>[] = [
  { accessorKey: "name", header: "Name", cell: ({ row }) => row.original.name ?? "—" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status] ?? "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => format(new Date(row.original.createdAt), "d MMM yyyy"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <RowActions user={row.original} />,
  },
]

export function UsersTable({ users }: { users: UserRow[] }) {
  return <DataTable columns={columns} data={users} emptyMessage="No users yet" />
}
