'use client';

import { Code, Heart, Layers, type LucideIcon, Star } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { parseAsString, useQueryState } from 'nuqs';

import { ProjectCard } from '@/components/project-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectFrontmatter } from '@/lib/types';

type ProjectsTabsProps = {
  projects: ProjectFrontmatter[];
};

const tabParser = parseAsString.withDefault('all').withOptions({
  clearOnDefault: true,
});

const tabIcons: Record<string, LucideIcon> = {
  all: Layers,
  featured: Star,
  'open-source': Code,
  personal: Heart,
};

const ProjectsTabs = ({ projects }: ProjectsTabsProps) => {
  const [activeTab, setActiveTab] = useQueryState('tab', tabParser);

  const filteredProjects =
    activeTab === 'all'
      ? projects
      : projects.filter((project) => project.category === activeTab);

  const currentIcon = tabIcons[activeTab] || Layers;

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="bigger-container"
    >
      <div className="mt-15 mb-14 md:container md:mt-18 md:mb-17">
        <TabsList>
          <TabsTrigger value="all">
            <Layers className="size-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="featured">
            <Star className="size-4" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="open-source">
            <Code className="size-4" />
            Open Source
          </TabsTrigger>
          <TabsTrigger value="personal">
            <Heart className="size-4" />
            Personal
          </TabsTrigger>
        </TabsList>
      </div>

      <ul className="grid gap-x-5 gap-y-10 md:grid-cols-2">
        <AnimatePresence mode="sync">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              icon={currentIcon}
            />
          ))}
        </AnimatePresence>
      </ul>
    </Tabs>
  );
};

export default ProjectsTabs;
