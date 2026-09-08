import type { Browser, Page } from "@playwright/test"
import { expect } from "@playwright/test"
import { readFileSync } from "node:fs"

export async function registerArtist(
  page: Page,
  { email, bandName, city }: { email: string; bandName: string; city: string },
) {
  await page.goto("/register/artist")
  await page.getByLabel("Full name").fill("Test Artist Owner")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Phone number").fill("+358401110000")
  await page.getByLabel("Password", { exact: true }).fill("password123")
  await page.getByLabel("Confirm password").fill("password123")
  await page.getByLabel("Artist / band name").fill(bandName)
  await page.getByText("Rock", { exact: true }).click()
  await page.getByText("Wedding", { exact: true }).click()
  await page.getByLabel("City").fill(city)
  await page.getByLabel("Starting price (EUR)").fill("500")
  await page.getByRole("button", { name: "Create my artist account" }).click()
  await expect(page).toHaveURL(/\/artist\/dashboard/)
}

export async function loginAsAdmin(page: Page) {
  await page.goto("/login")
  await page.getByLabel("Email").fill("admin@artistinetti.fi")
  await page.getByLabel("Password").fill("ChangeMe123!")
  await page.getByRole("button", { name: "Log in" }).click()
  await expect(page).toHaveURL(/\/admin/)
}

export async function approveAndPublish(
  browser: Browser,
  artistPage: Page,
  bandName: string,
) {
  const adminContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  await loginAsAdmin(adminPage)
  await adminPage.goto("/admin/artists")
  const row = adminPage.getByRole("row", { name: new RegExp(bandName) })
  await row.getByRole("button", { name: "Approve" }).click()
  await expect(row.getByText("APPROVED")).toBeVisible()
  await adminContext.close()

  await artistPage.goto("/artist/profile")
  await artistPage.getByRole("button", { name: "Publish profile" }).click()
  await expect(artistPage.getByText("Live")).toBeVisible()
}

/** Reads the local dev server log for the magic-link URL sent to `email`. */
export function readMagicLinkFor(email: string, logPath: string): string {
  const log = readFileSync(logPath, "utf-8")
  const pattern = new RegExp(
    `Sign-in link for ${email}:\\n(http\\S+)`,
  )
  const match = log.match(pattern)
  if (!match) throw new Error(`No magic link found for ${email} in ${logPath}`)
  return match[1]
}
