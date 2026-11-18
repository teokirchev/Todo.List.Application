import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { generateCodeVerifier, generateState } from "arctic";
import { googleClient, isAuthConfigured, OAUTH_STATE_COOKIE, OAUTH_VERIFIER_COOKIE } from "@/lib/auth";

export async function GET(request: Request) {
  // Always run per request; never prerender this at build time.
  await connection();
  if (!isAuthConfigured()) redirect("/login?error=config");

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = googleClient(request.url).createAuthorizationURL(state, codeVerifier, ["openid", "email", "profile"]);
  url.searchParams.set("prompt", "select_account");

  const store = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 10,
  };
  store.set(OAUTH_STATE_COOKIE, state, options);
  store.set(OAUTH_VERIFIER_COOKIE, codeVerifier, options);

  redirect(url.toString());
}
