export interface ProjectImage {
  src: string;
  caption?: string;
  className?: string;
  wrapperClassName?: string;
  width: number;
  height: number;
}

export interface ProjectFrontmatter {
  id: string;
  name: string;
  slug: string;
  description: string;
  href: string;
  image: string;
  wrapperClassName?: string;
  imageClassName?: string;
  category: 'featured' | 'open-source' | 'personal';
  // Extended fields for project detail page
  liveUrl: string;
  sourceUrl: string;
  longDescription: string;
  additionalDescription: string;
  stack: string[];
  images: ProjectImage[];
  highlights: string[];
  moreProjects: string[];
}

export interface Project {
  slug: string;
  content: string;
  frontmatter: ProjectFrontmatter;
}

export interface ArticleFrontmatter {
  title: string;
  slug: string;
  description: string;
  date: string;
  pinned?: boolean;
}

export interface Article {
  slug: string;
  content: string;
  frontmatter: ArticleFrontmatter;
}
