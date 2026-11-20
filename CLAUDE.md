@AGENTS.md

# barrosw5.dev — project rules

Personal site (portfolio/CV, /now, wishlist) with an admin area. The plan and phases are in [ROADMAP.md](ROADMAP.md).

Stack: Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui, Supabase, Storybook, Vitest. Package manager: **pnpm**.

## 0. Before writing any code

- **Always read this file and [ROADMAP.md](ROADMAP.md) first** and check that the work fits both: the rules here and the current roadmap phase.
- **When a roadmap step is done, tick it (`- [x]`) in both [ROADMAP.md](ROADMAP.md) and [ROADMAP.pt.md](ROADMAP.pt.md)**, in the same PR that finishes it.

## 1. Languages: English and European Portuguese (always)

- The site always exists in **`en`** and **`pt`**. No feature ships in only one language.
- In code, URLs and file names the Portuguese locale is just **`pt`**; the content is still European Portuguese. Where the full tag matters (`<html lang>`, `Intl` formatting) use `languageTags[locale]` from `@/i18n/routing`, which maps `pt` → `pt-PT`.
- **No user-facing text is hardcoded in components.** All text goes through a `t('key')` function that reads the translation from the active locale's JSON.
- Translations live in `src/i18n/messages/en.json` and `src/i18n/messages/pt.json`. **Both files always have the same keys**: a key added to one is added to the other in the same commit (`src/i18n/messages.test.ts` fails the CI otherwise).
- Library: **next-intl**. Use `useTranslations("namespace")` in components, `getTranslations` in async server code (e.g. `generateMetadata`). Keys are type-checked against `en.json`.
- URLs always carry the language (`/en/...`, `/pt/...`); every route lives under `src/app/[locale]/`. For links and navigation use `Link`, `redirect`, `useRouter` and `usePathname` from `@/i18n/navigation`, **never** from `next/link` or `next/navigation`, so the language prefix is kept.
- Keys are grouped by feature (e.g. `wishlist.reserve.button`, `admin.projects.title`).
- Portuguese **from Portugal**, not Brazil (e.g. "ecrã", "utilizador", "guardar", "transferir").
- These are translated too: `aria-label`, `alt`, `title`, placeholders, error messages and page metadata.
- Dates, numbers and prices are formatted for the locale (`Intl`, with `languageTags[locale]`), through functions in `core/utils/`.
- **Docs too:** `README` and `ROADMAP` always exist in both languages: `README.md` / `ROADMAP.md` in English (what GitHub shows by default) and `README.pt.md` / `ROADMAP.pt.md` in Portuguese, each linking to the other at the top. Changing one means changing the other in the same PR.

## 2. Frontend architecture

Flow, always in this direction (each layer only calls the next one):

```
Page (View) → Components (UI + Hook) → Hooks (State/Logic) → Services (Business rules) → API (HTTP calls)
```

Structure in `src/`:

| Folder | Role | May import |
|---|---|---|
| `app/**/page.tsx` | **Pages (views).** Empty shells that only import and assemble components. No state, no logic, no calls. | `components/` |
| `components/` | UI components (e.g. `LoginForm`, `Dashboard`). Each component calls **its own hook** for state and logic, keeping the page clean. `components/ui/` holds the shadcn primitives. | `hooks/`, `core/utils/`, `core/types/`, other components |
| `hooks/` | Custom hooks (e.g. `useAuth.ts`, `useDashboard.ts`). Manage state (`useState`, `useEffect`), call services and return data to the component. | `core/services/`, `core/types/` |
| `core/services/` | Business logic. Process data before sending it to the API and after receiving it. | `core/api/`, `core/types/`, `core/utils/` |
| `core/api/` | Plain HTTP calls (`fetch`), e.g. `authApi.ts`. **No React state.** | `core/types/` |
| `core/types/` | Shared TypeScript interfaces and types. | — |
| `core/utils/` | Pure presentation functions (e.g. `formatTime`, `formatPrice`), no state, no API. **The only `core/` folder components may import directly.** | `core/types/` |

Rules:

- `src/i18n/` (languages) and `src/theme/` (light/dark mode) are site-wide infrastructure, outside the layers: any layer may import them.
- **Visual design follows [docs/DESIGN.md](docs/DESIGN.md)** (monochrome, calm motion, two-tone headlines, Geist / Geist Mono). Read it before building or restyling any UI; colours from the reserved easter-egg palette never go in the regular UI.
- **Style with the design tokens** in `src/app/globals.css`, through their Tailwind classes: colours (`bg-background`, `text-muted-foreground`...), type scale (`text-display`, `text-headline`, `text-title`, then Tailwind's `text-base`/`text-sm`/`text-xs`), layout spacing (`px-gutter`, `py-section`, `max-w-page`) and corners (`rounded-*`). Never raw values (`#fff`, `text-[42px]`, `p-[13px]`). A new value becomes a token first. The tokens are drawn in Storybook under *Foundations/Design tokens*.
- Light/dark: the `dark` class on `<html>` switches the colours in `globals.css`; style components with Tailwind's `dark:` variant or the theme colours (`bg-background`, `text-muted-foreground`...), never hardcoded colours that only work in one mode.
- **Responsive, mobile-first:** every page and component works and looks right on mobile and desktop. Write the mobile styles first and add larger screens with Tailwind breakpoints (`md:`, `lg:`), never the other way round. Check every story at mobile and desktop widths with the Storybook viewport toolbar.
- **Never create `src/pages/`**: in Next.js that folder turns on the Pages Router and clashes with `app/`. The "Pages" layer is the `page.tsx` (and `layout.tsx`) files inside `src/app/`.
- Never skip layers: a component does not call `core/services/` or `core/api/`; a hook does not call `core/api/`.
- Naming: components `PascalCase.tsx`, hooks `useThing.ts`, APIs `thingApi.ts`, services `thingService.ts`.
- Before writing Next.js code, read the guide in `node_modules/next/dist/docs/` (see AGENTS.md).

## 3. API documentation

- Every exported function in `core/api/` and `core/services/` has **TSDoc**: what it does, its parameters, what it returns and the errors it can throw.
- Every HTTP endpoint in the project (Route Handlers in `app/api/**/route.ts`, exposed Server Actions, and calls to external services such as Supabase or the GitHub API) is documented in `docs/API.md`: method, path, auth, request body, responses and error codes, with an example.
- Changing an endpoint means updating its docs in the same PR.

## 4. Storybook for every component

- **Every component in `components/` has a `.stories.tsx` file next to it**, covering the relevant states (default, loading, empty, error, disabled...).
- **A story is a state**, named after it (`Empty`, `Loading`, `Dark`...), that the user opens and interacts with by hand. Its `play` only **checks** that state; it never clicks or changes it, so the story stays in the state its name says.
- **Never pin the language** (`globals.locale`) in a story: stories follow the toolbar (🌐), so every story can be seen in `en` and `pt`. In `play`, read the expected text from `messages[globals.locale]` (`@/i18n/messages`), never hardcode it. Pin the theme only when the theme *is* the state (e.g. ThemeToggle's `Dark`).
- **Interaction tests** (click, type, then check the result) go in separate stories tagged `tags: ["!dev"]`: hidden from the sidebar, still run by `pnpm test`.
- The toolbar language and theme are kept in sync with the components by `.storybook/preview.tsx` (clicking a language link or a theme button updates the toolbar). That sync only exists in the Storybook UI, not in `pnpm test`, so don't write tests that depend on it.
- Stories run as tests (`@storybook/addon-vitest`) and CI runs `build-storybook`: a broken story blocks the PR.

## 5. Git, CI and the `main` branch

- **`main` is protected: never commit or push directly to `main`.** All work goes through a branch + Pull Request.
- A PR can only be merged with the GitHub Actions checks green (`.github/workflows/`): lint, typecheck, tests, build and Storybook build, CodeQL, and PR title.
- **Squash** merge: the PR title becomes the commit message on `main`, so it follows **Conventional Commits** (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `perf`).
- Before opening a PR, run locally: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm build-storybook`.
