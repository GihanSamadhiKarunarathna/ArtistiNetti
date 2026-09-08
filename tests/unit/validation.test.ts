import { describe, expect, it } from "vitest"
import { registerArtistSchema } from "@/lib/validation/auth"
import { createQuoteSchema } from "@/lib/validation/quote"

describe("registerArtistSchema", () => {
  const base = {
    fullName: "Test Artist",
    email: "test@example.com",
    phone: "+358401234567",
    password: "password123",
    confirmPassword: "password123",
    bandName: "The Testers",
    genres: ["ROCK"],
    city: "Helsinki",
    eventTypes: ["WEDDING"],
  }

  it("accepts a valid registration payload", () => {
    expect(registerArtistSchema.safeParse(base).success).toBe(true)
  })

  it("rejects mismatched passwords", () => {
    const result = registerArtistSchema.safeParse({
      ...base,
      confirmPassword: "different",
    })
    expect(result.success).toBe(false)
  })

  it("rejects an empty genre list", () => {
    const result = registerArtistSchema.safeParse({ ...base, genres: [] })
    expect(result.success).toBe(false)
  })
})

describe("createQuoteSchema", () => {
  it("accepts a valid quote", () => {
    const result = createQuoteSchema.safeParse({ amountEur: 1000, depositEur: 200 })
    expect(result.success).toBe(true)
  })

  it("rejects a deposit larger than the total amount", () => {
    const result = createQuoteSchema.safeParse({ amountEur: 100, depositEur: 200 })
    expect(result.success).toBe(false)
  })

  it("rejects a non-positive amount", () => {
    const result = createQuoteSchema.safeParse({ amountEur: 0 })
    expect(result.success).toBe(false)
  })
})
