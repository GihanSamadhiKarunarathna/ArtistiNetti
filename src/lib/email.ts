import { Resend } from "resend"

const FROM = process.env.EMAIL_FROM ?? "ArtistiNetti <no-reply@artistinetti.fi>"

/**
 * Sends a transactional email via Resend, falling back to a console log when
 * RESEND_API_KEY isn't configured — matches the dev-mode fallback used for
 * magic-link sign-in (see lib/auth/config.ts) so the whole app is testable
 * locally without an email provider.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[dev email] To: ${to}\nSubject: ${subject}\n${html}\n`)
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({ from: FROM, to, subject, html })
}
