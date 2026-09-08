import type { NextAuthConfig } from "next-auth"

/**
 * Edge-safe subset of the NextAuth config: no Prisma adapter, no providers that
 * touch Node-only modules (bcrypt, pg). Used directly by middleware, and spread
 * into the full config in `config.ts` for server/route-handler use.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
        token.status = user.status
        token.locale = user.locale
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role
        session.user.status = token.status
        session.user.locale = token.locale
      }
      return session
    },
  },
} satisfies NextAuthConfig
