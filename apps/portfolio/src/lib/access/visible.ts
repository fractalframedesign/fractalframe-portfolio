import { type AccessLevel, resolveLevel } from './levels';

/** Drops Admin projects (and unknown slugs); marks Unlocked ones as locked */
export function visibleProjects<T extends { slug: string }>(
  items: T[],
  levels: Map<string, AccessLevel>,
): Array<T & { locked: boolean }> {
  return items.flatMap((item) => {
    const level = resolveLevel(item.slug, levels);
    return level === 'admin' ? [] : [{ ...item, locked: level === 'unlocked' }];
  });
}
