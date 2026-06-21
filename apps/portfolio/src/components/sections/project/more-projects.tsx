import { ProjectCard } from '@/components/project-card';
import { ProjectFrontmatter } from '@/lib/types';

interface MoreProjectsProps {
  projects: ProjectFrontmatter[];
}

const MoreProjects = ({ projects }: MoreProjectsProps) => {
  if (projects.length === 0) return null;

  return (
    <section className="section-padding space-y-10">
      <h2 className="container text-2xl">More projects</h2>
      <ul className="bigger-container grid gap-x-5 gap-y-10 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </ul>
    </section>
  );
};

export default MoreProjects;
