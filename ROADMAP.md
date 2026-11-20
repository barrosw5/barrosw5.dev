# Roadmap — Personal Site

**English** | [Português](ROADMAP.pt.md)

A personal site that works as a portfolio/CV and is useful day to day. All content is managed from an admin area, without touching code.

## Features

### Public
- **About** — introduction, experience, skills, what I'm doing right now, contacts and the CV (view and download the PDF)
- **Projects** — GitHub repos (via the API), with selection, order and descriptions chosen in the admin
- **Wishlist** — items with link, current price, priority and price history; visitors can reserve an item ("I'll give this one")

### Admin (`/admin`, restricted access)
- GitHub login, restricted to my ID
- Edit "about me" and /now (markdown)
- Manage projects: show/hide, order, custom description
- Upload a new CV
- Manage the wishlist: add/remove items, see reservations, turn on price tracking

## Architecture

```
Next.js (Vercel)
 ├─ public site (Server Components + cache/revalidate)
 └─ /admin (protected) → Server Actions → revalidatePath()
        │
    Supabase ── Postgres · Auth (GitHub) · Storage (CV, images)
        ▲
Rust worker (GitHub Actions cron, e.g. every 6 h)
 └─ fetches the prices → saves the history → (optional) sends a notification
```

## Stack

| Layer | Technology |
|---|---|
| Frontend + backend | Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| Data | Supabase (Postgres, Auth, Storage) |
| Price tracker | Rust (`tokio`, `reqwest`, `scraper`, `sqlx`) |
| Deploy | Vercel (site), GitHub Actions (worker cron) |
| Domain | `*.vercel.app` for now; custom domain later |

## Data model (draft)

- `profile` — about me, "now" content, links, CV URL, current place (Lisbon/Azores)
- `projects` — repo, visible, order, custom description
- `wishlist_items` — name, URL, image, priority, current price, tracking on
- `price_history` — item, price, date
- `reservations` — item, optional name/message, date

## Phases

Phase 0 lays the foundations. From then on, each phase is **one feature, done end to end**, following the architecture in [CLAUDE.md](CLAUDE.md):

```
DB → API (core/api, documented in docs/API.md) → Service → Hook → Components (+ stories, en/pt) → Page → Tests
```

A feature is only done when it works in both languages, in light and dark mode, on mobile and desktop, and with the CI green.

### Phase 0 — Foundations
- [x] Set up Next.js + TypeScript + Tailwind + shadcn/ui
- [x] Storybook + Vitest (stories run as tests)
- [x] CI (GitHub Actions: lint, typecheck, tests, build, CodeQL, PR title) + protected `main`
- [x] i18n: `t()` function + `en.json` / `pt.json` + locale in the URL (`/en`, `/pt`)
- [x] Language switcher
- [x] Dark mode (toggle + system preference)
- [x] Visual identity — direction: 3–5 references (what I like in each), 3 words for how the site should feel, and how it adapts from mobile to desktop
- [x] Visual identity — design tokens in `globals.css`: colour palette (light and dark), fonts, type scale, spacing, radii and breakpoints, all mobile-first
- [x] Visual identity — apply to the existing components (LanguageSwitcher, ThemeToggle, Welcome) and check them on mobile and desktop in Storybook
- [x] Base layout: header, navigation (mobile menu + desktop nav), footer (+ stories), "under construction" pages and a 404 page
- [x] ⌘K / Ctrl+K command palette (desktop; shows ⌘ on Mac and Ctrl elsewhere)
- [ ] Playwright e2e setup (+ CI job)
- [ ] Supabase project + environment variables (`.env.example`)
- [ ] Deploy to Vercel (with a preview deploy on each PR)

### Phase 1 — Auth and admin
- [ ] GitHub login (Supabase Auth), restricted to my ID
- [ ] `proxy.ts` protecting `/admin` (Next 16 name for the old `middleware.ts`)
- [ ] Admin layout and navigation (+ stories)
- [ ] Tests: unit + e2e (access denied without login, allowed with it)

### Phase 2 — About (experience, now, contacts)
- [ ] DB: `profile` table
- [ ] API + service: `profileApi` / `profileService` (+ docs)
- [ ] Hook: `useProfile`
- [ ] Components: the About bento — experience, stack, what I'm doing now, contacts, local time (+ stories)
- [ ] Pages: the home intro and `/about` (replaces the "under construction" page)
- [ ] Admin: edit about and "now" (markdown), the current place (Lisbon/Azores) and the contacts
- [ ] Decide the public contact email (personal, an alias or a separate address)
- [ ] Tests

### Phase 3 — Projects
- [ ] DB: `projects` table
- [ ] API: GitHub repos (with cache/revalidate) + `projectsApi` (+ docs)
- [ ] Service: merge GitHub data with the admin settings (visible, order, description)
- [ ] Hook: `useProjects`
- [ ] Components: `ProjectList`, `ProjectCard` (+ stories)
- [ ] Pages: `/projects` (replaces the "under construction" page) and the featured projects on the home page
- [ ] Admin: show/hide, order and custom description
- [ ] Tests

### Phase 4 — CV
- [ ] Storage: bucket for the CV in Supabase Storage
- [ ] API + service + hook for the CV (+ docs)
- [ ] Components: `CvViewer`, download button (+ stories)
- [ ] CV card on `/about` (view and download)
- [ ] Admin: upload a new CV
- [ ] Tests

### Phase 5 — Wishlist
- [ ] DB: `wishlist_items` table
- [ ] API + service: `wishlistApi` / `wishlistService` (+ docs)
- [ ] Hook: `useWishlist`
- [ ] Components: `WishlistGrid`, `WishlistCard` (+ stories)
- [ ] Page: `/wishlist`, read-only (replaces the "under construction" page)
- [ ] Admin: add, edit and remove items
- [ ] Tests

### Phase 6 — Wishlist reservations
- [ ] DB: `reservations` table
- [ ] API + service + hook for reservations (+ docs)
- [ ] "I'll give this one" button with optional name/message (+ stories)
- [ ] Reserved item shows as reserved to other visitors
- [ ] Basic anti-spam (rate limit / captcha)
- [ ] Admin: see and manage reservations
- [ ] Tests

### Phase 7 — Rust price tracker
- [ ] DB: `price_history` table + "tracking on" field on items
- [ ] Rust worker: read the items with tracking on
- [ ] Price scraping (per store)
- [ ] Save to `price_history` and update the current price
- [ ] GitHub Actions with cron (e.g. every 6 h)
- [ ] Admin: turn price tracking on/off per item
- [ ] Price history chart on each item's page (+ stories)
- [ ] (Optional) Alert when the price drops (email/Telegram)
- [ ] Tests (worker + chart)

### Extras (later)
- [ ] Custom domain
- [ ] Easter eggs: Zelda and Undertale/Deltarune references (ideas in [docs/DESIGN.md](docs/DESIGN.md))
