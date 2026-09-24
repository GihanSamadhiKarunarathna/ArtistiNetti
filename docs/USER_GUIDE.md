# ArtistiNetti — User Guide (Version 1.0)

ArtistiNetti is a Finland-first marketplace that connects **artists and bands**, **booking agents/agencies**, and **event clients**. This guide explains how to use the system if you're an Event Client, an Artist/Band, a Booking Agent, or an Admin.

The platform is available in **Finnish** (default) and **English** — use the language switcher in the top navigation at any time.

---

## 1. The Booking Workflow at a Glance

Every booking follows the same path, regardless of who's involved:

```
Browse an artist's public page
        ↓
Send a booking inquiry (chat / quote request)
        ↓
GATE 1 — the artist confirms the request
   (declined or unanswered requests never bother the client)
        ↓
A quote is prepared
        ↓
GATE 2 — only applies when an agency drafts the quote on the
         artist's behalf; the artist must approve it before it's sent
        ↓
The client receives and accepts the quote (deposit payment)
        ↓
Confirmed gig → messaging, travel expenses, and payout breakdown
```

Two "gates" exist purely to protect artists: nothing reaches a client's inbox — not a booking request, not a quote — until the artist (or, for band-created quotes, the band itself) has actively said yes.

---

## 2. Getting Started

### 2.1 As an Event Client

You don't need to create an account up front. Find an artist's public profile page (via search/discovery or a direct link) and fill out the **inquiry form** with your event details and contact email. After you submit it, you'll receive a **sign-in link by email** — click it to securely access your bookings at any time, with no password to remember. Use the same email next time to pick up where you left off.

### 2.2 As an Artist or Band

Go to **Register → Artist/Band** and create your account with your band name, city, and contact details. This automatically sets you up as a **self-managed band** — you're in full control from day one, with no agency required.

- If you were invited by an existing band as a member, use the invite link you received (`/join/band/...`) instead — it signs you straight into that band's shared dashboard.
- If you were invited to join a booking agency's staff, use your invite link (`/join/agency/...`).

### 2.3 As a Booking Agent / Agency

Go to **Register → Agent/Agency**. This creates your agency and makes you its **Primary Admin**. You can optionally add your Business ID (Y-tunnus) — this is what artists use later to find and connect with your agency. As Primary Admin you can invite more staff to your agency from **Agency settings**.

### 2.4 As an Admin

Admin accounts are created directly in the system and aren't self-registered. Admins approve new artist profiles and manage user accounts.

---

## 3. For Event Clients

**Finding an artist**
Use the discovery/search page to filter by city, genre, budget, or event type, or open an artist's page directly from a link they shared. Public artist pages show their bio, photos, genres, a map of their home city, and a read-only calendar showing which dates are already busy — so you know before you ask.

**Sending a request**
Fill in your event date, location, and contact details on the artist's page. You don't need an account — just a valid email.

**Waiting for confirmation**
Your request goes to the artist first. It won't appear as an active booking in your account until the artist confirms it — this is intentional, so you're never left chasing an artist who never saw your message or who had to say no.

**Receiving a quote**
Once confirmed, the artist (or their agency) prepares a quote with the total price and deposit amount. You'll see it in **My Quotes** as soon as it's ready to send — agency-drafted quotes go through one extra internal approval step by the artist before you ever see them, so what you receive is always something the artist has agreed to.

**Accepting and paying**
Review the quote and accept it to confirm your booking. Version 1.0 uses a **mock/sandbox payment** — no real charges are made yet; this is a placeholder for the live payment integration.

**Messaging**
Once your booking is active, use the built-in chat thread to coordinate directly with the artist.

---

## 4. For Artists & Bands

### 4.1 Your public profile

Under **Profile**, fill in your bio (Finnish and English), genres, event types you play, budget range, city, photos, and links (Spotify, YouTube, website, social media). You can also upload a tech rider and stage plan as PDFs. A new profile needs **admin approval** before it can be published and appear in search.

### 4.2 Availability & calendar

Under **Availability**, manage your calendar of confirmed gigs, holds, and blocked-off dates. The system automatically prevents you from double-booking — it won't let a new confirmed gig or blocked date overlap with an existing one.

Use the **Subscribe (iCal)** button to copy a calendar feed link you can add to Google Calendar, Apple Calendar, or Outlook. It only ever shows generic "Busy" blocks — gig and client details are never exposed publicly.

### 4.3 Inquiries — Gate 1

New booking requests land in **Inquiries** under "Awaiting your confirmation." Tap **Accept** or **Decline** — accepting makes the request visible to the client and places a calendar hold; declining quietly closes it out with no notification sent to the client.

### 4.4 Quotes

Open a confirmed inquiry to build a quote (total amount, deposit, terms). If you or a band member created it, it's sent straight to the client. If your representing agency's staff created it on your behalf, it first appears under **Quotes awaiting your approval** — approve it to send, or reject it with a note so the agency can revise and resend it.

### 4.5 Band members

Invite other band members from **Profile → Band members** by email — they get their own login into your **shared band workspace** (dashboard, inquiries, quotes, messages). As the owner, you control each member's permissions to manage the calendar and log expenses.

### 4.6 Agency representation

Under **Agency**, see whether you're currently self-managed or represented by an agency. To be represented, enter the agency's **Business ID** to switch to them — they can then draft quotes on your behalf (subject to your approval). Use **Revert to self-managed** at any time to go back to representing yourself.

### 4.7 Travel expenses

Under **Expenses**, log mileage and other costs against a gig. Kilometers are automatically converted into the current Finnish per-km tax-free allowance. No agency approval is needed to submit — just save it as a record for invoicing.

### 4.8 Payout breakdown

Once a gig's quote is accepted and paid, open the booking to see a transparent **payout breakdown**: the agency's commission (if represented), and the remaining split across band members.

---

## 5. For Booking Agents & Agencies

### 5.1 Agency settings

Under **Agency**, the Primary Admin can update the agency name and Business ID, and invite additional staff by email. Invited staff join as non-primary members and can act on the agency's behalf.

### 5.2 Connecting with artists

Artists connect to your agency themselves, using your Business ID from their own **Agency** settings page. Once connected, their profile and inquiries appear under **My artists**.

### 5.3 Drafting quotes

Open an artist's inquiry to draft a quote for them. Because it's agency-drafted, it goes to the artist for approval first (Gate 2) before the client ever sees it — if the artist rejects it, you'll see their note and can revise and resend.

### 5.4 Expenses

Each artist's page includes a read-only log of their submitted travel expenses, useful for your own invoicing.

---

## 6. For Admins

- **Artist approvals**: review and approve or reject newly submitted artist profiles before they can go public.
- **Users**: manage user accounts across all roles.

---

## 7. Good to Know

- **Mock payments**: v1.0 uses a sandbox payment flow. No live payment provider is connected yet.
- **Sign-in links**: Event Clients and any lightweight invite-based signups use passwordless email sign-in links instead of passwords.
- **Hidden until confirmed**: unconfirmed inquiries and unapproved quotes are deliberately invisible to clients — if something you expect to see isn't there yet, it likely just needs the other side's confirmation first.
- **Languages**: switch between Finnish and English anytime from the language selector; your choice is remembered.

---

*This guide covers Version 1.0 of ArtistiNetti. Features such as live payment processing, SMS/push notifications, and per-agency customer data isolation are planned for future versions.*
