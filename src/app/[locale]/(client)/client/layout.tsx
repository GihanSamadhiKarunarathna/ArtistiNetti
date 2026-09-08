import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { requireRole } from "@/lib/auth"

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("CLIENT")

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
