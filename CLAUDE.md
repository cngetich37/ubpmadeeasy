# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## What this project is

**UBPMadeEasy** is a client-only React SPA that helps businesses in Nairobi work out what they must pay for the
**Unified Business Permit (UBP)** and **outdoor advertising licences**, based on the Nairobi City County Finance Act.
Users look up a business activity (or an advert type with its size and number of sides), see the matching
classification and fees, and download a branded PDF with a QR code that links back to the result.

There is **no backend in this repo**. All data comes from a separate Node API (`VITE_API_URL`, currently on
Render's free tier, so the first request after it has been idle can take ~30-50 s).

## Commands

```bash
npm install          # install deps
npm run dev          # Vite dev server on http://localhost:5173
npm test             # Vitest unit tests (src/**/*.test.js)
npm run lint         # ESLint, --max-warnings 0 (any warning fails)
npm run build        # production build -> dist/
npm run preview      # serve the built dist/
npm run generate-pwa-assets   # regenerate PWA icons from public/logo.svg
```

Before finishing a change, run `npm test`, `npm run lint` and `npm run build`. All three pass on `main`, so keep it
that way. Tests cover the pure logic in `src/lib/` only; check UI changes in `npm run dev`.

Deploying (only when the user asks):
- **Vercel** (`vercel.json`, all paths rewrite to `/`).
- **Firebase Hosting** (`firebase.json`, project `ubpmadeeasypremier`, serves `dist/`):
  `npm run build && npx firebase deploy`, or `npx firebase hosting:channel:deploy ubppreview` for a preview channel.

## Configuration

All environment-specific values come from Vite env vars, read in **`src/config.js`**. Never hardcode URLs in components.

| Variable | Used for |
|---|---|
| `VITE_API_URL` | Backend base URL (used only by `src/lib/api.js`) |
| `VITE_SITE_URL` | QR codes in generated PDFs (`${SITE_URL}/ubp?ubp=…`) |
| `VITE_NAIROBI_PAY_URL` | NairobiPay links, plus the legacy-path redirect in `App.jsx` |
| `VITE_FINANCE_ACT_URL` | Finance Act links, plus the legacy-path redirect in `App.jsx` |

- `.env` is **committed** and holds the production defaults (all public). `.env.example` documents the same keys.
  Use `.env.local` (gitignored) for local overrides.
- `config.js` throws on startup if a variable is missing. When you add one, update `.env`, `.env.example`,
  `config.js` and the README table together.
- `VITE_*` values are inlined into the bundle at build time. They are public, so never add secrets, and changing a
  value on the hosting provider takes a rebuild.

## Stack

- React 18 + Vite 5 (`@vitejs/plugin-react-swc`), plain **JavaScript/JSX** (no TypeScript), new JSX runtime
  (don't `import React` just for JSX)
- React Router v6 (`BrowserRouter` in `src/main.jsx`)
- Tailwind CSS 3 + DaisyUI, `darkMode: 'class'`
- `vite-plugin-pwa` (auto-update service worker, image caching via Workbox)
- `react-select` for searchable dropdowns, `framer-motion` for animation
- `jspdf` + `jspdf-autotable` + `qrcode` for PDF export
- Icons: `react-icons` and `lucide-react`
- `react-helmet` for per-page `<title>`/meta
- Vitest for unit tests (node environment, no DOM)

Use plain `fetch` through `src/lib/api.js`. axios was removed. Don't add dependencies for things the current stack already does.

## Layout

```
src/
  main.jsx              Prunes legacy localStorage, then ThemeProvider > BrowserRouter > App
  App.jsx               Route table + Navbar/Footer shell
  config.js             Env-var config (see above)
  index.css             Tailwind + global table styles + theme CSS variables
  lib/
    api.js              Backend client: getJson() with timeout + ApiError, and the `api` endpoint map
    fees.js             Advert fee calculation, matchNumberRange, SIDE_ADVERT_TYPES (single source of truth)
    cache.js            Versioned, expiring localStorage cache + pruneLegacyStorage()
    *.test.js           Vitest tests
  components/
    CombinedSearch.jsx  (~1500 lines) /ubp: business + advert search tabs, PDF export
    UBPAgent.jsx        (~1100 lines) /agent: rule-based chat that parses free text, voice in/out, PDF export
    UBPTutorial.jsx     (~1300 lines) /tutorial: step-by-step NairobiPay form walkthrough
    ErrorBanner.jsx     Dismissible inline API-error message
    AdvertFormat.jsx    /advert: gallery of advert types from public/images.json
    Guide.jsx, FAQs.jsx, TermsAndConditions.jsx, UBPHome.jsx, Navbar.jsx, Footer.jsx
    ThemeContext.jsx / ThemeSwitcher.jsx   light/dark handling
    ProtectedRoute.jsx  gate for everything except / and /terms
public/
  images.json + images/ advert-type example photos used by /advert
  sitemap.xml, robots.txt, PWA icons
```

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

Components follow the same pattern for effects that fetch: debounce with `setTimeout` plus a `cancelled` flag in the
cleanup, so stale responses are dropped. On failure, `console.error` the error and show `API_ERROR_MESSAGE`
in an `<ErrorBanner>`. Don't swallow errors silently.

## Fee calculation (most sensitive logic)

All fee rules live in **`src/lib/fees.js`** and are tested in `fees.test.js`. Components must call it and never
re-implement it. When a Finance Act rate or rule changes, update `fees.js` **and** its tests together.

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
Currency is KES, formatted with `toLocaleString("en-KE", { style: "currency", currency: "KES" })`.

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

1. **Split the large components.** `CombinedSearch`, `UBPAgent` and `UBPTutorial` are each 1,100-1,500 lines.
   Good first cuts: the business-search and advert-search tabs, and the PDF builders, which are near-duplicates
   between `CombinedSearch` and `UBPAgent` and could move to `src/lib/pdf.js`.
2. **Agent prompt parsing has no tests.** Activity matching, `extractNumbers`, and the dimension/sides regexes in
   `UBPAgent.jsx` could move to `src/lib/` with tests.
3. **Pick one canonical domain.** QR codes use `VITE_SITE_URL` (`ubpeasy.vercel.app`), while `public/sitemap.xml`
   and `robots.txt` hardcode `ubpeasy.cnetechafrica.org`. The sitemap also lists `/advert` and `/faqs`, which are
   behind the terms gate, so crawlers get redirected.
4. **Bundle size.** The main chunk is over 500 kB (Vite warns). Lazy-load routes with `React.lazy`, and especially
   jsPDF, which is only needed when exporting.
5. **The "auth" gate is client-side only.** It's fine for a terms-acceptance check, but it is not access control.
