# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## What this project is

**UBPMadeEasy** is a client-only React SPA that helps businesses in Nairobi work out what they must pay for the
**Unified Business Permit (UBP)** and **outdoor advertising licences**, based on the Nairobi City County Finance Act.
Users look up a business activity (or an advert type with its size and number of sides), see the matching
classification and fees, and download a branded PDF with a QR code that links back to the result.

There is **no backend in this repo**. All data comes from a separate Node API (`UBP_API_URL`, currently on
Render's free tier, so the first request after it has been idle can take ~30-50 s).

## Commands

```bash
npm install          # install deps
npm run dev          # Vite dev server on http://localhost:5173
npm test             # Vitest: unit tests + page render tests (src/**/*.test.{js,jsx})
npm run lint         # ESLint, --max-warnings 0 (any warning fails)
npm run build        # production build -> dist/
npm run preview      # serve the built dist/
npm run generate-pwa-assets   # regenerate PWA icons from public/logo.svg
```

Before finishing a change, run `npm test`, `npm run lint` and `npm run build`. All three pass on `main`, so keep it
that way. `src/lib/*.test.js` cover the pure logic; `src/components/pages.test.jsx` renders the three main pages
in jsdom against a mocked `fetch`. Still check visual changes in `npm run dev`.

Deploying (only when the user asks):
- **Vercel** (`vercel.json`, all paths rewrite to `/`).
- **Firebase Hosting** (`firebase.json`, project `ubpmadeeasypremier`, serves `dist/`):
  `npm run build && npx firebase deploy`, or `npx firebase hosting:channel:deploy ubppreview` for a preview channel.

## Configuration

All environment-specific values come from env vars with the project prefix **`UBP_`** (set via `envPrefix` in
`vite.config.js`, so `VITE_*` vars are *not* exposed), read in **`src/config.js`**. Never hardcode URLs in components.

| Variable | Used for |
|---|---|
| `UBP_API_URL` | Backend base URL (used only by `src/lib/api.js`) |
| `UBP_SITE_URL` | QR codes in generated PDFs (`${SITE_URL}/ubp?ubp=…`). Canonical domain: `https://ubp-easy.vercel.app`. `public/sitemap.xml` and `robots.txt` hardcode the same domain, so update them together. The sitemap lists **public routes only** (`/`, `/terms`); add a route there only if it is outside `ProtectedRoute` |
| `UBP_NAIROBI_PAY_URL` | NairobiPay links, plus the legacy-path redirect in `App.jsx` |
| `UBP_FINANCE_ACT_URL` | Finance Act links, plus the legacy-path redirect in `App.jsx` |

- **No `.env` is committed.** Production values are set in Vercel (Project Settings → Environment Variables) and
  applied at build time. `.env.example` is the template: copy it to `.env` (gitignored) for local dev and for
  Firebase deploys, which build locally.
- Tests don't read `.env`: `test.env` in `vite.config.js` supplies placeholder `*.example.test` URLs.
- `config.js` throws on startup if a variable is missing. When you add one, update `.env.example`,
  `config.js`, `test.env` in `vite.config.js`, the README table **and Vercel** together.
- `UBP_*` values are inlined into the bundle at build time. They are public, so never add secrets, and changing a
  value on the hosting provider takes a rebuild.

## Stack

- React 18 + Vite 5 (`@vitejs/plugin-react-swc`), plain **JavaScript/JSX** (no TypeScript), new JSX runtime
  (don't `import React` just for JSX)
- React Router v6 (`BrowserRouter` in `src/main.jsx`)
- Tailwind CSS 3 + DaisyUI, `darkMode: 'class'`
- `vite-plugin-pwa` (auto-update service worker, image caching via Workbox)
- `react-select` for searchable dropdowns, `framer-motion` for animation
- `jspdf` + `jspdf-autotable` + `qrcode` for PDF export, **dynamically imported** in `src/lib/pdf.js` so they
  stay out of the main bundle. Don't import them statically elsewhere.
- Icons: `react-icons` and `lucide-react`
- `react-helmet` for per-page `<title>`/meta
- Vitest; component tests opt into jsdom with a `// @vitest-environment jsdom` header and use Testing Library

Use plain `fetch` through `src/lib/api.js`. axios was removed. Don't add dependencies for things the current stack already does.

## Layout

```
src/
  main.jsx              Prunes legacy localStorage, then ThemeProvider > BrowserRouter > App
  App.jsx               Route table + Navbar/Footer shell; pages are lazy-loaded (see Bundle below)
  config.js             Env-var config (see above)
  index.css             Tailwind + global table styles + theme CSS variables
  lib/                  Plain JS, no React. Each module has a *.test.js next to it.
    api.js              Backend client: getJson() with timeout + ApiError, and the `api` endpoint map
    activity.js         lookupActivityCodes / loadActivityDetails / loadActivity (codes -> descriptions + fee rows)
    fees.js             Advert fee calculation, matchNumberRange, SIDE_ADVERT_TYPES (single source of truth)
    financeActs.js      Fee-row helpers: filterFinanceRows, rowTotal, unitLabel, FEE_COLUMNS
    agentParser.js      Pure prompt parsing for the agent (numbers, sizes, activity/advert matching, row selection)
    agent.js            answerPrompt (parse + fetch) and composeReply (chat text)
    pdf.js              All PDF exports (business, advert, agent); lazy-loads jsPDF
    format.js           formatKES, humanizeKey
    cache.js            Versioned, expiring localStorage cache + pruneLegacyStorage()
    speech.js           speak() / listenOnce() wrappers for the Web Speech API
    selectStyles.js     react-select styles + selectedOption()
    lazyPage.js         React.lazy wrapper that reloads once if a chunk is gone after a deploy
  hooks/
    useBusinessActivity.js  Activity dropdown + selected activity's codes, descriptions, fee rows
    useAdvertFees.js        Advert dropdown, rates, size, and computed renewal / new-applicant fees
    useApiError.js          Page-level error state for <ErrorBanner>
    useChatSessions.js      Agent chat history persisted to localStorage
  components/
    CombinedSearch.jsx  /ubp page: owns both hooks (state survives tab switches), deep links, PDF download
    UBPAgent.jsx        /agent page: wires chat UI to lib/agent.js, voice in/out
    UBPTutorial.jsx     /tutorial page: step navigation, validation, form state
    search/             BusinessTab, AdvertTab, FinanceActTable, DimensionInput, Field
    agent/              ChatSidebar, ChatMessages, ChatInput, ExamplePrompts
    tutorial/           One component per step + StepCard, FormFieldsStep, tutorialConfig.js (fields, copy, validation)
    common/             ErrorBanner, MessageModal, LoadingIndicator, PageLoader (Suspense fallback)
    pages.test.jsx      Render tests for the three pages
    AdvertFormat.jsx    /advert: gallery of advert types from public/images.json
    Guide.jsx, FAQs.jsx, TermsAndConditions.jsx, UBPHome.jsx, Navbar.jsx, Footer.jsx
    ThemeContext.jsx / ThemeSwitcher.jsx   light/dark handling
    ProtectedRoute.jsx  gate for everything except / and /terms
public/
  images.json + images/ advert-type example photos used by /advert
  sitemap.xml, robots.txt, PWA icons
```

Where things go: page components wire hooks to presentational components. Data fetching lives in `hooks/` (or
`lib/` for one-off calls). Calculations and parsing live in `lib/` with tests. Presentational components get data
and callbacks through props and don't call the API.

## Bundle

The landing page must stay light; most visitors arrive on phones.

- Only `UBPHome`, `Navbar`, `Footer` and `ProtectedRoute` are imported eagerly in `App.jsx`. **Every other page is
  loaded with `lazyPage(() => import(...))`** inside `<Suspense fallback={<PageLoader />}>`. Add new pages the same way.
- `manualChunks` in `vite.config.js` puts React + router (`react`) and framer-motion (`motion`) in their own
  long-cached chunks, so a normal deploy only changes the ~30 kB app chunk.
- jsPDF / autotable / qrcode are dynamically imported in `src/lib/pdf.js`; never import them statically.
- After a build, check the output: the entry `index-*.js` should stay well under 100 kB and Vite should print no
  chunk-size warning.

## Routing and the "auth" gate

- Public routes: `/` (home) and `/terms`.
- Protected routes (`ProtectedRoute`): `/ubp`, `/advert`, `/guide`, `/faqs`, `/agent`, `/tutorial`.
- This is **not real authentication**. Accepting the terms writes a random `authToken` with a 2-hour expiry to
  `localStorage`. Without a valid token, the app redirects you to `/`.
- Unknown paths go to `RedirectHandler` → `/terms`, unless the path matches the path of `FINANCE_ACT_URL` /
  `NAIROBI_PAY_URL`, in which case the browser is sent there. Links whose path is just `/` are ignored on purpose.
- The SPA rewrites in `vercel.json` and `firebase.json` are needed for deep links. Keep them if you add routes.
- To test a protected page in dev, accept the terms first.

Deep links: `/ubp?ubp=<business activity>` and `/ubp?advert=<advert type>` pre-fill the search. The PDF QR codes rely
on these, so don't change the parameter names.

## Backend API

Every call goes through `api` in `src/lib/api.js`. It encodes path segments, throws `ApiError` on non-2xx or timeout
(60 s, to allow for cold starts), and exports `API_ERROR_MESSAGE` for user-facing errors.

| `api.` method | Endpoint | Returns |
|---|---|---|
| `ubpDictionary()` | `GET /api/naics/ubpdictionary` | `[{ commonBusinessActivity }]` for the dropdown |
| `lookupActivity(name)` | `GET /api/naics/{name}` | `{ industry, businessCategory, businessSubCategory, businessActivity }` codes |
| `industry(code)` / `businessCategory(code)` / `businessSubCategory(code)` | `GET /api/naics/industry/{code}` etc. | `{ industry }` / `{ businessCategory }` / … descriptions |
| `businessActivity(code)` | `GET /api/naics/businessactivities/{code}` | `{ businessActivity, financeActs: [...] }` fee rows |
| `allActivities()` | `GET /api/naics/` | full dataset (agent free-text matching) |
| `adverts()` | `GET /api/advert` | `[{ advertType }]` |
| `advert(type)` | `GET /api/advert/{type}` | numeric rates: `applicationFee`, `firstSquareMetres`, `firstThreeMetres`, `firstTenSquareMetres`, `extraSquareMetres`, `perEachperYear`, plus `advertisementCategory` |

Hooks follow the same pattern for effects that fetch: debounce with `setTimeout` plus a `cancelled` flag in the
cleanup, so stale responses are dropped. Hooks take `{ onError, onSuccess }` callbacks; pages get them from
`useApiError()` and render `<ErrorBanner>`. Don't swallow errors silently.

## Fee calculation (most sensitive logic)

All fee rules live in **`src/lib/fees.js`** and are tested in `fees.test.js`. UI code reaches them through
`useAdvertFees()` (or `lib/agent.js`) and must never re-implement them. When a Finance Act rate or rule changes, update `fees.js` **and** its tests together.

**Business permit:** `matchNumberRange(description, n)` decides whether a Finance Act row's free-text
`businessDescription` ("1-5 outlets", "up to 50 sq.m", "above 100", "less than 10", "over N", "with N vehicles")
covers the user's number.

**Adverts:** `calculateAdvertFees(type, rates, { length, width, numberOfSides })` → `{ renewalFee, newApplicantFee }`.
With `area = length × width`:
- Directional Signs: flat 10,500; Call In Adverts: flat 18,200 (`FLAT_RENEWAL_FEES`, not from the API)
- Billboard: < 3 m² → 0; = 3 → `firstThreeMetres`; > 3 → `firstThreeMetres + (area−3)·extraSquareMetres`
- Wallpainting / Window Branding / Wall Branding: same pattern with a 10 m² threshold and `firstTenSquareMetres`
- Corporate Flags → `perEachperYear`; Canvas → `firstSquareMetres`; Business Encroachment → `area · firstSquareMetres`
- Anything else → `firstSquareMetres + (area−1)·extraSquareMetres` (0 if area < 1)
- `SIDE_ADVERT_TYPES` (Above Canopy, Under Canopy, Directional Signs, Billboard, Call In Adverts): renewal × sides
- **New applicant fee = renewal fee + `applicationFee`**, even when the renewal fee is 0

Rates can be numbers, numeric strings or `""`. `fees.js` coerces them, so pass the raw API object or state values.
Currency is KES. Format with `formatKES()` from `src/lib/format.js` (output looks like `Ksh 1,500.00`).

## Client-side state and caching

Use `readCache(key, maxAgeMs?)` / `writeCache(key, data)` from `src/lib/cache.js` for API data (default TTL: 1 day).
Keys are stored as `ubp:v<CACHE_VERSION>:<key>`. **Bump `CACHE_VERSION`** whenever the shape of cached data changes.

On every load, `pruneLegacyStorage()` deletes every localStorage key that is not a current cache entry and not in its
`KEEP_KEYS` allowlist. **If you add a new non-cache localStorage key, add it to `KEEP_KEYS`, or it will be wiped.**

Current keys:
- `authToken`: terms-acceptance gate
- `theme`: `"light"` / `"dark"`, set only when the user overrides the system theme
- `ubpai_sessions`, `ubpai_currentSession`: agent chat history
- `ubp:v1:businessOptions`, `ubp:v1:lookup:<activity name>`, `ubp:v1:naics:all`: cached API data

## Styling conventions

- Brand colours: dark green `#064E3B` / `#065A38`, gold `#FFD700` / `#EAB308` / `#FBCC1A`. Many are hard-coded
  in className strings (`bg-[#065A38]`), in `react-select` style objects, and in jsPDF calls.
- Dark mode: `ThemeContext` toggles the `dark` class on `<html>`. Theme-aware colours use CSS variables defined in
  `index.css` (`--color-bg`, `--color-surface`, `--color-primary`, `--color-secondary`, `--color-text`, `--color-muted`),
  usually as `dark:bg-[var(--color-surface)]`. New UI should support both themes in the same way.
- Mobile-first responsive Tailwind (`md:`/`lg:`). Most users are on phones.

## Code conventions

- Function components with hooks. Pure logic (calculations, parsing, storage) goes in `src/lib/` with a test.
- ESLint (`.eslintrc.cjs`): `eslint:recommended`, `react`, `react-hooks`, `react-refresh`. `react/prop-types` is off.
  If you add an `eslint-disable`, give a reason after `--`.
- Commit messages are short and lowercase ("updated the ubp agent"). Work happens directly on `main`.

## Known issues / improvement backlog

Discuss these with the user before starting:

1. **The "auth" gate is client-side only.** It's fine for a terms-acceptance check, but it is not access control.
2. **Agent PDF blob URLs don't survive a reload.** Chat history is persisted, but the `blob:` links in old
   messages stop working after a refresh.
