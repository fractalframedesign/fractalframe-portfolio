import ProjectsTabs from '@/components/sections/projects-tabs';
import { getAllProjects } from '@/lib/projects';

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <section className="hero-padding">
      <div className="container flex flex-col gap-5">
        <h1 className="text-3xl md:text-4xl">Projects & experiments</h1>
        <p className="text-muted-foreground text-lg leading-none">
          A selection of tools, products, and experiments I’ve built over the
          years
        </p>
      </div>

      <ProjectsTabs projects={projects} />
    </section>
  );
}
