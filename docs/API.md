# API

Every HTTP endpoint of the site and every external service it calls is
documented here: method, path, auth, request, responses and errors, with an
example. Changing one means updating this file in the same PR.

The code that makes these calls lives in `src/core/api/` (see the layers in
[CLAUDE.md](../CLAUDE.md)); each exported function there has TSDoc too.

- [Supabase](#supabase) — database, login and file storage
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
