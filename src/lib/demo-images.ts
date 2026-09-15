/**
 * Curated, verified-working Unsplash photos (standard Unsplash License, no
 * attribution required) used for seed/demo content and marketing imagery
 * until real artists upload their own photos.
 */
function unsplash(id: string, width = 1600) {
  return `https://images.unsplash.com/${id}?fm=jpg&q=80&w=${width}&auto=format&fit=crop`
}

export const DEMO_PHOTOS = {
  concertStage: unsplash("photo-1760966362386-e1012dbc3657"),
  acousticSinger: unsplash("photo-1474959783111-a0f551bdad25"),
  djSet: unsplash("photo-1723293874527-020d0ced471e"),
  rockBand: unsplash("photo-1499364615650-ec38552f4f34"),
  saxophonist: unsplash("photo-1641185867887-e8a0c79214b9"),
  festivalCrowd: unsplash("photo-1760092189954-5b2f6eb3ca88"),
  stringQuartet: unsplash("photo-1465847899084-d164df4dedc6"),
} as const
