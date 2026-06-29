import js from "@eslint/js";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";

export default tseslint.config(
  {
    // Don't lint generated output or deps.
    ignores: [
      "node_modules/",
      "playwright-report/",
      "blob-report/",
      "test-results/",
      "playwright/.cache/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Playwright-specific rules, scoped to the test/support code.
    ...playwright.configs["flat/recommended"],
    files: ["tests/**", "fixtures/**", "pages/**", "api/**"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      // `async ({}, testInfo) => {}` is the idiomatic way to skip the fixtures
      // arg in a Playwright hook — allow the empty object pattern.
      "no-empty-pattern": ["error", { allowObjectPatternsAsParameters: true }],
      // We deliberately use test.skip() to pin the real-API empty-state test to
      // chromium only (avoids cross-project inventory contention); don't flag it.
      "playwright/no-skipped-test": "off",
    },
  },
);
