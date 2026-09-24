import { test, expect } from "@playwright/test"
import { registerArtist } from "./helpers"
import { readFileSync } from "node:fs"

const DEV_LOG_PATH = "/tmp/artistinetti-dev.log"

function readInviteLinkFor(email: string): string {
  const log = readFileSync(DEV_LOG_PATH, "utf-8")
  const pattern = new RegExp(`To: ${email}[\\s\\S]*?(http\\S+)`)
  const match = log.match(pattern)
  if (!match) throw new Error(`No invite link found for ${email}`)
  return match[1].replace(/["'<].*$/, "")
}

test("band member invite: owner invites, invitee accepts and can access the dashboard", async ({
  browser,
}) => {
  const ownerEmail = `e2e-invite-owner-${Date.now()}@example.com`
  const memberEmail = `e2e-invite-member-${Date.now()}@example.com`
  const bandName = `E2E Invite Band ${Date.now()}`

  const ownerContext = await browser.newContext()
  const ownerPage = await ownerContext.newPage()
  await registerArtist(ownerPage, { email: ownerEmail, bandName, city: "Lahti" })

  await ownerPage.goto("/artist/profile")
  await ownerPage.getByLabel("Name", { exact: true }).fill("Bandmate One")
  await ownerPage.getByLabel("Email").fill(memberEmail)
  await ownerPage.getByLabel("Instrument / role").fill("Drums")
  await ownerPage.getByRole("button", { name: "Add member" }).click()
  await expect(ownerPage.getByText(memberEmail)).toBeVisible()

  const inviteLink = readInviteLinkFor(memberEmail)
  const memberContext = await browser.newContext()
  const memberPage = await memberContext.newPage()
  await memberPage.goto(inviteLink)
  await memberPage.getByLabel("Password", { exact: true }).fill("password123")
  await memberPage.getByLabel("Confirm password").fill("password123")
  await memberPage.getByRole("button", { name: "Create account" }).click()
  await expect(memberPage).toHaveURL(/\/login/)

  await memberPage.getByLabel("Email").fill(memberEmail)
  await memberPage.getByLabel("Password").fill("password123")
  await memberPage.getByRole("button", { name: "Log in" }).click()
  await expect(memberPage).toHaveURL(/\/artist\/dashboard/)
  await expect(memberPage.getByRole("heading", { name: "Bandmate One" })).toBeVisible()

  await ownerContext.close()
  await memberContext.close()
})

test("agency staff invite: primary admin invites, invitee accepts and joins the agency", async ({
  browser,
}) => {
  const primaryEmail = `e2e-invite-primary-${Date.now()}@example.com`
  const staffEmail = `e2e-invite-staff-${Date.now()}@example.com`

  const primaryContext = await browser.newContext()
  const primaryPage = await primaryContext.newPage()
  await primaryPage.goto("/register/agent")
  await primaryPage.getByLabel("Full name").fill("Primary Admin")
  await primaryPage.getByLabel("Email").fill(primaryEmail)
  await primaryPage.getByLabel("Phone number").fill("+358401112121")
  await primaryPage.getByLabel("Password", { exact: true }).fill("password123")
  await primaryPage.getByLabel("Confirm password").fill("password123")
  await primaryPage.getByLabel("Agency name").fill("Invite Test Agency")
  await primaryPage.getByRole("button", { name: "Create my agent account" }).click()
  await expect(primaryPage).toHaveURL(/\/agent\/dashboard/)

  await primaryPage.goto("/agent/agency")
  await primaryPage.getByLabel("Name", { exact: true }).fill("New Staff")
  await primaryPage.getByLabel("Email").fill(staffEmail)
  await primaryPage.getByRole("button", { name: "Invite staff" }).click()
  await expect(primaryPage.getByText("Invite sent")).toBeVisible()

  const inviteLink = readInviteLinkFor(staffEmail)
  const staffContext = await primaryContext.browser()!.newContext()
  const staffPage = await staffContext.newPage()
  await staffPage.goto(inviteLink)
  await staffPage.getByLabel("Password", { exact: true }).fill("password123")
  await staffPage.getByLabel("Confirm password").fill("password123")
  await staffPage.getByRole("button", { name: "Create account" }).click()
  await expect(staffPage).toHaveURL(/\/login/)

  await staffPage.getByLabel("Email").fill(staffEmail)
  await staffPage.getByLabel("Password").fill("password123")
  await staffPage.getByRole("button", { name: "Log in" }).click()
  await expect(staffPage).toHaveURL(/\/agent\/dashboard/)

  await staffPage.goto("/agent/agency")
  await expect(staffPage.getByText("New Staff")).toBeVisible()
  await expect(staffPage.getByText("Primary admin", { exact: true })).toBeVisible()

  await primaryContext.close()
  await staffContext.close()
})
