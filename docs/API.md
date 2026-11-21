# API

Every HTTP endpoint of the site and every external service it calls is
documented here: method, path, auth, request, responses and errors, with an
example. Changing one means updating this file in the same PR.

The code that makes these calls lives in `src/core/api/` (see the layers in
[CLAUDE.md](../CLAUDE.md)); each exported function there has TSDoc too.

- [Supabase](#supabase) — database, login and file storage
- [Vercel Web Analytics and Speed Insights](#vercel-web-analytics-and-speed-insights) — visits and real-world speed
- [Route Handlers](#route-handlers) — the sign-in callback
- Server Actions — none yet

## Supabase

[Supabase](https://supabase.com) hosts the site's data: a Postgres database,
the login (GitHub) and file storage (the CV, images). The
site talks to it over HTTPS through the `@supabase/supabase-js` client.

### Connection

The project is `barrosw5-dev`, in Europe, on the Free plan. It was created
with the Data API on, RLS turned on automatically for new tables, and new
tables **not** exposed to the API automatically (each migration grants access
explicitly). The database password is kept by the owner, never in the repo.

| | |
|---|---|
| Base URL | `NEXT_PUBLIC_SUPABASE_URL`, e.g. `https://abcdefgh.supabase.co` |
| Key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`) |
| Where to find them | Supabase dashboard → the project → **Connect**, or **Settings → API Keys** |
| Locally | `.env.local` (copy [.env.example](../.env.example)); never committed |
| On Vercel | Project → Settings → Environment Variables |

The values are read by `getSupabaseEnv()` in
`src/core/api/supabase/env.ts`, which throws a clear error naming any missing
variable.

### Keys and security

| Key | Prefix | Where it may be used | What it can do |
|---|---|---|---|
| Publishable | `sb_publishable_` | Anywhere, including the browser | Only what **Row Level Security** (RLS) policies allow |
| Secret | `sb_secret_` | Server only, never with the `NEXT_PUBLIC_` prefix | Everything: it skips RLS. Not used yet |

Because the publishable key is public, **every table must have RLS turned on
with explicit policies**: RLS is what protects the data, not the key. The
legacy `anon` / `service_role` keys are not used (Supabase retires them at the
end of 2026).

The key is sent by the client in the `apikey` header of every request; a
signed-in user's session goes in `Authorization: Bearer <access token>`.

### Clients

| Function | File | Use it in |
|---|---|---|
| `createSupabaseBrowserClient()` | `src/core/api/supabase/browserClient.ts` | Code running in the browser (Client Components) |
| `createSupabaseServerClient()` | `src/core/api/supabase/serverClient.ts` | Server Components, Server Actions, Route Handlers |
| `readProxySession()` | `src/core/api/supabase/proxyClient.ts` | `src/proxy.ts` |
| `createSupabasePublicClient()` | `src/core/api/supabase/publicClient.ts` | Reading public data on the server. It has no cookies or session, so results can be cached with `"use cache"` |

The server client reads the login session from the request cookies, so it is
created once per request. Pages that use it depend on the request: with Cache
Components, put that part inside `<Suspense>` (or cache data that is the same
for every visitor with `"use cache"`).

`src/proxy.ts` refreshes the session with `supabase.auth.getClaims()`, since
Server Components can't write cookies. It only does so on `/{locale}/admin`
pages: public pages never wait for Supabase and never set a session cookie, so
a CDN can't store one and serve it to someone else.

### Auth

Sign-in is GitHub OAuth through Supabase Auth, with PKCE (a one-time secret
kept in the cookies of the browser that started the sign-in, so a `code`
intercepted on its way back is useless). PKCE doesn't help if an attacker
starts the sign-in themselves and the allow-list accepts a site they control:
they hold their own secret and can use the `code`. That's why the production
project only allows hosts we own.

```
Browser → GET /auth/v1/authorize → GitHub (login, password, 2FA)
        → GET /api/auth/callback/{locale}?code=…
        → POST /auth/v1/token?grant_type=pkce → session in cookies → /{locale}/admin
```

| Method | Path | Called from | Auth | Request | Success |
|---|---|---|---|---|---|
| `GET` | `/auth/v1/authorize?provider=github&redirect_to=…&code_challenge=…` | Browser (`signInWithGitHub`) | `apikey` | Query string | `302` to GitHub |
| `POST` | `/auth/v1/token?grant_type=pkce` | Server (`exchangeCodeForClaims`) | `apikey` | `{ "auth_code": "…", "code_verifier": "…" }` | `200` with the session |
| `POST` | `/auth/v1/token?grant_type=refresh_token` | Proxy, when the token expired | `apikey` | `{ "refresh_token": "…" }` | `200` with a new session |
| `GET` | `/auth/v1/.well-known/jwks.json` | Server (`getClaims`) | None | None | `200` with the public signing keys |
| `POST` | `/auth/v1/logout` | Browser (`signOut`), server (`endServerSession`) | `Authorization: Bearer <access token>` | None | `204` |

Who is the admin: only an account with `app_metadata.role = "admin"`.
`app_metadata` can only be changed from the database or with the secret key.
`user_metadata` is editable by the user and must never decide access. The check
runs in the proxy and again in `requireAdmin()`.

Setup, once, outside the code:

1. GitHub → Settings → Developer settings → **OAuth Apps**: homepage is the
   site, callback is `https://<project-ref>.supabase.co/auth/v1/callback`.
2. Supabase → Authentication → Sign In / Providers → **GitHub**: paste the
   Client ID and secret.
3. Supabase → Authentication → URL Configuration: **Site URL** is the production
   address; **Redirect URLs** allow `/api/auth/callback/*` on localhost and
   production only. Never a wildcard in the host here: `vercel.app` is shared
   with every Vercel customer.
4. Sign in once (you are refused, but the account now exists), then in the SQL
   Editor give it the role:

   ```sql
   update auth.users u
   set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}') || '{"role":"admin"}'
   from auth.identities i
   where i.user_id = u.id
     and i.provider = 'github'
     and i.identity_data ->> 'user_name' = '<github-username>'
   returning u.id, i.provider_id;
   ```

5. Sign in again, then turn **off** "Allow new users to sign up" in
   Authentication → Sign In / Providers, so no other account can be created.

#### Vercel previews

The admin login doesn't work on previews, on purpose. Each preview has its own
address, so allowing them would take a wildcard on `vercel.app`, a domain shared
with every Vercel customer. A sign-in started on a preview isn't completed
there: Supabase sends the browser to the Site URL (production), without a
session on the preview. To test the admin, use localhost or production.

### Tables

Migrations live in `supabase/migrations/` and are run by hand, once, in
Supabase → **SQL Editor**, before merging the code that needs them.

#### `profile`

The content of the About page and the footer. It has **a single row** and
everything in it is public.

| Who | Read | Update | Insert / delete |
|---|---|---|---|
| Visitor (`anon`) | Yes | No (`42501`) | No (`42501`) |
| Signed in, not the admin | Yes | No: 0 rows changed | No (`42501`) |
| Admin (`app_metadata.role = "admin"`) | Yes | Yes | No (`42501`) |

| Column | Type | Notes |
|---|---|---|
| `id` | `boolean` | Always `true`, which is what limits the table to one row |
| `about_en`, `about_pt` | `text` | About me |
| `doing_now_en`, `doing_now_pt` | `text` | What I'm doing now |
| `current_place` | `text` | `lisbon`, `pontaDelgada` or `amsterdam` |
| `experience` | `jsonb` list | `{ id, title: { en, pt }, company, startDate, endDate, description: { en, pt } }` |
| `stack` | `jsonb` list | `{ id, name }` |
| `education` | `jsonb` list | `{ id, title: { en, pt }, school, startDate, endDate, description: { en, pt } }` |
| `certificates` | `jsonb` list | `{ id, name: { en, pt }, issuer, issuedOn, url }`; `url` may be `null` |
| `contacts` | `jsonb` list | `{ id, href }`; also shown in the footer |

Dates are `YYYY-MM`. An `endDate` of `null` means "present". Lists are stored in
display order.

Reading it:

| Method | Path | Called from | Auth | Request | Success |
|---|---|---|---|---|---|
| `GET` | `/rest/v1/profile?select=about_en,about_pt,doing_now_en,doing_now_pt,current_place,experience,stack,education,certificates,contacts` | Server (`fetchProfileRow`) | `apikey` | `Accept: application/vnd.pgrst.object+json` | `200` with the row as one object |

The site reads it through `getProfile()` in
`src/core/services/profileServerService.ts`:

- The result is cached for days with the tag `profile`.
- The request gives up after 5 seconds.
- If it fails, `getProfile()` doesn't throw. It logs the error and returns the
  fallback profile (the current place, the GitHub and LinkedIn links, empty
  About content), cached for only a few minutes.
- Entries that don't have the fields above, and links that aren't `https:` or
  `mailto:`, are left out by `toProfile()`.

Example of one `experience` entry:

```json
{
  "id": "6f1c2f5e-3f7b-4a55-9d1e-2b7c8a4e1f90",
  "title": { "en": "Software developer", "pt": "Programador" },
  "company": "Example",
  "startDate": "2024-09",
  "endDate": null,
  "description": { "en": "What I did there.", "pt": "O que fiz lá." }
}
```

### Errors

| When | What happens |
|---|---|
| A variable is missing | `getSupabaseEnv()` throws `Missing NEXT_PUBLIC_SUPABASE_URL …. Copy .env.example to .env.local …` |
| Wrong or revoked key | `401` `{"message": "Invalid API key", "hint": "Double check your API key."}` |
| Listing the database schema (`GET /rest/v1/`) with the publishable key | `401` `{"message": "Secret API key required"}`: on purpose, the public key can't see the database structure |
| A table that doesn't exist (or isn't exposed to the Data API) | `404` `{"code": "PGRST205", "message": "Could not find the table 'public.…' in the schema cache"}` |
| Secret key used from a browser | Supabase answers `401` |
| A query RLS doesn't allow | No error for reads: the rows are just not returned. Writes fail with Postgres error `42501` |
| The `profile` row is missing | `406` `{"code": "PGRST116", "message": "Cannot coerce the result to a single JSON object"}`; `getProfile()` uses the fallback profile |
| `redirect_to` isn't in the Redirect URLs | Supabase sends the browser to the Site URL instead of the callback |
| Invalid, expired or reused sign-in code | `400` from `/auth/v1/token`; the callback redirects with `?error=failed` |
| Sign-ups turned off and an unknown account signs in | Supabase refuses it; the callback redirects with `?error=failed` |
| A token with a bad signature or expired beyond renewal | `getClaims()` returns an error; the visitor is treated as signed out |

### Example

Checking the connection (Supabase Auth's health endpoint, which only needs
the key):

```http
GET https://abcdefgh.supabase.co/auth/v1/health
apikey: sb_publishable_…
```

```json
{ "version": "v2.198.0", "name": "GoTrue", "description": "GoTrue is a user registration and authentication API" }
```

The table endpoints (`/rest/v1/<table>`) are documented with each feature as
the tables are created (roadmap phases 2 to 7).

## Route Handlers

### `GET /api/auth/callback/{locale}`

Where the GitHub sign-in comes back to. Code:
`src/app/api/auth/callback/[locale]/route.ts`.

| | |
|---|---|
| Auth | None to call it; the PKCE cookie set when the sign-in started is required for it to succeed |
| Path | `locale`: `en` or `pt` (anything else falls back to `en`) |
| Query | `code`: the one-time code from Supabase |
| Body | None |
| Cache | `Cache-Control: private, no-store` |

The destination is fixed in the code and never read from the URL, so this
address can't redirect anyone to another site.

| Response | When |
|---|---|
| `303` → `/{locale}/admin`, with the session cookies | The admin signed in |
| `303` → `/{locale}/admin/login?error=denied` | Another account signed in; its session is ended at once |
| `303` → `/{locale}/admin/login?error=failed` | No code, or a bad one, or Supabase failed |

Example:

```http
GET /api/auth/callback/pt?code=3f1c…
```

```http
HTTP/1.1 303 See Other
Location: https://barrosw5-dev.vercel.app/pt/admin
Cache-Control: private, no-store
Set-Cookie: sb-<project-ref>-auth-token=base64-…; Path=/; SameSite=Lax
```

## Vercel Web Analytics and Speed Insights

Vercel's free analytics: **Web Analytics** counts visits (pages, referrers,
countries, browsers, devices) and **Speed Insights** measures how fast pages
really are on visitors' devices (Core Web Vitals). Results are in the Vercel
dashboard → the project → **Analytics** / **Speed Insights**.

| | |
|---|---|
| Code | `src/analytics/SiteAnalytics.tsx` (`@vercel/analytics`, `@vercel/speed-insights`), rendered by the root layout |
| When | Only on Vercel (`VERCEL=1` at build time). Locally and on CI nothing is loaded |
| Auth | None: same-origin requests to the deployment itself |
| Cookies | None. Visitors are told apart by a hash that changes every day |
| Plan | Hobby (free): Web Analytics 50 000 events/month, 1 month of history; Speed Insights 10 000 events over the last 30 days. Over the limit, collection pauses (nothing is charged) |
| Filter | Visits from automated browsers (`navigator.webdriver`, e.g. our Playwright tests) are dropped in `beforeSend` and never sent |

The packages ask for `/_vercel/insights/script.js` and
`/_vercel/speed-insights/script.js`, but on the live site Vercel serves both
from **random paths of the project** (so content blockers don't recognise
them). Seen on production on 2026-11-20:

| Method | Path (production) | What |
|---|---|---|
| `GET` | `/59d6db039b8c6758/script.js` | Web Analytics script |
| `POST` | `/59d6db039b8c6758/view` | One page view, sent on every page (also client-side navigations) |
| `GET` | `/044f2daf49ade419/script.js` | Speed Insights script |
| `POST` | `/044f2daf49ade419/vitals` | The page's Core Web Vitals, sent when the visitor leaves or hides the page |

The random part is Vercel's and may change; read the current one in the
browser's Network tab. Locally there is nothing: the components only render
on Vercel.

Checked on production: an automated browser (`navigator.webdriver`, or a
"HeadlessChrome" user agent, which Vercel's scripts skip on their own) sends
nothing; a normal browser sends the requests above.

### Errors

| When | What happens |
|---|---|
| The product isn't enabled in the dashboard | The script answers `404`; nothing is collected, the page works normally |
| The free limit is reached | Collection pauses until the next period (Web Analytics) or for at least 14 days (Speed Insights) |
| A content blocker manages to block the script anyway | That visit isn't counted; the page works normally |
