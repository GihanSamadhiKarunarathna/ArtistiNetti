import { test, expect } from "@playwright/test"
import { registerArtist } from "./helpers"

const DEV_LOG_PATH = "/tmp/artistinetti-dev.log"

test("agency-drafted quote goes through Gate 2 (reject, resubmit, approve)", async ({
  browser,
}) => {
  const agentEmail = `e2e-gate2-agent-${Date.now()}@example.com`
  const artistEmail = `e2e-gate2-artist-${Date.now()}@example.com`
  const bandName = `E2E Gate2 Band ${Date.now()}`
  const businessId = `9${Date.now().toString().slice(-6)}-1`

  // Agent registers, creating their own agency with a known Business ID.
  const agentContext = await browser.newContext()
  const agentPage = await agentContext.newPage()
  await agentPage.goto("/register/agent")
  await agentPage.getByLabel("Full name").fill("Gate2 Agent")
  await agentPage.getByLabel("Email").fill(agentEmail)
  await agentPage.getByLabel("Phone number").fill("+358401230000")
  await agentPage.getByLabel("Password", { exact: true }).fill("password123")
  await agentPage.getByLabel("Confirm password").fill("password123")
  await agentPage.getByLabel("Agency name").fill("Gate2 Test Agency")
  await agentPage.getByLabel("Business ID").fill(businessId)
  await agentPage.getByRole("button", { name: "Create my agent account" }).click()
  await expect(agentPage).toHaveURL(/\/agent\/dashboard/)

  // Artist registers (self-managed by default), then switches representation
  // to the new agency by Business ID.
  const artistContext = await browser.newContext()
  const artistPage = await artistContext.newPage()
  await registerArtist(artistPage, { email: artistEmail, bandName, city: "Vaasa" })

  await artistPage.goto("/artist/profile")
  const bandSlugMatch = await artistPage
    .getByRole("link", { name: "View public page" })
    .getAttribute("href")
  const bandSlug = bandSlugMatch!.split("/").filter(Boolean).pop()!

  await artistPage.goto("/artist/agency")
  await artistPage.getByLabel("Agency Business ID").fill(businessId)
  await artistPage.getByRole("button", { name: "Switch agency" }).click()
  await expect(artistPage.getByText("Gate2 Test Agency")).toBeVisible()

  // Admin approves + artist publishes.
  await agentPage.goto("/login")
  const adminContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  await adminPage.goto("/login")
  await adminPage.getByLabel("Email").fill("admin@artistinetti.fi")
  await adminPage.getByLabel("Password").fill("ChangeMe123!")
  await adminPage.getByRole("button", { name: "Log in" }).click()
  await expect(adminPage).toHaveURL(/\/admin/)
  await adminPage.goto("/admin/artists")
  const row = adminPage.getByRole("row", { name: new RegExp(bandName) })
  await row.getByRole("button", { name: "Approve" }).click()
  await expect(row.getByText("APPROVED")).toBeVisible()
  await adminContext.close()

  await artistPage.goto("/artist/profile")
  await artistPage.getByRole("button", { name: "Publish profile" }).click()
  await expect(artistPage.getByText("Live")).toBeVisible()

  // Guest submits an inquiry.
  const clientEmail = `e2e-gate2-client-${Date.now()}@example.com`
  const guestContext = await browser.newContext()
  const guestPage = await guestContext.newPage()
  await guestPage.goto(`/inquiry/${bandSlug}`)
  await guestPage.getByLabel("Event date").fill("2026-11-20")
  await guestPage.getByRole("button", { name: "Next", exact: true }).click()
  await guestPage.getByLabel("Full name").fill("Gate2 Test Client")
  await guestPage.getByLabel("Email").fill(clientEmail)
  await guestPage.getByLabel("Phone number").fill("+358409990000")
  await guestPage.getByRole("button", { name: "Next", exact: true }).click()
  await guestPage.getByRole("button", { name: "Send request" }).click()
  await expect(guestPage.getByText("Your request has been sent!")).toBeVisible()
  await guestContext.close()

  // Gate 1: artist confirms the inquiry.
  await artistPage.goto("/artist/inquiries")
  await artistPage.getByRole("button", { name: "Accept" }).click()
  await expect(artistPage.getByText("Gate2 Test Client")).toBeVisible()

  // Agent drafts a quote — it must NOT go straight to the client.
  await agentPage.goto("/agent/artists")
  await agentPage.getByRole("link", { name: "Manage" }).click()
  await agentPage.getByRole("link", { name: /Gate2 Test Client/ }).click()
  await agentPage.waitForURL(/\/agent\/artists\/.+\/inquiries\/.+/)
  await agentPage.getByLabel("Total amount (EUR)").fill("900")
  await agentPage.getByRole("button", { name: "Send quote" }).click()
  await expect(agentPage.getByText("AWAITING_ARTIST_APPROVAL")).toBeVisible()

  // Artist rejects with feedback.
  await artistPage.goto("/artist/inquiries")
  await artistPage.getByRole("link", { name: /Gate2 Test Client/ }).click()
  await artistPage.waitForURL(/\/artist\/inquiries\/.+/)
  await expect(artistPage.getByText("AWAITING_ARTIST_APPROVAL")).toBeVisible()
  await artistPage.getByRole("button", { name: "Reject" }).click()
  await artistPage.getByPlaceholder("Tell the agent what to change...").fill("Please lower the price")
  await artistPage.getByRole("button", { name: "Send feedback" }).click()
  await expect(artistPage.getByText("Please lower the price")).toBeVisible()

  // Agent revises and resubmits.
  await agentPage.reload()
  await expect(agentPage.getByText("Please lower the price")).toBeVisible()
  await agentPage.getByLabel("Total amount (EUR)").fill("750")
  await agentPage.getByRole("button", { name: "Send quote" }).click()
  await expect(agentPage.getByText("AWAITING_ARTIST_APPROVAL")).toBeVisible()

  // Artist approves — now it's visible to the client.
  await artistPage.reload()
  await artistPage.getByRole("button", { name: "Approve & send" }).click()
  await expect(artistPage.getByText("SENT")).toBeVisible()

  const { readMagicLinkFor } = await import("./helpers")
  const magicLink = readMagicLinkFor(clientEmail, DEV_LOG_PATH)
  const clientContext = await browser.newContext()
  const clientPage = await clientContext.newPage()
  await clientPage.goto(magicLink)
  await clientPage.goto("/client/quotes")
  await clientPage.getByText(bandName).click()
  await expect(clientPage.getByText("750€")).toBeVisible()

  await agentContext.close()
  await artistContext.close()
  await clientContext.close()
})
