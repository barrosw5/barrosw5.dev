# Design direction

The visual direction of barrosw5.dev. Every component and page follows it.
Exact values (colours, sizes, spacing) live as tokens in `src/app/globals.css`;
this document says **what** we want and **why**.

## Feel

**Calm, alive, curious.** Calm on the surface, playful underneath: a quiet,
monochrome site that rewards people who explore it.

## Principles

1. **Monochrome base.** The interface is black, white and greys. Colour comes
   from the content (project images), not from the UI.
2. **Projects are the hero.** Shown one at a time, with room to breathe.
3. **Calm, fluid motion.** Things move to explain what changed, never to show
   off.
4. **Personality in the details.** Small touches (local time, status, hidden
   secrets), not a loud theme.

## Colour

| | Light mode | Dark mode |
|---|---|---|
| Background | off-white (not pure white) | charcoal (not pure black), with a very subtle grain |
| Text | near-black | white |
| Secondary text | grey | grey |

- **No brand/accent colour.** The only colours in the UI are small status
  colours: green dot = available, red dot = live (e.g. next to the local time).
- **Reserved for easter eggs only:** a Zelda-like green and an
  Undertale/Deltarune-like red. They never appear in the regular UI.
- Both modes are designed with the same care; the default follows the system.

## Typography

- **Geist** (sans) for everything. Big headlines use **two tones**: part in
  grey, part in full colour (e.g. "Calm on the surface, / **playful underneath.**").
- **Geist Mono** for small "system" details: local time, counters
  (`N°03/12`), statuses, dates.
- Fonts are set once (`--font-sans`, `--font-mono`), so changing them later is
  a one-line change.

## Motion

- Short and soft: quick ease-out transitions, nothing bouncy or slow.
- **Numbers cross-fade** when they change (stats, wishlist prices).
- **Two-state controls are one round button** whose content swaps with a
  short animation: ThemeToggle turns the moon into the sun (rotate + fade),
  LanguageSwitcher slides in the other language's code (EN ↔ PT). Both start
  from the visitor's system: OS light/dark, browser language.
- **Segmented controls have a sliding pill** behind the selected option
  (projects view toggle).
- Images and headlines **reveal on scroll**.
- **`prefers-reduced-motion` is always respected**: with it on, things appear
  without moving.

## Layout

- **Home:** two-tone intro (name + one line), then the **projects one at a
  time** with a counter (`N°03/12`). A toggle switches to a **grid** view.
- **Pages:** Home, Projects, About, Wishlist. Pages not built yet show an
  "under construction" message; unknown addresses show a 404 with the same
  look (mono label, two-tone headline, back home).
- **About:** a **bento** of 4–6 large, airy cards (experience, stack, what I'm
  doing now, contacts, the CV). Never crowded.
- **One screen at a time on desktop:** pages fit the screen and don't scroll
  like a long document. On Home/Projects, scrolling moves from one project to
  the next. On the phone pages do scroll (e.g. the About bento stacks into one
  column), and scrolling also moves between projects.
- **Navigation:** a floating pill, always fixed (it never scrolls away); **⌘K**
  command palette on desktop.
- **Footer:** where I am (Lisbon or the Azores) with its local time and a red
  "live" dot, profile links, copyright. Small Geist Mono text.

## Mobile and desktop

Mobile-first: design the phone version first, then add room on larger screens.

| Desktop | Mobile |
|---|---|
| Bento in several columns | One column; small cards side by side |
| Projects one at a time on scroll | Same, full-width cards with swipe |
| Navigation pill at the top, centred, with page names | Navigation pill at the **bottom**, within thumb reach: page icons, only the current page named |
| Theme and language buttons in the top right corner | Theme and language buttons inside the bottom pill |
| crtl+K command palette | Menu/search button |
| Hover reveals details | Tap reveals details |

## Easter eggs (extra, later)

References to **Zelda** and **Undertale/Deltarune**, found by people who dig
deep. Ideas, none decided yet:

- A small original pixel-art character walking around the site.
- Achievements: "You found 3/7 secrets", saved in the browser.
- 404 page as a "Game Over — Continue?" screen.
- Hidden commands in the crtl+K palette.

**Only references and original work** (our own pixel art, jokes, names):
never sprites, music or fonts taken from the games, which are copyrighted.

## References

| Site | What we take | What we leave |
|---|---|---|
| [zento.framer.website](https://zento.framer.website/) | Bento cards to organise information | The crowding |
| [recent.design 3D bar chart](https://recent.design/i/xftrpxy-3d-bar-chart-component) | Fluid micro-interactions, number cross-fade, sliding pill | — |
| [carterogunsola.com](https://carterogunsola.com/) | Projects one by one with a counter, nav pill, charcoal with grain, mono details | Heavy 3D objects |
| [gabrielbeaugonin.com](https://www.gabrielbeaugonin.com/) | The light mode, name + role in two tones, "about" behind an icon, calm motion | — |
| [ma5a.com](https://ma5a.com/) | Life through small pixel art, projects picked like game ROMs | — |
| [aritro.xyz](https://aritro.xyz/) | Plain, direct intro text | The transition that feels like a different site |
| [coreastudios.com](https://www.coreastudios.com/) | Choosing how to view content (one by one / grid), local time with a live dot | The rotary menu (doesn't work on mobile) |
| [romemichal.pl](https://romemichal.pl/) | Typography as the hero, two-tone headlines, images revealing on scroll | — |
