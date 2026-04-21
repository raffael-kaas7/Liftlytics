import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Liftlytics",
    short_name: "Liftlytics",
    description: "Local-first strength training progress tracker.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#080b10",
    theme_color: "#f97316",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
