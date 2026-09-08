import { test, expect } from "@playwright/test"

test("admin can approve an artist, who can then publish and appear in discovery", async ({
  browser,
}) => {
  const email = `e2e-approve-${Date.now()}@example.com`
  const bandName = `E2E Approve Band ${Date.now()}`

  const artistContext = await browser.newContext()
  const artistPage = await artistContext.newPage()

  await artistPage.goto("/register/artist")
  await artistPage.getByLabel("Full name").fill("Approve Test Artist")
  await artistPage.getByLabel("Email").fill(email)
  await artistPage.getByLabel("Phone number").fill("+358401112244")
  await artistPage.getByLabel("Password", { exact: true }).fill("password123")
  await artistPage.getByLabel("Confirm password").fill("password123")
  await artistPage.getByLabel("Artist / band name").fill(bandName)
  await artistPage.getByText("Pop", { exact: true }).click()
  await artistPage.getByText("Wedding", { exact: true }).click()
  await artistPage.getByLabel("City").fill("Tampere")
  await artistPage.getByRole("button", { name: "Create my artist account" }).click()
  await expect(artistPage).toHaveURL(/\/artist\/dashboard/)

  await artistPage.goto("/artist/profile")
  await expect(artistPage.getByText("Awaiting approval")).toBeVisible()

  const adminContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  await adminPage.goto("/login")
  await adminPage.getByLabel("Email").fill("admin@artistinetti.fi")
  await adminPage.getByLabel("Password").fill("ChangeMe123!")
  await adminPage.getByRole("button", { name: "Log in" }).click()
  await expect(adminPage).toHaveURL(/\/admin/)

  await adminPage.goto("/admin/artists")
  const row = adminPage.getByRole("row", { name: new RegExp(bandName) })
  await expect(row).toBeVisible()
  await row.getByRole("button", { name: "Approve" }).click()
  await expect(row.getByText("APPROVED")).toBeVisible()

  await artistPage.reload()
  await expect(artistPage.getByText("Not published")).toBeVisible()
  await artistPage.getByRole("button", { name: "Publish profile" }).click()
  await expect(artistPage.getByText("Live")).toBeVisible()

  await artistPage.goto("/discover")
  await expect(artistPage.getByText(bandName)).toBeVisible()

  await artistContext.close()
  await adminContext.close()
})
