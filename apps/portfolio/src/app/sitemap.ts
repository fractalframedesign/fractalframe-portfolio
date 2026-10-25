import type { MetadataRoute } from 'next';

import { getAllArticles } from '@/lib/articles';
import { PROTECTED_SHOWCASE } from '@/lib/constants';
import { getAllProjects } from '@/lib/projects';
import { showcaseProjects } from '@/lib/showcase';
import { getSiteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const [articles, projects] = await Promise.all([
    getAllArticles(),
    getAllProjects(),
  ]);

  const staticRoutes = ['', '/about', '/articles', '/projects', '/showcase'];

  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route}` })),
    ...articles.map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: new Date(article.date),
    })),
    ...projects.map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
    })),
    // Password-protected projects only redirect crawlers, so leave them out
    ...showcaseProjects
      .filter((project) => !PROTECTED_SHOWCASE.includes(project.slug))
      .map((project) => ({
        url: `${baseUrl}/showcase/${project.slug}`,
      })),
  ];
}
