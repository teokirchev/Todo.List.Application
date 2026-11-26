import type { MetadataRoute } from "next";
import { cookies } from "next/headers";
import { DEFAULT_TEAM, getTeam, isTeamId, TEAM_COOKIE } from "@/lib/teams";

/**
 * Lets phones and desktop browsers install the site as an app ("Add to Home Screen").
 * Icons and colour follow the club in the "team" cookie, so installing after picking a club gives
 * that club's crest. An already installed app keeps its icon until it is reinstalled (phones only
 * read it at install time; Android may refresh it on its own after a while).
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const saved = (await cookies()).get(TEAM_COOKIE)?.value;
  const team = getTeam(isTeamId(saved) ? saved : DEFAULT_TEAM);
  const dir = `/teams/${team.id}`;

  return {
    name: "Задачи",
    short_name: "Задачи",
    description: "Работни и лични задачи в цветовете на любимия ти отбор.",
    lang: "bg",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: team.colors.primary,
    icons: [
      { src: `${dir}/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${dir}/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${dir}/maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
