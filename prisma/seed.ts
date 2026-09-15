import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import bcrypt from "bcryptjs"
import { DEMO_PHOTOS } from "../src/lib/demo-images"
import type { Genre, EventTypeValue } from "../src/lib/constants"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const ADMIN_EMAIL = "admin@artistinetti.fi"
const ADMIN_PASSWORD = "ChangeMe123!"
const DEMO_PASSWORD = "password123"

type DemoArtist = {
  slug: string
  bandName: string
  genres: Genre[]
  eventTypes: EventTypeValue[]
  city: string
  region: string
  minBudgetEur: number
  maxBudgetEur: number
  bio: string
  bioEn: string
  heroImageUrl: string
  galleryImageUrls: string[]
  spotifyUrl?: string
  youtubeUrl?: string
}

const DEMO_ARTISTS: DemoArtist[] = [
  {
    slug: "northern-lights-quartet",
    bandName: "Northern Lights Quartet",
    genres: ["JAZZ", "ACOUSTIC"],
    eventTypes: ["CORPORATE", "PRIVATE_PARTY", "BAR_CLUB"],
    city: "Helsinki",
    region: "Uusimaa",
    minBudgetEur: 800,
    maxBudgetEur: 2200,
    bio: "Helsinkiläinen jazzkvartetti, joka tuo lämpimän ja tyylikkään tunnelman yritystilaisuuksiin ja illallisille. Ohjelmisto klassikoista moderneihin sovituksiin.",
    bioEn: "A Helsinki jazz quartet bringing a warm, elegant atmosphere to corporate events and dinners. Repertoire ranging from classics to modern arrangements.",
    heroImageUrl: DEMO_PHOTOS.saxophonist,
    galleryImageUrls: [DEMO_PHOTOS.concertStage, DEMO_PHOTOS.saxophonist],
  },
  {
    slug: "aurora-strings",
    bandName: "Aurora Strings",
    genres: ["CLASSICAL", "ACOUSTIC"],
    eventTypes: ["WEDDING", "CORPORATE"],
    city: "Helsinki",
    region: "Uusimaa",
    minBudgetEur: 600,
    maxBudgetEur: 1800,
    bio: "Jousikvartetti häihin ja juhliin. Sävelet kävelymarssista ensitanssiin, klassisesta nykypoppiin — räätälöity ohjelmisto jokaiselle parille.",
    bioEn: "A string quartet for weddings and celebrations. From the processional to the first dance, classical to modern pop — a repertoire tailored to every couple.",
    heroImageUrl: DEMO_PHOTOS.stringQuartet,
    galleryImageUrls: [DEMO_PHOTOS.stringQuartet],
  },
  {
    slug: "dj-kaiku",
    bandName: "DJ Kaiku",
    genres: ["ELECTRONIC", "DJ", "HIPHOP"],
    eventTypes: ["BAR_CLUB", "PRIVATE_PARTY", "FESTIVAL"],
    city: "Tampere",
    region: "Pirkanmaa",
    minBudgetEur: 400,
    maxBudgetEur: 1500,
    bio: "Energinen DJ, joka lukee yleisöä ja pitää tanssilattian täynnä yöhön asti. Oma valo- ja äänikalusto saatavilla.",
    bioEn: "An energetic DJ who reads the room and keeps the dance floor packed until close. Own lighting and sound rig available on request.",
    heroImageUrl: DEMO_PHOTOS.djSet,
    galleryImageUrls: [DEMO_PHOTOS.djSet, DEMO_PHOTOS.festivalCrowd],
  },
  {
    slug: "ilta-auringossa",
    bandName: "Ilta Auringossa",
    genres: ["ACOUSTIC", "FOLK", "SCHLAGER"],
    eventTypes: ["WEDDING", "PRIVATE_PARTY"],
    city: "Turku",
    region: "Varsinais-Suomi",
    minBudgetEur: 350,
    maxBudgetEur: 1200,
    bio: "Akustinen duo kitaralla ja lämpimällä laululla. Suosittu valinta häihin ja pihajuhliin ympäri Varsinais-Suomen.",
    bioEn: "An acoustic guitar-and-vocals duo with a warm sound. A popular choice for weddings and garden parties around Southwest Finland.",
    heroImageUrl: DEMO_PHOTOS.acousticSinger,
    galleryImageUrls: [DEMO_PHOTOS.acousticSinger],
  },
  {
    slug: "terasta-ja-savua",
    bandName: "Terästä ja Savua",
    genres: ["ROCK", "METAL", "COVER"],
    eventTypes: ["BAR_CLUB", "FESTIVAL", "PRIVATE_PARTY"],
    city: "Oulu",
    region: "Pohjois-Pohjanmaa",
    minBudgetEur: 700,
    maxBudgetEur: 2500,
    bio: "Viiden hengen rock-covereita ja omaa materiaalia soittava bändi. Täysi PA ja valot mukana — vain lava tarvitaan.",
    bioEn: "A five-piece band playing rock covers and originals. Full PA and lighting included — just bring the stage.",
    heroImageUrl: DEMO_PHOTOS.rockBand,
    galleryImageUrls: [DEMO_PHOTOS.rockBand, DEMO_PHOTOS.concertStage],
  },
  {
    slug: "kaupunkivalot",
    bandName: "Kaupunkivalot",
    genres: ["POP", "COVER", "FUNK_SOUL"],
    eventTypes: ["CORPORATE", "WEDDING", "PRIVATE_PARTY"],
    city: "Espoo",
    region: "Uusimaa",
    minBudgetEur: 900,
    maxBudgetEur: 3000,
    bio: "Seitsemän muusikon pop- ja funk-yhtye, joka on soittanut satoja häitä ja yritystapahtumia ympäri Suomen.",
    bioEn: "A seven-piece pop and funk act that has played hundreds of weddings and corporate events across Finland.",
    heroImageUrl: DEMO_PHOTOS.concertStage,
    galleryImageUrls: [DEMO_PHOTOS.concertStage, DEMO_PHOTOS.festivalCrowd],
  },
]

async function purgeTestArtists() {
  const deleted = await prisma.user.deleteMany({
    where: { email: { contains: "e2e-", mode: "insensitive" } },
  })
  if (deleted.count > 0) {
    console.log(`Removed ${deleted.count} leftover e2e-test user(s)`)
  }
}

async function main() {
  await purgeTestArtists()

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

  const demoPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

  for (const artist of DEMO_ARTISTS) {
    const email = `${artist.slug}@artistinetti.fi`
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: artist.bandName,
        passwordHash: demoPasswordHash,
        role: "ARTIST",
        status: "APPROVED",
        locale: "fi",
      },
    })

    await prisma.artistProfile.upsert({
      where: { ownerUserId: user.id },
      update: {
        approvalStatus: "APPROVED",
        isPublished: true,
        heroImageUrl: artist.heroImageUrl,
        galleryImageUrls: artist.galleryImageUrls,
      },
      create: {
        ownerUserId: user.id,
        bandSlug: artist.slug,
        bandName: artist.bandName,
        bio: artist.bio,
        bioEn: artist.bioEn,
        genres: artist.genres,
        city: artist.city,
        region: artist.region,
        country: "FI",
        minBudgetEur: artist.minBudgetEur,
        maxBudgetEur: artist.maxBudgetEur,
        eventTypes: artist.eventTypes,
        heroImageUrl: artist.heroImageUrl,
        galleryImageUrls: artist.galleryImageUrls,
        approvalStatus: "APPROVED",
        isPublished: true,
        members: { create: { displayName: artist.bandName, isOwner: true } },
      },
    })
  }
  console.log(`Seeded ${DEMO_ARTISTS.length} demo artists (password: ${DEMO_PASSWORD})`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
