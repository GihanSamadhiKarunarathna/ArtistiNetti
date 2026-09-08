import { getTranslations } from "next-intl/server"
import { UsersTable } from "@/components/features/admin/users-table"
import { listUsers } from "@/server/services/admin"

export default async function AdminUsersPage() {
  const [t, users] = await Promise.all([
    getTranslations("adminDashboard"),
    listUsers(),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("usersTitle")}</h1>
      <UsersTable
        users={users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
