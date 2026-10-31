import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

// Node only (the proxy never imports this). Format: scrypt$N$r$p$salt$hash
const PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer, params: typeof PARAMS) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, KEY_LENGTH, params, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt, PARAMS);
  const { N, r, p } = PARAMS;
  return [
    'scrypt',
    N,
    r,
    p,
    salt.toString('base64'),
    key.toString('base64'),
  ].join('$');
}

export async function verifyPasswordHash(password: string, stored: string) {
  const [scheme, N, r, p, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;

  const expected = Buffer.from(hash, 'base64');
  if (expected.length !== KEY_LENGTH) return false;
  try {
    const key = await derive(password, Buffer.from(salt, 'base64'), {
      N: Number(N),
      r: Number(r),
      p: Number(p),
    });
    return timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}
