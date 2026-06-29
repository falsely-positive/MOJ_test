# B&B Demo — QE Test Automation

Automated end-to-end tests for the **B&B Demo** web app (the Restful Booker Platform demo at
[automationintesting.online](https://automationintesting.online)), built with
[Playwright](https://playwright.dev/) and TypeScript.

The suite covers the two highest-risk journeys from the user stories:

- **Room Availability Checker** — a valid date range returns available room types ([tests/availability.spec.ts](tests/availability.spec.ts)).
- **Admin authentication** — valid login, rejected invalid login, and the US3 "authenticated within 5 seconds" SLA ([tests/adminLogin.spec.ts](tests/adminLogin.spec.ts)).

> This repo is the **working baseline** that accompanies the written test strategy (Tasks 1–3).
> The strategy document also describes proposed extensions (API-level tests, accessibility scans,
> load testing) that are intentionally **not** implemented here given the time-box.

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

```bash
# Run the full suite (all browsers/projects)
npm test

# A single spec
npx playwright test tests/adminLogin.spec.ts

# A single project (faster while developing)
npx playwright test --project=chromium

# Only the non-functional performance check (US3 5-second SLA)
npx playwright test --grep @performance

# Headed / step-through debugging
npx playwright test --headed
npx playwright test --ui
```

By default tests run against the public demo. To point at a local instance:

```bash
ENV=local npm test
```

## Viewing the report

An HTML report is generated after each run:

```bash
npx playwright show-report
```

Traces are retained on failure locally (and on first retry in CI) for step-by-step debugging via
the Playwright trace viewer.

## Project structure

```
.
├── tests/                  # Test specs
│   ├── availability.spec.ts
│   └── adminLogin.spec.ts
├── pages/                  # Page Object Model
│   ├── basePage.ts
│   ├── homePage.ts
│   └── loginPage.ts
├── fixtures/test.ts        # Custom fixtures (inject page objects into tests)
├── helpers/date.ts         # Date helpers for the availability checker
├── environments.ts         # Environment / base URL / credential config
├── playwright.config.ts    # Playwright configuration
└── .github/workflows/      # CI pipeline (GitHub Actions)
```

Tests follow the **Page Object Model**: UI locators and interactions live in `pages/`, keeping the
specs readable and resilient to UI changes. Page objects are injected into tests via the custom
fixtures in [fixtures/test.ts](fixtures/test.ts).

## Continuous integration

[.github/workflows/playwright.yml](.github/workflows/playwright.yml) runs the suite on every push
and pull request to `main`/`master`. It installs dependencies and browsers, runs the tests against
the `production` environment, and uploads the HTML report as a build artifact. On pushes, the report
is also published to GitHub Pages.

Credentials are supplied as repository secrets (`ADMIN_USER`, `ADMIN_PASSWORD`) under
**Settings → Secrets and variables → Actions** — never committed to the repo.
