import { z, type ZodType } from 'zod';

type EnvVarSpec = {
  /** A set value that fails this is an error */
  schema: ZodType;
  /** A set value that fails this only gets a warning */
  advice?: ZodType;
  requiredInProduction: boolean;
  hint: string;
};

/**
 * Every environment variable the app reads. Code still reads `process.env`
 * where it needs a value (and copes when one is missing); this list is what
 * `scripts/check-env.ts` checks before a build. Add new variables here, to
 * `.env.example` and to `env` in the root `turbo.json`.
 */
export const ENV_VARS: Record<string, EnvVarSpec> = {
  DATABASE_URL: {
    schema: z.url(),
    requiredInProduction: true,
    hint: 'Neon pooled connection string',
  },
  ADMIN_SESSION_SECRET: {
    schema: z.string(),
    advice: z.string().min(32, 'should be at least 32 characters'),
    requiredInProduction: true,
    hint: 'signs admin sessions and guest passwords; never change it once set',
  },
  RESEND_API_KEY: {
    schema: z.string(),
    requiredInProduction: true,
    hint: 'sends access requests and invitations through Resend',
  },
  ADMIN_PASSWORD: {
    schema: z.string(),
    requiredInProduction: false,
    hint: 'first admin sign-in, only while the admin_account table is empty',
  },
  ACCESS_REQUEST_FROM: {
    schema: z.string(),
    requiredInProduction: false,
    hint: 'sender on a verified Resend domain, e.g. Kiran <hello@example.com>',
  },
  SHOWCASE_ACCESS: {
    schema: z.string(),
    requiredInProduction: false,
    hint: 'initial seed for the access tables only',
  },
  NEXT_PUBLIC_SITE_URL: {
    schema: z.url(),
    requiredInProduction: false,
    hint: 'canonical site URL; defaults to the Vercel production domain',
  },
};

export type EnvReport = {
  /** Missing or invalid; a production build stops on these */
  errors: string[];
  /** Worth fixing, never blocks a build */
  warnings: string[];
};

function firstIssue(schema: ZodType, value: string) {
  const result = schema.safeParse(value);
  return result.success ? null : (result.error.issues[0]?.message ?? 'is invalid');
}

function checkVar(
  name: string,
  spec: EnvVarSpec,
  value: string | undefined,
): { error?: string; warning?: string; missing?: string } {
  if (!value) {
    return spec.requiredInProduction
      ? { missing: `${name} is not set (${spec.hint})` }
      : {};
  }
  const invalid = firstIssue(spec.schema, value);
  if (invalid) return { error: `${name} ${invalid} (${spec.hint})` };
  const advice = spec.advice && firstIssue(spec.advice, value);
  return advice ? { warning: `${name} ${advice}` } : {};
}

/** Checks `env` against ENV_VARS; a missing required value is only an error in production */
export function checkEnv(
  env: Record<string, string | undefined>,
  production: boolean,
): EnvReport {
  const report: EnvReport = { errors: [], warnings: [] };

  for (const [name, spec] of Object.entries(ENV_VARS)) {
    const { error, warning, missing } = checkVar(name, spec, env[name]);
    if (error) report.errors.push(error);
    if (warning) report.warnings.push(warning);
    if (missing) (production ? report.errors : report.warnings).push(missing);
  }

  return report;
}
