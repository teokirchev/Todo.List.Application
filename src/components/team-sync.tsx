"use client";

import { useEffect } from "react";
import { TEAM_COOKIE, type TeamId } from "@/lib/teams";

/** Puts <html data-team> and the cookie in line with the team saved for the user. */
export function applyTeam(team: TeamId) {
  document.documentElement.setAttribute("data-team", team);
  document.cookie = `${TEAM_COOKIE}=${team}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax${
    location.protocol === "https:" ? "; secure" : ""
  }`;
}

/**
 * Keeps this browser on the team saved in the database, e.g. after picking a club on another device
 * (the cookie the pre-paint script reads is per browser).
 */
export function TeamSync({ team }: { team: TeamId }) {
  useEffect(() => {
    if (document.documentElement.getAttribute("data-team") !== team) applyTeam(team);
  }, [team]);
  return null;
}
