import { TEAMS, type Team } from "@/lib/teams";

type TextField = "name" | "nickname" | "founded" | "stadium" | "motto" | "chant" | "footer";

/**
 * A short text of the active team. All teams' versions are rendered and CSS (from teamCss())
 * shows only the one matching <html data-team>, so it is right on the first paint and needs no JS.
 * Works in server and client components.
 */
export function TeamText({ field }: { field: TextField }) {
  return (
    <>
      {TEAMS.map((team: Team) => (
        <span key={team.id} data-team-text={team.id}>
          {String(team[field])}
        </span>
      ))}
    </>
  );
}
