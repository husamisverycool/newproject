# Build rules for every screen (read before touching UI)

The user's instruction, verbatim in spirit: **nothing in the app may come from our own taste.** Every
string, layout, color, font, icon, size and motion must trace to a named source app or to Apple's
platform defaults. When a detail is unknown, fall back to stock iOS (Apple HIG), never to a guess.

## Source precedence
`[I]` > `[V]` > `[V-weak]` > `[B-high]` > `[B-med]` > `[B-low]` > `[HIG]` > `[S]` > no text.

- **[I]** is the user's own INSPO folder:
  - images in `research/inspo/store/*.webp` and `research/inspo/frames/*.jpg`;
  - transcribed in `research/30-inspo-folder.md`;
  - open the images with the Read tool and match them.
- **[V]/[V-weak]/[B-*]** live in `research/01…26-*.md`. Read the dossiers for your surface.
- **[HIG]** is Apple's Human Interface Guidelines. Use stock iOS components and the system colors in
  `apps/web/src/styles/tokens.css`.
- **[S]** is the user's product spec. Use it only for a feature name when no source app has one.

## Copy
- **Never type user-visible text in a .tsx file.** All copy comes from the decks in
  `packages/shared/src/sources/*.ts`, imported from `@app/shared`.
- Each deck entry needs a JSDoc tag. When the entry adapts a source string, the JSDoc quotes the
  original.
- Adapt a source string **only** with the noun-substitution table in
  `packages/shared/src/sources/README.md`.
- Add new entries to the right source's deck: Partiful lines to `partiful.ts`, Apple's to `ios.ts`, etc.
  Keep edits small, because other agents edit the same files. Re-read a file right before you edit it.
- Run `node scripts/check-copy.mjs --list` and keep your files at zero problems.
- The same rule applies to `aria-label`, `placeholder`, `title` and `alt`. Use `alt=""` for decorative
  images.
- Server copy (push titles, system messages, GM lines) also comes from the decks.

## Visuals
- **Tokens:** `apps/web/src/styles/tokens.css`. Add a source token with a tag comment if you need one.
- **Components:** `apps/web/src/components/ios.tsx`:
  - Screen, NavBar, BarButton, GlassCircle, LargeTitle, Section, Row, Switch, Segmented, Button,
    Sheet, Alert, Menu, Avatar, AvatarStack, Spinner;
  - CSS in `styles/hig.css`.
  - Do **not** use `components/ui.tsx`, `components/BottomNav.tsx` or the legacy aliases (`--g1`,
    `--yellow`, `--font-ui`, …). They are being removed.
- **Glyphs:** `apps/web/src/components/Icon.tsx`. These are SF-Symbol-like 24×24 paths. Add new glyphs
  at the top of the `P` map with a JSDoc saying which source shows them.
- **Mascot:** `components/Mascot.tsx`, Duolingo construction:
  `<Mascot species level outfit mood size />`.
- **App tab bar:** `components/AppTabs.tsx` (Yope's floating capsule, [I]). Put `<AppTabs />` on
  top-level screens only, not on sheets or full-screen flows.
- CSS Modules per screen. Put a header comment on the module naming the source of each block.
- The web font is SF via `-apple-system` (`--font-sf`). Use the source's own font token where one
  exists:
  - `--font-duo`, `--font-spotify`, `--font-partiful-display`, `--font-google`, `--font-discord`,
    `--font-card`, `--font-retro`.

## Engineering
- **Stack:**
  - npm workspaces; Vite + React 19 + react-router 7 + TanStack Query in `apps/web`;
  - Hono + node:sqlite in `apps/server`;
  - shared types and decks in `packages/shared`.
- **Dev servers are already running** (web :5173, API :8787, tsx watch). Do not restart them and do
  not reseed the database.
- **Typecheck:**
  - `npx tsc -p apps/web --noEmit` and `npx tsc -p apps/server --noEmit`.
  - Only fix errors in your files. Other agents are mid-edit elsewhere.
- **Screenshots:** `node scripts/shoot.mjs <out.png> <path> --mobile --wait=1500 [--click=selector]`.
  Save them under the scratchpad, not the repo. Compare with the source images and iterate until they
  match.
- **Do not `git commit` or `git push`.** The lead commits.
- Stay inside the files you were assigned, plus small additions to decks, `Icon.tsx` and `tokens.css`.
  If you must change a shared component, say so in your final report instead.
- Your final report lists:
  - the files changed;
  - every source used per surface;
  - anything left UNKNOWN that fell back to HIG.
