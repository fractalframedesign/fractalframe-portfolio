import { z } from 'zod';

// YAML parses unquoted `2026-07-17` as a Date, so accept both and normalise to a string.
const dateString = z
  .union([z.string(), z.date()])
  .transform((value) =>
    value instanceof Date ? value.toISOString().slice(0, 10) : value,
  );

export const projectImageSchema = z.object({
  src: z.string(),
  placeholder: z.boolean().optional(),
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

export const projectSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    href: z.string(),
    /** Open the card's link in a new tab (e.g. showcase projects) */
    openInNewTab: z.boolean().optional(),
    image: z.string(),
    imagePlaceholder: z.boolean().optional(),
    wrapperClassName: z.string().optional(),
    imageClassName: z.string().optional(),
    /** Muted looping video shown in the detail page's cover card instead of the image */
    coverVideo: z.object({ src: z.string(), poster: z.string() }).optional(),
    category: z.enum(['featured', 'open-source', 'personal', 'upcoming']),
    // Extended fields for the project detail page
    liveUrl: z.string().optional(),
    sourceUrl: z.string().optional(),
    longDescription: z.string(),
    additionalDescription: z.string(),
    stack: z.array(z.string()),
    images: z.array(projectImageSchema),
    highlights: z.array(z.string()),
    moreProjects: z.array(z.string()),
    caseStudy: projectCaseStudySchema.optional(),
  })
  .superRefine((project, context) => {
    if (!project.imagePlaceholder && !project.image) {
      context.addIssue({
        code: 'custom',
        path: ['image'],
        message: 'A project image is required unless imagePlaceholder is true',
      });
    }

    project.images.forEach((image, index) => {
      if (!image.placeholder && !image.src) {
        context.addIssue({
          code: 'custom',
          path: ['images', index, 'src'],
          message: 'A project image is required unless placeholder is true',
        });
      }
    });
  });

export const articleSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  date: dateString,
  image: z.string().optional(),
  pinned: z.boolean().optional(),
});
