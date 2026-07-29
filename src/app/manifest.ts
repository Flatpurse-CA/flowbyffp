import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FlatPurse Flow",
    short_name: "Flow",
    description: "The AI-powered booking and client management platform built for salons and stylists.",
    start_url: "/main",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#712AE2",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon1.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
