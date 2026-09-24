/**
 * Statutory tax-free km allowance for using a private car on business travel,
 * per the Finnish Tax Administration (Verohallinto). This rate changes
 * annually — verify against the current year's published rate before relying
 * on it for real tax reporting.
 */
export const FINNISH_KM_ALLOWANCE_EUR_PER_KM = 0.59

export function calculateKmAllowanceEur(kilometers: number): number {
  return Math.round(kilometers * FINNISH_KM_ALLOWANCE_EUR_PER_KM)
}
