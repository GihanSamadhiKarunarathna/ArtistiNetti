import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // The local `prisma dev` proxy this project uses for its dev Postgres
  // instance is flaky in two independent ways, both surfacing as
  // `PrismaClientKnownRequestError: Server has closed the connection`:
  //  1. It doesn't reliably handle multiple concurrent connections from a
  //     single pool — `max: 1` serializes queries through pg's own queue
  //     instead of opening a second connection.
  //  2. It silently drops connections that sit idle for more than a few
  //     seconds (TCP-level, no error surfaced until the next query tries to
  //     use the dead socket) — `keepAlive: true` sends TCP keepalive probes
  //     on the sole connection so it's kept warm instead of going stale.
  //     This specifically broke the Auth.js magic-link callback in
  //     production mode (`next start` keeps one process/pool alive
  //     indefinitely, long enough for the proxy to drop the idle connection
  //     between a user requesting a link and clicking it), while `next dev`
  //     recompiles routes often enough to mask it. (A short
  //     `idleTimeoutMillis` was tried instead but raced with `max: 1` and
  //     left the pool permanently broken — keepalive avoids that.)
  // Safe to raise `max` / drop `keepAlive` once pointed at a real Postgres
  // server.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    keepAlive: true,
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
