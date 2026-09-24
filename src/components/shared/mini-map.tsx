"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const MiniMapInner = dynamic(
  () => import("./mini-map-inner").then((m) => m.MiniMapInner),
  { ssr: false, loading: () => <Skeleton className="size-full" /> },
)

export function MiniMap(props: { lat: number; lng: number; label: string }) {
  return <MiniMapInner {...props} />
}
