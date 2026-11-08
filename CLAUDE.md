# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## What this project is

**UBPMadeEasy** is a client-only React SPA that helps businesses in Nairobi work out what they must pay for the
**Unified Business Permit (UBP)** and **outdoor advertising licences**, based on the Nairobi City County Finance Act.
Users look up a business activity (or an advert type with its size and number of sides), see the matching
classification and fees, and download a branded PDF with a QR code that links back to the result.

There is **no backend in this repo**. All data comes from a separate Node API
(`https://effortlessubp-backend.onrender.com`, hosted on Render's free tier, so the first request after a while can be slow).

## Commands

```bash
npm install          # install deps (node_modules is not committed)
npm run dev          # Vite dev server on http://localhost:5173
npm run build        # production build -> dist/
npm run preview      # serve the built dist/
npm run lint         # ESLint, --max-warnings 0 (any warning fails)
npm run generate-pwa-assets   # regenerate PWA icons from public/logo.svg
```

There is **no test suite**. Check changes by running `npm run lint` and `npm run build`, then click through the
affected route in `npm run dev`. For fee logic, work out a few cases by hand (see "Fee calculation" below).

Deploying:
- **Vercel** (`vercel.json`, all paths rewrite to `/`). The QR codes in generated PDFs point at `https://ubpeasy.vercel.app`.
- **Firebase Hosting** (`firebase.json`, project `ubpmadeeasypremier`, serves `dist/`):
  `npm run build && firebase deploy`, or `firebase hosting:channel:deploy ubppreview` for a preview channel.
- `public/sitemap.xml` and `robots.txt` use a third domain, `ubpeasy.cnetechafrica.org`.

Do not deploy unless the user asks.

## Stack

- React 18 + Vite 5 (`@vitejs/plugin-react-swc`), plain **JavaScript/JSX** (no TypeScript)
- React Router v6 (`BrowserRouter` in `src/main.jsx`)
- Tailwind CSS 3 + DaisyUI, `darkMode: 'class'`
- `vite-plugin-pwa` (auto-update service worker, image caching via Workbox)
- `react-select` for searchable dropdowns, `framer-motion` for animation
- `jspdf` + `jspdf-autotable` + `qrcode` for PDF export
- Icons come from `react-icons` **and** `lucide-react` (both are in use)
- `react-helmet` for per-page `<title>`/meta

Many dependencies in `package.json` are installed but unused (`firebase`, `googleapis`, `formik`, `yup`, `xlsx`,
`papaparse`, `file-saver`, `html2canvas`, `react-autosuggest`, `react-ga`, `react-helmet-async`, `@mui/*`, `mui`,
`lodash` (only used by the unrouted `FinanceAct`), `workbox-webpack-plugin`, `sql-formatter`). Don't add new
dependencies for something an existing one already does.

## Layout

```
src/
  main.jsx              ThemeProvider > BrowserRouter > App
  App.jsx               Route table + Navbar/Footer shell
  index.css             Tailwind + global table styles + theme CSS variables
  components/
    CombinedSearch.jsx  (~1800 lines) /ubp — business + advert search tabs, fee calc, PDF export
    UBPAgent.jsx        (~1270 lines) /agent — rule-based chat that parses free text, voice in/out, PDF export
    UBPTutorial.jsx     (~1420 lines) /tutorial — step-by-step wizard covering the same calculations
    AdvertFormat.jsx    /advert — gallery of advert types from public/images.json
    Guide.jsx, FAQs.jsx, TermsAndConditions.jsx, UBPHome.jsx, Navbar.jsx, Footer.jsx
    ThemeContext.jsx / ThemeSwitcher.jsx   light/dark handling
    ProtectedRoute.jsx  gate for everything except / and /terms
public/
  images.json + images/ advert-type example photos used by /advert
```

Unused or dead components (not routed or imported anywhere): `Contact`, `NaicsCode` (calls a different, older API
host), `Template`, `Sidebar` (used only by `Template`), `UBP`, `ImagePreloader`, `MissingPage`,
`ValentinesAnimation`, and `FinanceAct` (its route is commented out in `App.jsx`). Check with the user before you
delete or revive them.

`firebase.js` at the repo root is not imported by the app.

## Routing and the "auth" gate

- Public routes: `/` (home) and `/terms`.
- Protected routes (`ProtectedRoute`): `/ubp`, `/advert`, `/guide`, `/faqs`, `/agent`, `/tutorial`.
- This is **not real authentication**. Accepting the terms writes a random `authToken` with a 2-hour expiry to
  `localStorage`. Without a valid token, the app redirects you to `/`.
- Unknown paths go to `RedirectHandler`, which sends you to `/terms` (except for two hard-coded external links).
- The SPA rewrites in `vercel.json` and `firebase.json` are needed for deep links. Keep them if you add routes.
- To test a protected page in dev, accept the terms first, or set `authToken` in DevTools.

Deep links: `/ubp?ubp=<business activity>` and `/ubp?advert=<advert type>` pre-fill the search. The PDF QR codes rely
on these, so don't change the parameter names.

## Backend API (external)

Base URL: `https://effortlessubp-backend.onrender.com`. It is currently **hard-coded in many places**
(`grep -rn effortlessubp src`), with no env var or shared client.

| Endpoint | Used for |
|---|---|
| `GET /api/naics/ubpdictionary` | List of common business activities (dropdown options) |
| `GET /api/naics/{query}` | Look up an activity → `{industry, businessCategory, businessSubCategory, businessActivity}` codes |
| `GET /api/naics/industry/{code}` etc. (`businesscategories`, `businesssubcategories`, `businessactivities`) | Human-readable names; `businessactivities/{code}` also returns `financeActs[]` fee rows |
| `GET /api/naics/` | Full dataset (the agent caches all of it) |
| `GET /api/advert` | List of advert types (`advertType`) |
| `GET /api/advert/{type}` | Advert rates: `applicationFee`, `firstSquareMetres`, `firstThreeMetres`, `firstTenSquareMetres`, `extraSquareMetres`, `perEachperYear`, `advertisementCategory` |
| `POST /api/users/send-email` | Contact form (unused component) |

The response shapes are not documented in this repo. Use the fields the existing code reads.

## Fee calculation (most sensitive logic)

**Business permit:** the matching `financeActs` row is chosen by parsing its free-text `businessDescription`
against the number the user enters (outlets, employees, sq. m, vehicles, …). See `matchNumberRange` and `extractLabel`
in `CombinedSearch.jsx`. The regexes handle "1–5", "up to N", "above N", "less than N", "over N", "with/without N vehicle".

**Adverts:** `area = length × width`, then by type:
- Directional Signs: flat 10,500; Call In Adverts: flat 18,200 (hard-coded, not from the API)
- Billboard: < 3 m² → 0; = 3 → `firstThreeMetres`; > 3 → `firstThreeMetres + (area−3)·extraSquareMetres`
- Wallpainting / Window Branding / Wall Branding: same pattern with a 10 m² threshold and `firstTenSquareMetres`
- Corporate Flags → `perEachperYear`; Canvas → `firstSquareMetres`
- Business Encroachment → `area · firstSquareMetres`
- Default → `firstSquareMetres + (area−1)·extraSquareMetres`
- "Side" types (Above Canopy, Under Canopy, Directional Signs, Billboard, Call In Adverts) multiply the renewal fee by the number of sides
- **Renewal fee** = the result above; **new applicant fee** = renewal fee + `applicationFee`

⚠️ **This logic is duplicated in three places** that must stay in sync:
`CombinedSearch.jsx` (~line 562), `UBPAgent.jsx` (~line 420), and `UBPTutorial.jsx` (~line 360). `matchNumberRange`
and the `sideAdvertTypes` list are duplicated too. They have already drifted. For example, for a below-threshold
Billboard/Wallpainting, the agent shows a new-applicant fee of 0, while the other two show the application fee alone.
When you change any fee rule, update all three copies (or better, pull them into a shared module first) and
confirm they agree on the same inputs.

Currency is KES, formatted with `toLocaleString("en-KE", { style: "currency", currency: "KES" })`.

## Client-side state and caching

`localStorage` keys in use:
- `authToken`: the terms-acceptance gate
- `theme`: `"light"` / `"dark"`, set only when the user overrides the system theme
- `businessOptions`: cached activity dropdown (**never expires**, so new backend activities won't show for returning users)
- `ubpai_sessions`, `ubpai_currentSession`, `ubpai_businessData`: agent chat history and full dataset cache
- The raw search query string itself is used as a key to cache lookup results (in `CombinedSearch` and `UBPTutorial`)

If you change the shape of cached data, handle stale entries (or bump the key name), or returning users will crash.

## Styling conventions

- Brand colours: dark green `#064E3B` / `#065A38`, gold `#FFD700` / `#EAB308` / `#FBCC1A`. Many are hard-coded
  in className strings (`bg-[#065A38]`), in `react-select` style objects, and in jsPDF calls.
- Dark mode: `ThemeContext` toggles the `dark` class on `<html>`. Theme-aware colours use CSS variables defined in
  `index.css` (`--color-bg`, `--color-surface`, `--color-primary`, `--color-secondary`, `--color-text`, `--color-muted`),
  usually as `dark:bg-[var(--color-surface)]`. New UI should support both themes in the same way.
- Mobile-first responsive Tailwind (`md:`/`lg:`). Most users are on phones.

## Code conventions observed

- Function components with hooks. One large component per page. Fetch with `fetch` inside `useEffect`
  (axios appears only in a few places). Debouncing is hand-written per component.
- ESLint (`.eslintrc.cjs`): `eslint:recommended`, `react`, `react-hooks`, `react-refresh`. Lint fails on any warning.
  Existing code may not currently pass lint; don't "fix" unrelated files in a feature change.
- Commit messages are short and lowercase ("updated the ubp agent"). Work happens directly on `main`.

## Known issues / improvement backlog

These are candidates to discuss with the user, not things to change unprompted:

1. Pull the fee logic, `matchNumberRange`, `sideAdvertTypes`, and the PDF builders into `src/lib/` and add unit tests
   (e.g. Vitest) for the fee tables.
2. Move the API base URL to `import.meta.env.VITE_API_URL` and use one small fetch helper.
3. Split the 1,300–1,800 line components (`CombinedSearch`, `UBPAgent`, `UBPTutorial`) into smaller pieces.
4. Remove unused dependencies and dead components, and drop the large commented-out blocks.
5. `index.html` preloads and links `/styles.css`, which doesn't exist.
6. `refreshData` calls the API root three times in a row to wake the Render instance. Consider a proper warm-up/loading state.
7. Errors are mostly `console.log("Something went wrong!")`. Users get no feedback when the API is down.
8. Add an expiry or version to the `businessOptions` cache.
9. Pick one canonical domain (vercel.app vs cnetechafrica.org) for QR codes and the sitemap. The sitemap also lists `/contact` and `/financeact`, which aren't routed.
10. Update the README: it describes a `SearchAdvert` component that no longer exists (it's now part of `CombinedSearch`).
