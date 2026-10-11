<div align="center">

# CareerPulse

**Research-based career roadmaps for 20 trending tech fields, with a focus on Bangladesh, remote work and global markets.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Tested with Vitest](https://img.shields.io/badge/tested_with-Vitest-6e9f18?logo=vitest&logoColor=white)](https://vitest.dev)

**[Live demo](https://careerpulse-beta.vercel.app)** · [Features](#features) · [Tech stack](#tech-stack) · [Getting started](#getting-started)

</div>

CareerPulse helps students and career-switchers pick a tech career and start learning the same day. Each of the
20 fields comes with a plain-English explanation, job roles, a beginner → advanced skill list, the languages and tools
employers ask for, a 30/60/90-day roadmap, free resources, portfolio projects, interview questions, resume bullets,
and salary and demand data for **Bangladesh**, **remote work** and **global** markets. Every salary figure links to
its source.

## Screenshots

| Home (light)                                                      | Home (dark)                                                                             |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| ![Home page with hero and stats](docs/screenshots/home-light.png) | ![Career explorer with search and filters in dark mode](docs/screenshots/home-dark.png) |

| Field detail: 30/60/90 roadmap                                                     | Field detail: salary & demand (dark)                                           |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| ![AI Agent Engineering roadmap with checklist](docs/screenshots/field-roadmap.png) | ![Cybersecurity salary and demand tab](docs/screenshots/field-salary-dark.png) |

| Compare 3 fields                                               | Mobile                                                                                                                                                            |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Side-by-side comparison table](docs/screenshots/compare.png) | <img src="docs/screenshots/mobile-home.png" alt="Mobile home page" width="240"> <img src="docs/screenshots/mobile-field.png" alt="Mobile field page" width="240"> |

## Features

- **20 researched career fields.** AI agents, ML, data science, data engineering, cybersecurity, cloud, DevOps/SRE,
  full-stack web, mobile, UI/UX, product management, prompt/context engineering, AI governance, fintech,
  embedded/IoT, green tech, robotics, AR/VR, blockchain and quantum computing.
- **12 tabs per field.** Overview & trends · Job roles · Skills · Languages & tools · 30/60/90 roadmap · Free resources ·
  Projects · Interview Q&A · Resume bullets · Salary & demand · Live jobs · Start today.
- **Live jobs.** Real openings for each field, refreshed once a day by a Vercel Cron job: remote jobs from
  [Remotive](https://remotive.com) and global jobs from [Adzuna](https://www.adzuna.com), plus a "Search on Bdjobs"
  link for Bangladesh. Visitors read a cached snapshot, so they never wait on the job APIs, and a failed refresh keeps
  the last good results on screen. See [Live jobs](#live-jobs).
- **Search and filters.** Instant search across names, roles, skills and tools (e.g. "Kubernetes" or "Figma"), with
  filters for difficulty, demand, salary and category, plus five sort orders.
- **Progress tracking.** Tick skills, roadmap goals and "start today" tasks. Progress is saved in `localStorage`,
  stays in sync across tabs, and is summarised on the home cards and on a **My progress** dashboard.
- **Compare page.** Put 2–3 fields side by side. The best value in each row is highlighted. Selections live in the URL
  (`/compare?fields=a,b,c`), so you can share a comparison as a link.
- **Dark mode** with light / dark / system modes and no flash on load (an inline script runs before first paint).
- **Accessible and mobile-first.** Keyboard tab navigation (arrow keys, Home and End), a skip link, ARIA progress bars,
  visible focus rings, reduced-motion support and print styles.
- **Cited sources.** BLS Occupational Outlook (2025 data), Paylab Bangladesh, Arc.dev, WEF Future of Jobs 2025, ISC2,
  LinkedIn, IAPP and others. A link-checker script verifies all 250+ URLs.

## Tech stack

| Area      | Choice                                                            |
| --------- | ----------------------------------------------------------------- |
| Framework | **Next.js 16** (App Router, Cache Components, static generation)  |
| UI        | **React 19**, **TypeScript 5** (strict)                           |
| Styling   | **Tailwind CSS 4** with CSS-variable design tokens                |
| Icons     | lucide-react                                                      |
| Content   | Typed JSON files (`src/data/fields/*.json`) validated by tests    |
| State     | `useSyncExternalStore` + `localStorage` (no state library needed) |
| Testing   | **Vitest** + React Testing Library + jsdom (~300 tests)           |
| Quality   | ESLint (next/core-web-vitals + TypeScript), link checker          |
| Jobs data | Remotive + Adzuna APIs, Vercel Cron, Upstash Redis snapshot       |

## Getting started

Requirements: **Node.js 20.9+** (developed on Node 24) and npm.

```bash
git clone https://github.com/redoanulrusho/careerpulse.git
cd careerpulse
npm install
npm run dev          # http://localhost:3000
```

### Scripts

| Command               | What it does                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev`         | Start the dev server                                                                       |
| `npm run build`       | Production build (prerenders all 20 field pages)                                           |
| `npm start`           | Serve the production build                                                                 |
| `npm test`            | Run the Vitest suite once                                                                  |
| `npm run test:watch`  | Run tests in watch mode                                                                    |
| `npm run lint`        | ESLint                                                                                     |
| `npm run typecheck`   | Generate route types and run `tsc --noEmit`                                                |
| `npm run check-links` | Check every URL cited in the content                                                       |
| `npm run build:demo`  | Build the single-file demo (`demo/dist/`) from the same JSON content                       |
| `npm run format`      | Format with Prettier (+ Tailwind class sorting)                                            |
| `npm run screenshots` | Capture README screenshots from a running server (needs `npx playwright install chromium`) |

## Project structure

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Home: hero + explorer (search/filter/sort)
│   ├── fields/[slug]/page.tsx# Field detail with 12 tabs (statically generated)
│   ├── api/cron/refresh-jobs/# Daily Vercel Cron route that refreshes live jobs
│   ├── compare/page.tsx      # Side-by-side comparison (URL-driven)
│   ├── progress/page.tsx     # Progress dashboard
│   ├── layout.tsx            # Header, footer, theme bootstrap
│   └── globals.css           # Tailwind v4 + design tokens (light/dark)
├── components/               # UI components (cards, explorer, tabs, sections…)
│   └── field/                # Detail-page sections, tabs, checklist items
├── data/fields/              # 20 career fields as JSON + typed index
├── data/job-keywords.ts      # Per-field job search keywords (Remotive, Adzuna, Bdjobs)
├── hooks/                    # localStorage-backed stores (progress, compare tray)
└── lib/                      # Pure, tested logic: filter, format, progress, compare, theme
    └── jobs/                 # Job fetchers, refresh, snapshot store, cron auth
tests/                        # Vitest: data integrity, filters, lib, components, live jobs, cron route
scripts/                      # check-links, screenshots, build-demo
demo/                         # Single-file demo template + built output (demo/dist)
docs/screenshots/             # README images
```

### Design decisions

- **Content as data.** Each field is one JSON file that follows the `Field` type in `src/lib/types.ts`.
  `tests/data.test.ts` enforces the content contract (4–6 roles, 8–10 resources, five projects ordered easy → hard,
  10 interview questions, sourced salary data and so on), so a bad edit fails CI.
- **Small client bundles.** Client components never import the full data set. The server passes only what they need,
  such as card summaries, checklist IDs and compare rows.
- **Stable progress IDs.** Checklist IDs are built from the item text (`slug:section:slugified-text`), so reordering
  content keeps a user's progress.

- **Real 404s.** Field pages stream, so `src/proxy.ts` rejects unknown slugs before rendering and returns a
  proper 404 status.

## Live jobs

The **Live jobs** tab on every field page lists recent openings from two sources, plus a link for Bangladesh:

| Source                                             | What it adds                   | Key needed | Terms we follow                                                                                                                                                                |
| -------------------------------------------------- | ------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Remotive](https://remotive.com/api-documentation) | Remote jobs                    | No         | Link to the original Remotive posting and credit Remotive as the source; at most a few requests a day (we make **one**); no sign-up walls. Jobs appear 24 hours after posting. |
| [Adzuna](https://developer.adzuna.com/)            | Global jobs (default: UK + US) | Yes        | Every job shows a linked "Jobs by Adzuna" label (min. 116×23 px) and links to Adzuna's `redirect_url`; stays inside the free limits (25/min, 250/day).                         |
| [Bdjobs](https://bdjobs.com)                       | Bangladesh                     | No         | A "Search on Bdjobs" link opens Bdjobs' own search pre-filled with the field's keywords. **Nothing is scraped.**                                                               |

### How it works

```
Vercel Cron (06:00 UTC daily)
  └─▶ GET /api/cron/refresh-jobs        (checks Authorization: Bearer $CRON_SECRET)
        ├─ Remotive: 1 request for the whole feed, filtered locally by each field's title keywords
        ├─ Adzuna:   1 title search per field per country (2.6 s apart, under 25 requests/min)
        ├─ merge with the previous snapshot: failed sources keep their last good jobs ("stale")
        ├─ save snapshot to Upstash Redis (or .data/live-jobs.json locally)
        └─ revalidateTag("live-jobs")
Field page ─▶ reads the cached snapshot ("use cache", tagged) ─▶ never calls the job APIs
```

- **Keywords** live in [`src/data/job-keywords.ts`](src/data/job-keywords.ts): title phrases for Remotive matching,
  one Adzuna title query, and one Bdjobs search phrase per field.
- **Error handling:** every network, HTTP, timeout and bad-JSON failure becomes a short error without secrets. If a
  source fails, its previous jobs stay visible with a "last good results from …" note. An empty Remotive response
  counts as a failure. If saving the snapshot fails, the old snapshot is untouched. The tab always shows
  "Last updated", plus a friendly message when a field has no matches.
- **Budget:** with the default `ADZUNA_COUNTRIES=gb,us`, a refresh makes 1 Remotive request and 40 Adzuna requests.
- **Limits:** Remotive's free public feed currently returns only its ~20 most recent jobs (search parameters are
  ignored), so many fields show "no matching remote jobs" on a given day. Adzuna's free key is meant for personal and
  evaluation use: commercial use beyond a 14-day trial needs a licence from Adzuna.

### Setup

1. **Get keys** (see the table below) and copy the env template:

   ```bash
   cp .env.example .env.local
   ```

   | Variable                               | Required             | Where to get it                                                                                                                                                                                                                          |
   | -------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`      | For global jobs      | Free account at [developer.adzuna.com/signup](https://developer.adzuna.com/signup), then the dashboard's API access details                                                                                                              |
   | `ADZUNA_COUNTRIES`                     | No (default `gb,us`) | Any of `at au be br ca ch de es fr gb in it mx nl nz pl sg us za`                                                                                                                                                                        |
   | `CRON_SECRET`                          | In production        | Any random string of 16+ characters (see `.env.example` for a one-line generator)                                                                                                                                                        |
   | `KV_REST_API_URL`, `KV_REST_API_TOKEN` | In production        | Vercel dashboard → Storage / Marketplace → **Upstash Redis** → connect to the project (injected automatically). `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` from [console.upstash.com](https://console.upstash.com) also work. |

   Without Adzuna keys the app still works: remote jobs and the Bdjobs link show, and global jobs show a
   "switched off" note. `.env.local` is gitignored; never commit real keys.

2. **Run a refresh locally.** In development the cron route doesn't need the secret, and the snapshot is saved to
   `.data/live-jobs.json` (gitignored):

   ```bash
   npm run dev
   curl http://localhost:3000/api/cron/refresh-jobs      # returns a JSON summary
   ```

   Please don't run it more than a few times a day; Remotive asks for at most about 4 requests per day.

3. **Deploy on Vercel.** Add the variables above in _Project → Settings → Environment Variables_, connect Upstash
   Redis, and deploy. `vercel.json` registers the daily cron (Hobby plans allow once a day, and Vercel may run it any
   time within the scheduled hour). Trigger the first refresh from _Settings → Cron Jobs → Run_, or with
   `curl -H "Authorization: Bearer $CRON_SECRET" https://<your-domain>/api/cron/refresh-jobs`.

## Single-file demo

`npm run build:demo` renders the app (all 20 fields, search, compare, progress, dark mode; Live jobs needs a server,
so it is not included) into one
dependency-free HTML file using the same JSON content. Open `demo/dist/careerpulse-demo-standalone.html`
directly in a browser, or host it anywhere static (GitHub Pages, Netlify Drop). It is useful as a quick, shareable
preview alongside the full Next.js app.

## Adding or editing a field

1. Copy any file in `src/data/fields/` and edit it. Your editor will flag type mismatches.
2. Register it in `src/data/fields/index.ts` (the array order is the "Featured" order).
3. Add an icon to `src/components/field-icon.tsx` if you need a new one.
4. Run `npm test` and `npm run check-links`.

## Deploying

The app is static apart from client-side state and the daily jobs refresh, so it runs anywhere that supports Next.js:

- **Vercel:** import the GitHub repo. The core app needs no configuration; for Live jobs, add the environment
  variables and Upstash Redis described in [Live jobs → Setup](#setup).
- **Any Node host:** `npm run build && npm start`.

The canonical URL, sitemap and robots.txt default to `https://careerpulse-beta.vercel.app`. Set
`NEXT_PUBLIC_SITE_URL` to override it (e.g. for your own fork or a custom domain).

## Push to GitHub

```bash
git init                      # skip if the folder is already a repo
git add -A
git commit -m "Initial commit: CareerPulse"
git branch -M main
git remote add origin https://github.com/redoanulrusho/careerpulse.git
git push -u origin main
```

Or with the GitHub CLI: `gh repo create careerpulse --public --source=. --push`.

## Data sources & methodology

- **Bangladesh:** [Paylab Bangladesh](https://www.paylab.com/bd/salaryinfo/information-technology), 10th–90th
  percentile gross monthly salaries for the closest matching job category (each field notes which category it used),
  plus [Levels.fyi Bangladesh](https://www.levels.fyi/t/software-engineer/locations/bangladesh) for top-company pay.
- **Remote:** CareerPulse estimates, informed by
  [Arc.dev's Bangladesh remote salary data](https://arc.dev/salaries/software-engineers-in-bangladesh).
- **Global:** US medians from the [BLS Occupational Outlook Handbook](https://www.bls.gov/ooh/) (May 2025 wages,
  2025–35 projections), or IAPP for AI governance.
- **Trends:** WEF Future of Jobs Report 2025, LinkedIn Jobs on the Rise 2026, Stack Overflow Developer Survey 2025,
  ISC2 Workforce Study 2025, LinkedIn Green Skills Report 2025, IEA, Gartner and others, all linked inside each field.

Salaries change, so treat every figure as a starting point and check the linked source. Content was researched in
October 2026.

## Continuous integration

`.github/workflows/ci.yml` runs lint, type-check, tests and a production build on every push and pull request.

## License

[MIT](LICENSE). Content is provided for educational purposes.
