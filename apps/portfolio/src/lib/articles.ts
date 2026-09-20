import { createContentSource } from '@/lib/content';
import { articleSchema } from '@/lib/schemas';

const articles = createContentSource({
  dir: 'articles',
  schema: articleSchema,
  // Pinned first, then newest first
  sort: (a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  },
});

export const getArticleSlugs = articles.getSlugs;
export const getArticleBySlug = articles.getBySlug;
export const getAllArticles = articles.getAll;
