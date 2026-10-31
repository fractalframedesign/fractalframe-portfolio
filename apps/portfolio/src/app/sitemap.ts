import type { MetadataRoute } from 'next';

import { getProductLevels } from '@/lib/access/cached-levels';
import { resolveLevel } from '@/lib/access/levels';
import { getAllArticles } from '@/lib/articles';
import { getAllProjects } from '@/lib/projects';
import { showcaseProjects } from '@/lib/showcase';
import { getSiteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const [articles, projects, levels] = await Promise.all([
    getAllArticles(),
    getAllProjects(),
    getProductLevels(),
  ]);
  const isPublic = (slug: string) => resolveLevel(slug, levels) === 'public';

  const staticRoutes = ['', '/about', '/articles', '/projects', '/showcase'];

  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route}` })),
    ...articles.map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: new Date(article.date),
    })),
    // Only public projects: Admin and Unlocked ones stay out of search
    ...projects
      .filter((project) => isPublic(project.slug))
      .map((project) => ({
        url: `${baseUrl}/projects/${project.slug}`,
      })),
    ...showcaseProjects
      .filter((project) => isPublic(project.slug))
      .map((project) => ({
        url: `${baseUrl}/showcase/${project.slug}`,
      })),
  ];
}
