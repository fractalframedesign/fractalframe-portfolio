import { ProjectCard } from '@/components/project-card';
import { SelectedWorkHeader } from '@/components/selected-work-header';
import { getAllProjects } from '@/lib/projects';

const STAGGER_DELAY = 0.1;

const SelectedWork = async () => {
  const allProjects = await getAllProjects();

  const selectedProjectIds = ['1', '2', '3', '4'];
  const projects = allProjects.filter((project) =>
    selectedProjectIds.includes(project.id),
  );

  return (
    <section className="section-padding bigger-container space-y-10 pt-0!">
      <SelectedWorkHeader />

      <ul className="grid gap-x-5 gap-y-10 md:grid-cols-2">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            delay={i * STAGGER_DELAY}
          />
        ))}
      </ul>
    </section>
  );
};

export default SelectedWork;
