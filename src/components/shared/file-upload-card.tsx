"use client"

import { useRef, useState, useTransition } from "react"
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type UploadResult = { error: string | null; url?: string }

export function FileUploadCard({
  label,
  accept,
  currentUrl,
  action,
  preview = "image",
}: {
  label: string
  accept: string
  currentUrl?: string | null
  action: (formData: FormData) => Promise<UploadResult>
  preview?: "image" | "file"
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(currentUrl ?? null)
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.set("file", file)

    startTransition(async () => {
      const result = await action(formData)
      if (result.error) {
        toast.error("Upload failed. Please try again.")
        return
      }
      setUrl(result.url ?? null)
      toast.success(`${label} updated`)
    })
    e.target.value = ""
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {preview === "image" && url ? (
          <Image src={url} alt={label} width={64} height={64} className="size-16 object-cover" />
        ) : url ? (
          <CheckCircle2 className="size-6 text-primary" />
        ) : (
          <FileText className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-xs text-muted-foreground hover:text-primary hover:underline"
          >
            {url}
          </a>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud />
        {isPending ? "..." : "Upload"}
      </Button>
    </div>
  )
}
