import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const ADMIN_EMAIL = "admin@artistinetti.fi"
const ADMIN_PASSWORD = "ChangeMe123!"

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      name: "ArtistiNetti Admin",
      passwordHash,
      role: "ADMIN",
      status: "APPROVED",
      locale: "fi",
    },
  })

  console.log(`Seeded admin user: ${admin.email} (password: ${ADMIN_PASSWORD})`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
