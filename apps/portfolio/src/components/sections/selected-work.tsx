import { ProjectCard } from '@/components/project-card';
import { SelectedWorkHeader } from '@/components/selected-work-header';
import { getAllProjects } from '@/lib/projects';

const SelectedWork = async () => {
  const allProjects = await getAllProjects();

  // Filter to show only selected projects (IDs: 1, 2, 3, 4)
  const selectedProjectIds = ['1', '2', '3', '4'];
  const projects = allProjects.filter((project) =>
    selectedProjectIds.includes(project.id),
  );

  return (
    <section className="section-padding bigger-container space-y-10 pt-0!">
      <SelectedWorkHeader />

      <ul className="grid gap-x-5 gap-y-10 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </ul>
    </section>
  );
};

export default SelectedWork;
