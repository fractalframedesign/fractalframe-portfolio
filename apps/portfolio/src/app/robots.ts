import type { MetadataRoute } from 'next';

import { getProductLevels } from '@/lib/access/cached-levels';
import { getAllProjects } from '@/lib/projects';
import { showcaseProjects } from '@/lib/showcase';
import { getSiteUrl } from '@/lib/site';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [levels, projects] = await Promise.all([
    getProductLevels(),
    getAllProjects(),
  ]);
  const hidden = (slug: string) => levels.get(slug) !== 'public';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/showcase/unlock',
        ...showcaseProjects
          .filter((p) => hidden(p.slug))
          .map((p) => `/showcase/${p.slug}`),
        ...projects.filter((p) => hidden(p.slug)).map((p) => `/projects/${p.slug}`),
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
