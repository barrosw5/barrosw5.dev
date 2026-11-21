import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  // Same `@/` shortcut as tsconfig.json (`@/i18n/routing` → src/i18n/routing)
  resolve: { alias: { '@': path.join(dirname, 'src') } },
  test: {
    projects: [
      {
        // Plain unit tests (*.test.ts), no browser needed
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        // Prepared up front: found halfway through a run with an empty cache
        // (always, on CI), Vite reloads the page and the running stories fail
        optimizeDeps: {
          include: [
            '@supabase/ssr',
            '@supabase/supabase-js',
            'next-intl/server',
            'next/cache',
            'next/headers',
          ],
        },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
