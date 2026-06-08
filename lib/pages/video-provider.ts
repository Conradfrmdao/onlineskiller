export type VideoProvider = "youtube" | "vimeo" | "bunny" | "cloudflare" | "mux" | "generic";

export function detectVideoProvider(value: string): VideoProvider {
  const url = value.toLowerCase();

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }

  if (url.includes("vimeo.com")) {
    return "vimeo";
  }

  if (url.includes("bunnycdn") || url.includes("b-cdn.net")) {
    return "bunny";
  }

  if (url.includes("cloudflarestream.com") || url.includes("videodelivery.net")) {
    return "cloudflare";
  }

  if (url.includes("mux.com") || url.includes("muxed.dev")) {
    return "mux";
  }

  return "generic";
}

export function getEmbedUrl(value: string, provider = detectVideoProvider(value)) {
  try {
    const url = new URL(value);

    if (provider === "youtube") {
      const id = url.hostname.includes("youtu.be")
        ? url.pathname.slice(1)
        : url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).at(-1);
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (provider === "vimeo") {
      const id = url.pathname.split("/").filter(Boolean).at(-1);
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }

    return value;
  } catch {
    return "";
  }
}
