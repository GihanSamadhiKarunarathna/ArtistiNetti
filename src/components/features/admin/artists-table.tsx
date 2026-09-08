"use client"

import { useTransition } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { Link } from "@/i18n/navigation"
import { setUserStatusAction } from "@/server/actions/admin"

export type ArtistRow = {
  id: string
  bandName: string
  bandSlug: string
  city: string | null
  approvalStatus: string
  isPublished: boolean
  ownerId: string
  ownerEmail: string
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  APPROVED: "default",
  PENDING: "secondary",
  REJECTED: "destructive",
  SUSPENDED: "destructive",
}

function RowActions({ artist }: { artist: ArtistRow }) {
  const [isPending, startTransition] = useTransition()

  function act(status: "APPROVED" | "REJECTED" | "SUSPENDED") {
    startTransition(async () => {
      await setUserStatusAction(artist.ownerId, status)
      toast.success(`${artist.bandName} is now ${status.toLowerCase()}`)
    })
  }

  return (
    <div className="flex justify-end gap-2">
      {artist.approvalStatus !== "APPROVED" && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => act("APPROVED")}>
          Approve
        </Button>
      )}
      {artist.approvalStatus !== "REJECTED" && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => act("REJECTED")}>
          Reject
        </Button>
      )}
    </div>
  )
}

const columns: ColumnDef<ArtistRow, unknown>[] = [
  {
    accessorKey: "bandName",
    header: "Artist",
    cell: ({ row }) => (
      <Link href={`/${row.original.bandSlug}`} className="font-medium hover:underline">
        {row.original.bandName}
      </Link>
    ),
  },
  { accessorKey: "ownerEmail", header: "Email" },
  { accessorKey: "city", header: "City", cell: ({ row }) => row.original.city ?? "—" },
  {
    accessorKey: "approvalStatus",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.approvalStatus] ?? "secondary"}>
        {row.original.approvalStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "isPublished",
    header: "Published",
    cell: ({ row }) => (row.original.isPublished ? "Yes" : "No"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <RowActions artist={row.original} />,
  },
]

export function ArtistsTable({ artists }: { artists: ArtistRow[] }) {
  return <DataTable columns={columns} data={artists} emptyMessage="No artists yet" />
}
