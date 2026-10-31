import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Each test builds an in-memory Postgres; under a full parallel run that can pass 5s
  test: {
    environment: 'node',
    setupFiles: ['src/test/setup.ts'],
    testTimeout: 15_000,
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
