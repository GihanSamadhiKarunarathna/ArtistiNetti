import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Resend as ResendClient } from "resend"
import { prisma } from "@/lib/db"
import { loginSchema } from "@/lib/validation/auth"
import { verifyCredentials } from "@/server/services/auth"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = loginSchema.safeParse(raw)
        if (!parsed.success) return null

        const user = await verifyCredentials(
          parsed.data.email,
          parsed.data.password,
        )
        if (!user) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          locale: user.locale,
        }
      },
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? "ArtistiNetti <no-reply@artistinetti.fi>",
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        if (!process.env.RESEND_API_KEY) {
          console.log(
            `\n[dev magic-link] Sign-in link for ${identifier}:\n${url}\n`,
          )
          return
        }
        const resend = new ResendClient(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: provider.from as string,
          to: identifier,
          subject: "Your ArtistiNetti sign-in link",
          html: `<p>Click the link below to access your quotes:</p><p><a href="${url}">${url}</a></p>`,
        })
      },
    }),
  ],
})
