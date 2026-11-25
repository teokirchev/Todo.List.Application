import "server-only";
import { cookies } from "next/headers";
import { TEAM_COOKIE, type TeamId } from "@/lib/teams";

/**
 * Remembers the team in a cookie so the inline script can apply it before the first paint.
 * Not HTTP-only on purpose: that script must read it. It holds only the team id.
 */
export async function setTeamCookie(team: TeamId) {
  (await cookies()).set(TEAM_COOKIE, team, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });
}
