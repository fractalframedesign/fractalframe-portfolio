import { createContentSource } from '@/lib/content';
import { projectSchema } from '@/lib/schemas';

const projects = createContentSource({
  dir: 'projects',
  schema: projectSchema,
  sort: (a, b) => parseInt(a.id) - parseInt(b.id),
});

export const getProjectSlugs = projects.getSlugs;
export const getProjectBySlug = projects.getBySlug;
export const getAllProjects = projects.getAll;
