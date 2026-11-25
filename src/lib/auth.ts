import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type SessionOptions } from "iron-session";
import { Google } from "arctic";

export type User = {
  id: string;
  email: string;
  name: string;
};

type SessionData = User;

export const OAUTH_STATE_COOKIE = "google_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "google_code_verifier";

function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long");
  }
  return {
    cookieName: "todo_session",
    password,
    ttl: 60 * 60 * 24 * 30, // 30 days
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}

/** Emails from ALLOWED_EMAILS (comma, semicolon or whitespace separated), lower-cased. */
function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(/[\s,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Invite-only when ALLOWED_EMAILS lists any emails; open to every Google account when it is empty
 * or not set. Switching between the two needs no code change, only the setting (and a redeploy).
 */
export function isInviteOnly(): boolean {
  return allowedEmails().length > 0;
}

/** Whether this email may sign in (always true when sign-in is open to everyone). */
export function isAllowedEmail(email: string): boolean {
  const allowed = allowedEmails();
  return allowed.length === 0 || allowed.includes(email.trim().toLowerCase());
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.SESSION_SECRET);
}

/** The signed-in user, or null. Re-checks the allow list so removing an email revokes access. */
export async function getCurrentUser(): Promise<User | null> {
  if (!isAuthConfigured()) return null;
  const session = await getSession();
  if (!session.id || !session.email || !session.name) return null;
  if (!isAllowedEmail(session.email)) return null;
  return { id: session.id, email: session.email, name: session.name };
}

/** For Server Actions and pages: the user, or a redirect to the login page. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function googleClient(requestUrl: string) {
  // APP_URL pins the redirect to one domain; otherwise use the domain of the request.
  const origin = process.env.APP_URL ?? new URL(requestUrl).origin;
  return new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    new URL("/auth/google/callback", origin).toString(),
  );
}
