import { describe, expect, it } from 'vitest';

import { checkEnv } from './env';

const complete = {
  DATABASE_URL: 'postgresql://user:pass@ep-x.neon.tech/db?sslmode=require',
  ADMIN_SESSION_SECRET: 'x'.repeat(32),
  RESEND_API_KEY: 're_123',
};

describe('checkEnv', () => {
  it('passes a complete production environment', () => {
    expect(checkEnv(complete, true)).toEqual({ errors: [], warnings: [] });
  });

  it('makes a missing required value an error in production only', () => {
    const env = { ...complete, RESEND_API_KEY: undefined };
    expect(checkEnv(env, true).errors).toEqual([
      expect.stringContaining('RESEND_API_KEY is not set'),
    ]);
    expect(checkEnv(env, false)).toEqual({
      errors: [],
      warnings: [expect.stringContaining('RESEND_API_KEY is not set')],
    });
  });

  it('treats an empty string as missing', () => {
    const { errors } = checkEnv({ ...complete, DATABASE_URL: '' }, true);
    expect(errors).toEqual([expect.stringContaining('DATABASE_URL is not set')]);
  });

  it('rejects a value in the wrong format wherever it runs', () => {
    const env = { ...complete, NEXT_PUBLIC_SITE_URL: 'example.com' };
    expect(checkEnv(env, false).errors).toEqual([
      expect.stringContaining('NEXT_PUBLIC_SITE_URL'),
    ]);
  });

  it('only warns about a short session secret, so a deploy is never blocked by it', () => {
    const report = checkEnv({ ...complete, ADMIN_SESSION_SECRET: 'short' }, true);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([
      'ADMIN_SESSION_SECRET should be at least 32 characters',
    ]);
  });

  it('ignores optional values that are not set', () => {
    expect(checkEnv({}, false).warnings).toHaveLength(3);
  });
});
