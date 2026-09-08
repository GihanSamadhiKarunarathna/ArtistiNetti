import { test, expect } from "@playwright/test"

test("artist can register, edit profile, and add an availability entry", async ({
  page,
}) => {
  const uniqueEmail = `e2e-artist-${Date.now()}@example.com`

  await page.goto("/register/artist")
  await page.getByLabel("Full name").fill("E2E Test Artist")
  await page.getByLabel("Email").fill(uniqueEmail)
  await page.getByLabel("Phone number").fill("+358401112233")
  await page.getByLabel("Password", { exact: true }).fill("password123")
  await page.getByLabel("Confirm password").fill("password123")
  await page.getByLabel("Artist / band name").fill("E2E Test Band")
  await page.getByText("Rock", { exact: true }).click()
  await page.getByText("Wedding", { exact: true }).click()
  await page.getByLabel("City").fill("Helsinki")

  await page.getByRole("button", { name: "Create my artist account" }).click()

  await expect(page).toHaveURL(/\/artist\/dashboard/)
  await expect(
    page.getByRole("heading", { name: "E2E Test Artist" }),
  ).toBeVisible()

  await page.goto("/artist/availability")
  await page.getByRole("button", { name: "Add entry" }).click()
  await page.getByLabel("Title").fill("Test gig")
  const startDate = page.locator("#startDate")
  const endDate = page.locator("#endDate")
  await startDate.fill("2026-12-01")
  await endDate.fill("2026-12-01")
  await page.getByRole("button", { name: "Add entry" }).last().click()

  await expect(page.getByText("Test gig")).toBeVisible()
})
