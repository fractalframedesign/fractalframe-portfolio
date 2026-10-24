import type { z } from 'zod';

import type {
  articleSchema,
  projectCaseStudySchema,
  projectImageSchema,
  projectSchema,
} from '@/lib/schemas';

export type ProjectImage = z.output<typeof projectImageSchema>;
export type ProjectCaseStudy = z.output<typeof projectCaseStudySchema>;
export type ProjectFrontmatter = z.output<typeof projectSchema>;
export type ArticleFrontmatter = z.output<typeof articleSchema>;

export interface Project {
  slug: string;
  content: string;
  frontmatter: ProjectFrontmatter;
}

export interface Article {
  slug: string;
  content: string;
  frontmatter: ArticleFrontmatter;
}
