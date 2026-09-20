import fs from 'fs/promises';
import matter from 'gray-matter';
import path from 'path';
import type { z } from 'zod';

type ContentSourceConfig<S extends z.ZodType> = {
  /** Directory under `content/` that holds the `.mdx` files */
  dir: string;
  schema: S;
  /** Order for `getAll`; defaults to file order */
  sort?: (a: z.output<S>, b: z.output<S>) => number;
};

export type ContentEntry<T> = {
  slug: string;
  /** Raw file contents, including frontmatter */
  content: string;
  frontmatter: T;
};

/**
 * File-based MDX content collection with validated frontmatter.
 * Invalid frontmatter throws with the file name and the failing fields, so a
 * broken entry fails the build instead of crashing a page at render time.
 */
export function createContentSource<S extends z.ZodType>({
  dir,
  schema,
  sort,
}: ContentSourceConfig<S>) {
  type Frontmatter = z.output<S>;
  const directory = path.join(process.cwd(), 'content', dir);

  function parse(slug: string, raw: string): ContentEntry<Frontmatter> {
    const result = schema.safeParse(matter(raw).data);

    if (!result.success) {
      const issues = result.error.issues
        .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('\n');
      throw new Error(`Invalid frontmatter in content/${dir}/${slug}.mdx\n${issues}`);
    }

    const declaredSlug = (result.data as { slug?: string }).slug;
    if (declaredSlug !== undefined && declaredSlug !== slug) {
      throw new Error(
        `Slug mismatch in content/${dir}/${slug}.mdx: frontmatter says "${declaredSlug}" but the file name is "${slug}"`,
      );
    }

    return { slug, content: raw, frontmatter: result.data };
  }

  async function getSlugs(): Promise<string[]> {
    const files = await fs.readdir(directory);
    return files
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace(/\.mdx$/, ''));
  }

  async function getBySlug(slug: string): Promise<ContentEntry<Frontmatter> | null> {
    let raw: string;
    try {
      raw = await fs.readFile(path.join(directory, `${slug}.mdx`), 'utf8');
    } catch {
      return null;
    }
    return parse(slug, raw);
  }

  async function getAll(): Promise<Frontmatter[]> {
    const slugs = await getSlugs();
    const entries = await Promise.all(
      slugs.map(async (slug) => {
        const raw = await fs.readFile(path.join(directory, `${slug}.mdx`), 'utf8');
        return parse(slug, raw).frontmatter;
      }),
    );
    return sort ? entries.sort(sort) : entries;
  }

  return { getSlugs, getBySlug, getAll };
}
