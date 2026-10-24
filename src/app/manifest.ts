import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "KT Meta",
    description: "Tier lists and comp guides for Kanto Tactics Ranked.",
    start_url: "/",
    display: "standalone",
    background_color: "#111216",
    theme_color: "#111216",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
