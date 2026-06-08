import { describe, expect, it } from "vitest";

import { detectVideoProvider, getEmbedUrl } from "@/lib/pages/video-provider";

describe("video provider utilities", () => {
  it("detects supported providers", () => {
    expect(detectVideoProvider("https://youtu.be/abc123")).toBe("youtube");
    expect(detectVideoProvider("https://vimeo.com/12345")).toBe("vimeo");
    expect(detectVideoProvider("https://stream.mux.com/example.m3u8")).toBe("mux");
  });

  it("creates safe provider embed URLs", () => {
    expect(getEmbedUrl("https://www.youtube.com/watch?v=abc123")).toBe("https://www.youtube.com/embed/abc123");
    expect(getEmbedUrl("https://vimeo.com/12345")).toBe("https://player.vimeo.com/video/12345");
  });
});
