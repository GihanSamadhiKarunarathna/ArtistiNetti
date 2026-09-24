"use client"

import "leaflet/dist/leaflet.css"
import { divIcon } from "leaflet"
import { MapContainer, Marker, TileLayer } from "react-leaflet"

const markerIcon = divIcon({
  className: "",
  html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:var(--color-primary);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

export function MiniMapInner({
  lat,
  lng,
  label,
}: {
  lat: number
  lng: number
  label: string
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={11}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      zoomControl={false}
      attributionControl={false}
      className="size-full"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={markerIcon} title={label} />
    </MapContainer>
  )
}
