/**
 * Approximate city-centre coordinates for common Finnish cities, used to plot
 * artists on a map from their free-text `city` field without needing a
 * geocoding service or extra profile fields.
 */
export const FINNISH_CITY_COORDS: Record<string, [lat: number, lng: number]> = {
  helsinki: [60.1699, 24.9384],
  espoo: [60.2055, 24.6559],
  tampere: [61.4978, 23.761],
  vantaa: [60.2934, 25.0378],
  oulu: [65.0121, 25.4651],
  turku: [60.4518, 22.2666],
  jyväskylä: [62.2426, 25.7473],
  jyvaskyla: [62.2426, 25.7473],
  lahti: [60.9827, 25.6615],
  kuopio: [62.8981, 27.6783],
  pori: [61.4851, 21.7972],
  kouvola: [60.8679, 26.7042],
  joensuu: [62.6013, 29.7636],
  lappeenranta: [61.0587, 28.1887],
  hämeenlinna: [60.9959, 24.4643],
  hameenlinna: [60.9959, 24.4643],
  vaasa: [63.096, 21.6158],
  seinäjoki: [62.7877, 22.8407],
  seinajoki: [62.7877, 22.8407],
  rovaniemi: [66.5039, 25.7294],
  mikkeli: [61.6886, 27.2723],
  kotka: [60.4664, 26.9458],
  salo: [60.3833, 23.125],
  porvoo: [60.3932, 25.6645],
  kokkola: [63.8385, 23.1307],
}

export function getCityCoords(city: string | null | undefined): [number, number] | null {
  if (!city) return null
  const key = city.trim().toLowerCase()
  return FINNISH_CITY_COORDS[key] ?? null
}
