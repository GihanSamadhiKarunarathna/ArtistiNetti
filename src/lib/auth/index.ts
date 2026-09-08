import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { auth } from "./config"

export { auth, signIn, signOut, handlers } from "./config"

export type AppRole = "ADMIN" | "ARTIST" | "AGENT" | "CLIENT"

/**
 * Re-checks role/status against the database on every call rather than trusting
 * the JWT, so an admin suspending a user takes effect immediately even though
 * sessions are JWT-based (required by the Credentials provider).
 */
export async function requireRole(...roles: AppRole[]) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, status: true, email: true, name: true },
  })

  if (!user || user.status === "SUSPENDED" || user.status === "REJECTED") {
    redirect("/login")
  }
  if (!roles.includes(user.role as AppRole)) {
    redirect("/login")
  }

  return user
}
