import fs from 'fs/promises';
import { compileMDX } from 'next-mdx-remote/rsc';
import path from 'path';

import { Article, ArticleFrontmatter } from '@/lib/types';

const articlesDirectory = path.join(process.cwd(), 'content/articles');

/**
 * Get all article slugs
 */
export async function getArticleSlugs(): Promise<string[]> {
  try {
    const files = await fs.readdir(articlesDirectory);
    return files
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace('.mdx', ''));
  } catch (error) {
    console.error('Error reading articles directory:', error);
    return [];
  }
}

/**
 * Get article by slug
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.mdx`);
    const fileContents = await fs.readFile(fullPath, 'utf8');

    const { frontmatter } = await compileMDX<ArticleFrontmatter>({
      source: fileContents,
      options: { parseFrontmatter: true },
    });

    return {
      slug,
      content: fileContents,
      frontmatter,
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}

/**
 * Get all articles with their frontmatter
 */
export async function getAllArticles(): Promise<ArticleFrontmatter[]> {
  try {
    const files = await fs.readdir(articlesDirectory);
    const mdxFiles = files.filter((file) => file.endsWith('.mdx'));

    const articles = await Promise.all(
      mdxFiles.map(async (file) => {
        const fullPath = path.join(articlesDirectory, file);
        const fileContents = await fs.readFile(fullPath, 'utf8');
        const { frontmatter } = await compileMDX<ArticleFrontmatter>({
          source: fileContents,
          options: { parseFrontmatter: true },
        });

        return frontmatter;
      }),
    );

    // Sort by date (newest first), then pinned articles first
    return articles.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error('Error reading all articles:', error);
    return [];
  }
}
