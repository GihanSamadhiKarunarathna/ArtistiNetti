import { describe, expect, it } from "vitest"
import { spotifyEmbedUrl, youtubeEmbedUrl } from "@/lib/embeds"

describe("spotifyEmbedUrl", () => {
  it("converts a track URL to an embed URL", () => {
    expect(spotifyEmbedUrl("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT")).toBe(
      "https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT",
    )
  })

  it("converts a playlist URL with query params", () => {
    expect(
      spotifyEmbedUrl("https://open.spotify.com/playlist/37i9dQZF1?si=abc123"),
    ).toBe("https://open.spotify.com/embed/playlist/37i9dQZF1")
  })

  it("returns null for non-Spotify URLs", () => {
    expect(spotifyEmbedUrl("https://example.com/track/123")).toBeNull()
  })

  it("returns null for malformed URLs", () => {
    expect(spotifyEmbedUrl("not a url")).toBeNull()
  })
})

describe("youtubeEmbedUrl", () => {
  it("converts a watch URL", () => {
    expect(youtubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    )
  })

  it("converts a youtu.be short URL", () => {
    expect(youtubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    )
  })

  it("converts a shorts URL", () => {
    expect(youtubeEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    )
  })

  it("returns null for non-YouTube URLs", () => {
    expect(youtubeEmbedUrl("https://vimeo.com/12345")).toBeNull()
  })
})
