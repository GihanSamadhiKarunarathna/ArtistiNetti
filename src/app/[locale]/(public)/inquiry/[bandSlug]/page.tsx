import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { InquiryWizard } from "@/components/features/inquiry/inquiry-wizard"
import { getPublicArtistBySlug } from "@/server/services/discovery"

export default async function InquiryPage({
  params,
}: {
  params: Promise<{ bandSlug: string }>
}) {
  const { bandSlug } = await params
  const artist = await getPublicArtistBySlug(bandSlug)
  if (!artist) notFound()

  const t = await getTranslations("inquiry")

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold">
        {t("title", { bandName: artist.bandName })}
      </h1>
      <div className="mt-8 rounded-xl border bg-card p-6 sm:p-8">
        <InquiryWizard bandSlug={artist.bandSlug} bandName={artist.bandName} />
      </div>
    </div>
  )
}
