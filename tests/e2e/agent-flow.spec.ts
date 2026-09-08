import { test, expect } from "@playwright/test"
import { registerArtist } from "./helpers"

test("agent can add an artist by email and view their inquiries", async ({
  browser,
}) => {
  const artistEmail = `e2e-agent-artist-${Date.now()}@example.com`
  const agentEmail = `e2e-agent-${Date.now()}@example.com`
  const bandName = `E2E Agent Band ${Date.now()}`

  const artistContext = await browser.newContext()
  const artistPage = await artistContext.newPage()
  await registerArtist(artistPage, { email: artistEmail, bandName, city: "Oulu" })
  await artistContext.close()

  const agentContext = await browser.newContext()
  const agentPage = await agentContext.newPage()
  await agentPage.goto("/register/agent")
  await agentPage.getByLabel("Full name").fill("Test Agent")
  await agentPage.getByLabel("Email").fill(agentEmail)
  await agentPage.getByLabel("Phone number").fill("+358401119999")
  await agentPage.getByLabel("Password", { exact: true }).fill("password123")
  await agentPage.getByLabel("Confirm password").fill("password123")
  await agentPage.getByLabel("Agency name").fill("Test Agency")
  await agentPage.getByRole("button", { name: "Create my agent account" }).click()
  await expect(agentPage).toHaveURL(/\/agent\/dashboard/)

  await agentPage.goto("/agent/artists")
  await agentPage.getByLabel("Artist's account email").fill(artistEmail)
  await agentPage.getByRole("button", { name: "Add artist" }).click()
  await expect(agentPage.getByText(bandName)).toBeVisible()

  await agentPage.getByRole("link", { name: "Manage" }).click()
  await expect(agentPage.getByRole("heading", { name: bandName })).toBeVisible()

  await agentContext.close()
})
