# API

Every HTTP endpoint of the site and every external service it calls is
documented here: method, path, auth, request, responses and errors, with an
example. Changing one means updating this file in the same PR.

The code that makes these calls lives in `src/core/api/` (see the layers in
[CLAUDE.md](../CLAUDE.md)); each exported function there has TSDoc too.

- [Supabase](#supabase) — database, login and file storage
- [Vercel Web Analytics and Speed Insights](#vercel-web-analytics-and-speed-insights) — visits and real-world speed
- Route Handlers and Server Actions — none yet

## Supabase

[Supabase](https://supabase.com) hosts the site's data: a Postgres database,
the login (GitHub, roadmap phase 1) and file storage (the CV, images). The
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

The server client reads the login session from the request cookies, so it is
created once per request. Pages that use it depend on the request: with Cache
Components, put that part inside `<Suspense>` (or cache data that is the same
for every visitor with `"use cache"`).

Once there is a login (phase 1), `src/proxy.ts` will also refresh the session
on each request with `supabase.auth.getClaims()`, since Server Components
can't write cookies.

### Errors

| When | What happens |
|---|---|
| A variable is missing | `getSupabaseEnv()` throws `Missing NEXT_PUBLIC_SUPABASE_URL …. Copy .env.example to .env.local …` |
| Wrong or revoked key | `401` `{"message": "Invalid API key", "hint": "Double check your API key."}` |
| Listing the database schema (`GET /rest/v1/`) with the publishable key | `401` `{"message": "Secret API key required"}`: on purpose, the public key can't see the database structure |
| A table that doesn't exist (or isn't exposed to the Data API) | `404` `{"code": "PGRST205", "message": "Could not find the table 'public.…' in the schema cache"}` |
| Secret key used from a browser | Supabase answers `401` |
| A query RLS doesn't allow | No error for reads: the rows are just not returned. Writes fail with Postgres error `42501` |

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

The scripts call these paths on the site's own domain; Vercel serves them
once each product is enabled in the dashboard:

| Method | Path | What |
|---|---|---|
| `GET` | `/_vercel/insights/script.js` | Web Analytics script; it then sends each page view to Vercel under `/_vercel/insights/` |
| `POST` | `/_vercel/insights/event` | Custom events (not used yet) |
| `GET` | `/_vercel/speed-insights/script.js` | Speed Insights script; it then sends the page's Core Web Vitals under `/_vercel/speed-insights/` |

The exact sending endpoints live inside Vercel's scripts, not in our code or
the npm packages; check the browser's Network tab on the live site to see them.

### Errors

| When | What happens |
|---|---|
| The product isn't enabled in the dashboard | The script answers `404`; nothing is collected, the page works normally |
| The free limit is reached | Collection pauses until the next period (Web Analytics) or for at least 14 days (Speed Insights) |
| A content blocker (e.g. uBlock Origin) blocks the script | That visit isn't counted; the page works normally |
