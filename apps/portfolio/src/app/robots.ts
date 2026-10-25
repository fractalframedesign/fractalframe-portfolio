import type { MetadataRoute } from 'next';

import { PROTECTED_SHOWCASE } from '@/lib/constants';
import { getSiteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/showcase/unlock',
        ...PROTECTED_SHOWCASE.map((slug) => `/showcase/${slug}`),
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
