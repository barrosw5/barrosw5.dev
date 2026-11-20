// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Build output of `pnpm build-storybook` and test coverage
    "storybook-static/**",
    "coverage/**",
    // Playwright reports
    "playwright-report/**",
    "test-results/**",
  ]),
  ...storybook.configs["flat/recommended"],
  {
    // Playwright tests have no React: their fixtures call a function named
    // `use`, which the React hooks rule mistakes for React's use()
    files: ["e2e/**"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
]);

export default eslintConfig;
