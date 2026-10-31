import { showcaseProjects } from '@/lib/showcase';

export type AccessLevel = 'public' | 'unlocked' | 'admin';

const PUBLIC_SLUGS = [
  'bloom',
  'cactus-plant',
  'charter',
  'echo-ui',
  'echo',
  'finance-dashboard',
  'happy-stats',
  'justos',
  'neobase',
  'plasma',
  'relative',
  'scalar',
  'smart-home-dashboard',
  'sonic',
  'stellar',
  'streamline',
];

export const SEED_LEVELS: Record<string, AccessLevel> = {
  ...Object.fromEntries(
    PUBLIC_SLUGS.map((slug) => [slug, 'public' as AccessLevel]),
  ),
  'fintech-components': 'unlocked',
};

export function resolveLevel(
  slug: string,
  stored: ReadonlyMap<string, AccessLevel>,
): AccessLevel {
  return stored.get(slug) ?? 'admin';
}

export function canBeUnlocked(slug: string): boolean {
  return showcaseProjects.some((project) => project.slug === slug);
}
