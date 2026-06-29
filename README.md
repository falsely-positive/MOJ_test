# B&B Demo — QE Test Automation

Automated tests for the **B&B Demo** web app (the Restful Booker Platform demo at
[automationintesting.online](https://automationintesting.online)), built with
[Playwright](https://playwright.dev/) and TypeScript.

The suite is split into two levels:

- **E2E (UI)** — the highest-risk user journeys:
  - **Room Availability Checker** — a valid date range returns available room types, and a
    no-rooms date range renders an empty grid (covered by both a **stubbed** test that runs on
    every browser and a **real-API** test that books out a far-future date)
    ([tests/e2e/availability.spec.ts](tests/e2e/availability.spec.ts)).
  - **Admin authentication** — valid login, rejected invalid login, and the US3 "authenticated
    within 5 seconds" SLA ([tests/e2e/adminLogin.spec.ts](tests/e2e/adminLogin.spec.ts)).
- **API** — fast, browserless checks and the mechanism for data setup/teardown:
  - **Auth** — valid credentials return a token within the US3 5-second SLA; invalid credentials
    return 401 with no token ([tests/api/authApi.spec.ts](tests/api/authApi.spec.ts)).

> This repo is the **working baseline** that accompanies the written test strategy (Tasks 1–3).
> The strategy document also describes proposed extensions (accessibility scans, load testing, and
> further API coverage) that are intentionally **not** implemented here given the time-box.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (developed on Node 26)
- npm (ships with Node)

## Setup

```bash
# 1. Install dependencies
npm ci

# 2. Install the Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install --with-deps

# 3. Create your local env file from the template
cp .env.example .env
```

Then open `.env` and set the admin credentials. For the public demo they are `admin` / `password`.
`.env` is gitignored and is never committed — see [.env.example](.env.example).

## Configuration

Environments are defined in [environments.ts](environments.ts) and selected with the `ENV`
variable (defaults to `production`):

| `ENV`        | Base URL                              |
| ------------ | ------------------------------------- |
| `production` | `https://automationintesting.online/` |
| `local`      | `http://localhost:8080/`              |

Credentials are read from environment variables (`ADMIN_USER`, `ADMIN_PASSWORD`) — never
hardcoded. Locally they come from `.env`; in CI they come from GitHub Actions secrets.

## Running the tests

The suite is selected with the `SUITE` env var, wrapped in npm scripts:

```bash
# Run everything — E2E (all browsers) + API
npm test

# Just the E2E suite
npm run test:e2e

# Just the API suite (browserless, fast)
npm run test:api
```

Other useful invocations:

```bash
# A single spec
npx playwright test tests/e2e/adminLogin.spec.ts

# A single project (faster while developing)
npx playwright test --project=chromium

# Only the non-functional performance checks (US3 5-second SLA)
npx playwright test --grep @performance

# Headed / step-through debugging
npx playwright test --headed
npx playwright test --ui
```

By default tests run against the public demo. To point at a local instance:

```bash
ENV=local npm test
```

## Linting

ESLint (flat config, with the TypeScript and Playwright plugins) is configured in
[eslint.config.mjs](eslint.config.mjs):

```bash
npm run lint        # report problems
npm run lint:fix    # auto-fix what can be fixed
```

## Viewing the report

An HTML report is generated after each local run:

```bash
npx playwright show-report
```

Traces are retained on failure locally (and on first retry in CI) for step-by-step debugging via
the Playwright trace viewer.

## Project structure

```
.
├── tests/
│   ├── e2e/                # UI specs (Page Object Model)
│   │   ├── availability.spec.ts
│   │   └── adminLogin.spec.ts
│   └── api/                # API specs (Playwright request API)
│       └── authApi.spec.ts
├── pages/                  # Page objects (UI)
│   ├── basePage.ts
│   ├── homePage.ts
│   └── loginPage.ts
├── api/                    # Service objects (API — the request-side equivalent of page objects)
│   ├── authApi.ts
│   └── bookingApi.ts
├── fixtures/test.ts        # Custom fixtures (inject page/service objects into tests)
├── helpers/date.ts         # Date helpers for the availability checker
├── environments.ts         # Environment / base URL / credential config
├── playwright.config.ts    # Playwright configuration (SUITE-based project selection)
├── eslint.config.mjs       # ESLint flat config
└── .github/workflows/      # CI pipeline (GitHub Actions)
```

Tests follow the **Page Object Model**: UI locators and interactions live in `pages/`, and API
interactions live in equivalent **service objects** in `api/`, keeping the specs readable and
resilient to UI or API changes. Both are injected into tests via the custom fixtures in
[fixtures/test.ts](fixtures/test.ts).

## Continuous integration

[.github/workflows/playwright.yml](.github/workflows/playwright.yml) runs on every push and pull
request to `main`/`master` as a gated, multi-job pipeline:

```
api-tests → e2e-tests → merge-report → deploy-report
```

- **api-tests** runs first as a fast, browserless gate.
- **e2e-tests** runs only if the API tests pass, installing browsers and running the E2E suite.
- **merge-report** combines the two suites' blob reports into a single HTML report (uploaded as an
  artifact).
- **deploy-report** publishes that report to GitHub Pages on pushes.

Credentials are supplied as repository secrets (`ADMIN_USER`, `ADMIN_PASSWORD`) under
**Settings → Secrets and variables → Actions** — never committed to the repo.
