import type { MetadataRoute } from 'next';

import { getProductLevels } from '@/lib/access/cached-levels';
import { resolveLevel } from '@/lib/access/levels';
import { showcaseProjects } from '@/lib/showcase';
import { getSiteUrl } from '@/lib/site';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const levels = await getProductLevels();

  // Admin and unknown slugs are never listed, so robots.txt reveals nothing
  const unlocked = showcaseProjects
    .filter((project) => resolveLevel(project.slug, levels) === 'unlocked')
    .map((project) => `/showcase/${project.slug}`);

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/showcase/unlock', ...unlocked],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
