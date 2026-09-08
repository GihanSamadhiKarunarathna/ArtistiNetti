export function spotifyEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes("spotify.com")) return null
    const match = parsed.pathname.match(
      /\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/,
    )
    if (!match) return null
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`
  } catch {
    return null
  }
}

export function youtubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    let videoId: string | null = null

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1)
    } else if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v")
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1]
      }
    }

    if (!videoId) return null
    return `https://www.youtube.com/embed/${videoId}`
  } catch {
    return null
  }
}
