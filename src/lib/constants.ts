export const GENRES = [
  "POP",
  "ROCK",
  "JAZZ",
  "FOLK",
  "ELECTRONIC",
  "CLASSICAL",
  "HIPHOP",
  "METAL",
  "SCHLAGER",
  "COVER",
  "ACOUSTIC",
  "DJ",
  "FUNK_SOUL",
  "COUNTRY",
  "WORLD",
] as const

export type Genre = (typeof GENRES)[number]

export const EVENT_TYPES = [
  "WEDDING",
  "CORPORATE",
  "BAR_CLUB",
  "PRIVATE_PARTY",
  "FESTIVAL",
  "OTHER",
] as const

export type EventTypeValue = (typeof EVENT_TYPES)[number]

export const AVAILABILITY_TYPES = [
  "CONFIRMED_GIG",
  "HOLD",
  "BLOCKED",
  "PENDING_QUOTE",
] as const

export type AvailabilityTypeValue = (typeof AVAILABILITY_TYPES)[number]
