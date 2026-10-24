import { z } from 'zod';

// YAML parses unquoted `2026-07-17` as a Date, so accept both and normalise to a string.
const dateString = z
  .union([z.string(), z.date()])
  .transform((value) =>
    value instanceof Date ? value.toISOString().slice(0, 10) : value,
  );

export const projectImageSchema = z.object({
  src: z.string(),
  caption: z.string().optional(),
  className: z.string().optional(),
  wrapperClassName: z.string().optional(),
  width: z.number(),
  height: z.number(),
});

/** Optional long-form layout for a project page: tags, story sections and a gallery */
export const projectCaseStudySchema = z.object({
  industries: z.array(z.string()),
  services: z.array(z.string()),
  sections: z.array(
    z.object({
      title: z.string(),
      paragraphs: z.array(z.string()),
    }),
  ),
  gallery: z.array(projectImageSchema),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  href: z.string(),
  /** Open the card's link in a new tab (e.g. showcase projects) */
  openInNewTab: z.boolean().optional(),
  image: z.string(),
  wrapperClassName: z.string().optional(),
  imageClassName: z.string().optional(),
  category: z.enum(['featured', 'open-source', 'personal', 'upcoming']),
  // Extended fields for the project detail page
  liveUrl: z.string(),
  sourceUrl: z.string(),
  longDescription: z.string(),
  additionalDescription: z.string(),
  stack: z.array(z.string()),
  images: z.array(projectImageSchema),
  highlights: z.array(z.string()),
  moreProjects: z.array(z.string()),
  caseStudy: projectCaseStudySchema.optional(),
});

export const articleSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  date: dateString,
  image: z.string().optional(),
  pinned: z.boolean().optional(),
});
