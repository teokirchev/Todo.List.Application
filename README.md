# Todo List

Work and personal todo lists in a red-and-white football club theme. Built with Next.js, stored in Postgres (Neon), with Google sign-in limited to an allow list of emails.

## How it works

- **Sign-in:** Google OAuth (with PKCE) via [arctic](https://arcticjs.dev). Only emails in `ALLOWED_EMAILS` can sign in. Removing an email revokes access on the next request.
- **Session:** an encrypted, HTTP-only cookie ([iron-session](https://github.com/vvo/iron-session)), valid for 30 days.
- **Data:** Postgres via the [Neon serverless driver](https://neon.tech/docs/serverless/serverless-driver). Tables are created automatically on first use (`src/lib/db.ts`). Every query is scoped to the signed-in user.
- **Mutations:** Server Actions (`src/app/actions.ts`) that re-check the session and validate input. The UI updates optimistically and then takes the server's answer.
- **Old data:** todos saved in the browser (`localStorage`) by earlier versions are imported once after the first sign-in.

## Setup

### 1. Database

In the Vercel project: **Storage → Create Database → Neon** and connect it to the project. This sets `DATABASE_URL`.

### 2. Google OAuth client

In [Google Cloud Console](https://console.cloud.google.com/):

1. Create a project.
2. **APIs & Services → OAuth consent screen**: user type *External*, fill in the app name and emails. The app asks only for `openid`, `email` and `profile`, so it can be published without verification.
3. **Credentials → Create credentials → OAuth client ID → Web application**, with these authorized redirect URIs:
   - `https://<your-domain>/auth/google/callback`
   - `http://localhost:3000/auth/google/callback`
4. Copy the client ID and secret.

### 3. Environment variables

Set these in Vercel (**Settings → Environment Variables**) and redeploy. See `.env.example`.

| Name | Value |
| --- | --- |
| `GOOGLE_CLIENT_ID` | From step 2 |
| `GOOGLE_CLIENT_SECRET` | From step 2 |
| `SESSION_SECRET` | Random string, 32+ characters |
| `ALLOWED_EMAILS` | `me@gmail.com, friend@gmail.com` |
| `APP_URL` | Optional, e.g. `https://your-app.vercel.app` |
| `CONTACT_EMAIL` | Optional, shown on `/privacy` for data requests |

### 4. Local development

```bash
cp .env.example .env.local   # fill in the values (or: npx vercel env pull .env.local)
npm install
npm run dev
```

Open http://localhost:3000.
