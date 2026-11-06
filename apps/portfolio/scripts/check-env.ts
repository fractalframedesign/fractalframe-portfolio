import { existsSync } from 'node:fs';

import { checkEnv } from '../src/lib/env';

// Next loads .env.local by itself; this script runs before Next, so load it
// here too. Values already set (Vercel, CI) win over the file.
if (existsSync('.env.local')) process.loadEnvFile('.env.local');

// Only a production deploy must have every required value; previews, CI and
// local builds get warnings, since the app copes without a database or email
const production = process.env.VERCEL_ENV === 'production';
const { errors, warnings } = checkEnv(process.env, production);

for (const warning of warnings) console.warn(`⚠ env: ${warning}`);
for (const error of errors) console.error(`✖ env: ${error}`);

if (errors.length) {
  console.error(
    '\nFix these in Vercel → Settings → Environment Variables (or .env.local), then redeploy.',
  );
  process.exit(1);
}
