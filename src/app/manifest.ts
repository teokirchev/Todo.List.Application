import type { MetadataRoute } from "next";

/**
 * Lets phones and desktop browsers install the site as an app ("Add to Home Screen").
 * The app icon is the same football on grass for every club; the browser tab shows the club's crest
 * (see TEAM_INIT_SCRIPT in src/lib/teams.ts). iPhones use src/app/apple-icon.png instead.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Задачи",
    short_name: "Задачи",
    description: "Работни и лични задачи в цветовете на любимия ти отбор.",
    lang: "bg",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16803a",
    icons: [
      { src: "/app-icon/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-icon/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // The ball sits well inside the safe zone, so the same picture works when the phone crops it.
      { src: "/app-icon/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
