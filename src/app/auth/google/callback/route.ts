import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { decodeIdToken } from "arctic";
import {
  getSession,
  googleClient,
  isAllowedEmail,
  isAuthConfigured,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
} from "@/lib/auth";
import { upsertUser } from "@/lib/todo-repo";

type GoogleClaims = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

export async function GET(request: Request) {
  // Always run per request; never prerender this at build time.
  await connection();
  if (!isAuthConfigured()) redirect("/login?error=config");

  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const state = params.get("state");

  const store = await cookies();
  const storedState = store.get(OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = store.get(OAUTH_VERIFIER_COOKIE)?.value;
  store.delete(OAUTH_STATE_COOKIE);
  store.delete(OAUTH_VERIFIER_COOKIE);

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    redirect("/login?error=failed");
  }

  // The ID token comes straight from Google's token endpoint over TLS, so its claims can be trusted.
  let claims: GoogleClaims | null = null;
  try {
    const tokens = await googleClient(request.url).validateAuthorizationCode(code, codeVerifier);
    claims = decodeIdToken(tokens.idToken()) as GoogleClaims;
  } catch (error) {
    console.error("Google sign-in failed", error);
  }
  if (!claims?.sub || !claims.email || claims.email_verified !== true) {
    redirect("/login?error=failed");
  }
  if (!isAllowedEmail(claims.email)) {
    redirect("/login?error=not_allowed");
  }

  const email = claims.email.toLowerCase();
  const name = claims.name?.trim() || email;
  const userId = await upsertUser(claims.sub, email, name);

  const session = await getSession();
  session.id = userId;
  session.email = email;
  session.name = name;
  await session.save();

  redirect("/");
}
