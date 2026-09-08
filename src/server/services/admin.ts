import { prisma } from "@/lib/db"

export async function getPlatformStats() {
  const [totalUsers, totalArtists, pendingApprovals, totalInquiries, gmv] =
    await Promise.all([
      prisma.user.count(),
      prisma.artistProfile.count(),
      prisma.user.count({ where: { status: "PENDING" } }),
      prisma.inquiryRequest.count(),
      prisma.transaction.aggregate({
        where: { status: { in: ["CAPTURED", "RELEASED"] } },
        _sum: { amountEur: true },
      }),
    ])

  return {
    totalUsers,
    totalArtists,
    pendingApprovals,
    totalInquiries,
    grossBookingValueEur: gmv._sum.amountEur ?? 0,
  }
}

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  })
}

export async function listArtistApprovalQueue() {
  return prisma.artistProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      bandName: true,
      bandSlug: true,
      city: true,
      approvalStatus: true,
      isPublished: true,
      createdAt: true,
      owner: { select: { id: true, email: true, status: true } },
    },
  })
}

export async function setUserStatus(
  userId: string,
  status: "APPROVED" | "REJECTED" | "SUSPENDED",
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
    include: { artistProfile: true },
  })

  if (user.artistProfile && status === "APPROVED") {
    await prisma.artistProfile.update({
      where: { id: user.artistProfile.id },
      data: { approvalStatus: "APPROVED" },
    })
  }
  if (user.artistProfile && (status === "REJECTED" || status === "SUSPENDED")) {
    await prisma.artistProfile.update({
      where: { id: user.artistProfile.id },
      data: {
        approvalStatus: status,
        isPublished: false,
      },
    })
  }

  return user
}
