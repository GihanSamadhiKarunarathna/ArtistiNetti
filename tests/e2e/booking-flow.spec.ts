import { test, expect } from "@playwright/test"
import { approveAndPublish, readMagicLinkFor, registerArtist } from "./helpers"

const DEV_LOG_PATH = "/tmp/artistinetti-dev.log"

test("full booking flow: inquiry -> quote -> mock payment -> confirmed gig -> messaging", async ({
  browser,
}) => {
  const artistEmail = `e2e-booking-artist-${Date.now()}@example.com`
  const clientEmail = `e2e-booking-client-${Date.now()}@example.com`
  const bandName = `E2E Booking Band ${Date.now()}`

  const artistContext = await browser.newContext()
  const artistPage = await artistContext.newPage()
  await registerArtist(artistPage, { email: artistEmail, bandName, city: "Turku" })
  await approveAndPublish(browser, artistPage, bandName)

  const bandSlugMatch = await artistPage
    .getByRole("link", { name: "View public page" })
    .getAttribute("href")
  expect(bandSlugMatch).toBeTruthy()
  const bandSlug = bandSlugMatch!.split("/").filter(Boolean).pop()!

  const guestContext = await browser.newContext()
  const guestPage = await guestContext.newPage()
  await guestPage.goto(`/inquiry/${bandSlug}`)
  await guestPage.getByLabel("Event date").fill("2026-12-15")
  await guestPage.getByLabel("Event location").fill("Turku")
  await guestPage.getByRole("button", { name: "Next", exact: true }).click()
  await guestPage.getByLabel("Full name").fill("Booking Test Client")
  await guestPage.getByLabel("Email").fill(clientEmail)
  await guestPage.getByLabel("Phone number").fill("+358409998877")
  await guestPage.getByRole("button", { name: "Next", exact: true }).click()
  await guestPage.getByRole("button", { name: "Send request" }).click()
  await expect(guestPage.getByText("Your request has been sent!")).toBeVisible()
  await guestContext.close()

  await artistPage.goto("/artist/inquiries")
  await artistPage.getByText("Booking Test Client").click()
  await artistPage.getByLabel("Total amount (EUR)").fill("1200")
  await artistPage.getByLabel("Deposit (EUR)").fill("300")
  await artistPage.getByRole("button", { name: "Send quote" }).click()
  await expect(artistPage.getByText("SENT")).toBeVisible()

  await artistPage.getByRole("link", { name: "Open messages" }).click();
  await artistPage.getByPlaceholder("Write a message...").fill("Looking forward to your event!")
  await artistPage.getByPlaceholder("Write a message...").press("Enter")
  await expect(artistPage.getByText("Looking forward to your event!")).toBeVisible()

  const magicLink = readMagicLinkFor(clientEmail, DEV_LOG_PATH)
  const clientContext = await browser.newContext()
  const clientPage = await clientContext.newPage()
  await clientPage.goto(magicLink)
  await clientPage.goto("/client/quotes")
  await expect(clientPage.getByText(bandName)).toBeVisible()
  await clientPage.getByText(bandName).click()

  await expect(clientPage.getByText("1200€")).toBeVisible()
  await clientPage.getByRole("button", { name: /Pay deposit/ }).click()
  await expect(clientPage.getByText("Payment received")).toBeVisible()

  await clientPage.getByRole("link", { name: "Open messages" }).click()
  await expect(clientPage.getByText("Looking forward to your event!")).toBeVisible()
  await clientPage.getByPlaceholder("Write a message...").fill("Thank you, see you then!")
  await clientPage.getByPlaceholder("Write a message...").press("Enter")
  await expect(clientPage.getByText("Thank you, see you then!")).toBeVisible()

  await artistPage.goto("/artist/availability")
  await expect(artistPage.getByText("Confirmed booking")).toBeVisible()

  await artistContext.close()
  await clientContext.close()
})
