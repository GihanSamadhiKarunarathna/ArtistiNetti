import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { nanoid } from "nanoid"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

function safeExtension(filename: string) {
  const ext = path.extname(filename).toLowerCase()
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : ""
}

/**
 * Uploads a file and returns its public URL. Uses Vercel Blob when
 * BLOB_READ_WRITE_TOKEN is configured, otherwise falls back to writing into
 * /public/uploads so file uploads work out of the box in local development.
 */
export async function putFile(
  file: File,
  folder: string,
): Promise<{ url: string }> {
  const filename = `${folder}/${nanoid()}${safeExtension(file.name)}`

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob")
    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return { url: blob.url }
  }

  const destDir = path.join(UPLOAD_DIR, folder)
  await mkdir(destDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  const localName = path.basename(filename)
  await writeFile(path.join(destDir, localName), buffer)

  return { url: `/uploads/${folder}/${localName}` }
}
