import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The primitives in src/ui are copied from shadcn, so they keep its style
  globalIgnores(['src/ui/**']),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // A package has no pages folder for this rule to read
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
]);

export default eslintConfig;
