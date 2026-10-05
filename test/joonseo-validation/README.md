# Test Directory

This directory contains all Playwright E2E tests for the Aggiemap application.

## Methodology

These tests validate user experiences and workflows, beginning from application startup through various UI interactions such as loading the application, navigating sidebar features, performing searches, and adjusting settings. The goal is to ensure that application updates maintain consistent behavior and provide immediate visibility into potential feature regressions.

# AggieMap E2E — Ground Rules (POM-first (Page Object Model), Parallel Teams)

**Location:** All work stays inside `tests/pages`.
**Ownership:** Each team owns only its area folders; do not edit others'.
**Selectors:** Prefer roles/labels; request `data-testid` only for your scope. Prefix with your team's prefix.
**Stability:** No fixed sleeps. Use expectations, URL or request assertions.
**Deliverables per team:**

- A short `README.md` in your team folder describing: Scope, POM APIs (names only), DoD, Dependencies, TestID prefix.
- Independent specs under your `specs/` team folder.
- If you add `data-testid`s, list them in your PR description.

See [Team Index](./TEAM_INDEX.md) for team assignments and details.

**Definition of Done (DoD) — for every team PR**

- Deterministic locally across two consecutive runs
- HTML report and trace artifacts enabled
- No edits outside your team folders

## Structure

```
tests/
├── pages/
│   ├── example/
│   │   ├── po/
│   │   │   └── *.page.ts
│   │   └── specs/
│   │       └── *.spec.ts
│   └── [team-name]/
│       ├── po/
│       │   └── *.page.ts
│       ├── specs/
│       │   └── *.spec.ts
│       └── README.md
└── README.md
```

## Naming Conventions

- **Test files**: `feature-name.spec.ts` (e.g., `login.spec.ts`, `map-navigation.spec.ts`)
- **Page objects**: `feature-name.page.ts` (e.g., `login.page.ts`, `map.page.ts`)

## Examples

- `pages/example/specs/example-page-object.spec.ts` - Test using Page Object Model
- `pages/example/po/playwright-home.page.ts` - Example page object

## Best Practices

1. **Group related tests**: Use `test.describe()` to organize tests by feature
2. **Independent tests**: Each test should be able to run in isolation
3. **Use page objects**: For complex pages with multiple interactions
4. **Meaningful names**: Test descriptions should clearly state what is being tested
5. **Avoid hardcoded waits**: Let Playwright auto-wait for elements

## Running Specific Tests

```bash
# Run a specific test file
npx playwright test tests/example.spec.ts

# Run tests matching a pattern
npx playwright test --grep "login"

# Run tests in a specific describe block
npx playwright test --grep "Feature Name"
```

## Debugging

```bash
# Run in UI mode (recommended)
npm run test:ui

# Run in debug mode with inspector
npm run test:debug

# Run a specific test in debug mode
npx playwright test tests/example.spec.ts --debug
```
