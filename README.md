# UBPMadeEasy

A web app that helps businesses in Nairobi work out what they will pay for the **Unified Business Permit (UBP)**
and for **outdoor advertising licences**, based on the Nairobi City County Finance Act.

## Features

- **UBP search** (`/ubp`): pick a business activity to see its industry / category / sub-category / activity
  classification and the Finance Act charges (trade licence, fire clearance, food hygiene, health certificate,
  pest control), filtered by size (outlets, employees, m², …).
- **Advert fees** (`/ubp`, Advert tab): pick an advert type, enter its size and number of sides, and get the renewal
  and new-applicant licence fees.
- **UBP Agent** (`/agent`): ask in plain English, e.g. *"Under canopy 1m by 2m, 2 sides"*, with voice input and read-aloud.
- **Tutorial** (`/tutorial`): step-by-step walkthrough of the NairobiPay application form.
- **PDF export**: branded PDFs with a QR code linking back to the result.
- Light/dark theme, installable as a PWA.

## Tech

React 18, Vite 5, React Router 6, Tailwind CSS + DaisyUI, react-select, jsPDF, Vitest.
Data comes from a separate backend API (`VITE_API_URL`). This repo is frontend only.

## Getting started

```bash
git clone https://github.com/cngetich37/ubpmadeeasy.git
cd ubpmadeeasy
npm install
npm run dev        # http://localhost:5173
```

Configuration lives in `.env` (committed, public defaults). To override a value locally, for example to point at a
local backend, create `.env.local`:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_SITE_URL` | Public URL of this site, used in PDF QR codes |
| `VITE_NAIROBI_PAY_URL` | NairobiPay portal link |
| `VITE_FINANCE_ACT_URL` | Finance Act download link |

These values are compiled into the JavaScript bundle, so never put secrets in them.

## Scripts

```bash
npm run dev       # dev server
npm test          # unit tests (fee calculations, cache)
npm run lint      # ESLint, zero warnings allowed
npm run build     # production build -> dist/
npm run preview   # serve dist/
```

## Deployment

- **Vercel**: builds from the repo (`vercel.json` handles SPA rewrites).
- **Firebase Hosting** (project `ubpmadeeasypremier`):

  ```bash
  npm run build
  npx firebase deploy                                   # production
  npx firebase hosting:channel:deploy ubppreview        # preview channel
  ```

## Contributing

Fork, branch, and open a pull request. Please run `npm test` and `npm run lint` first.
