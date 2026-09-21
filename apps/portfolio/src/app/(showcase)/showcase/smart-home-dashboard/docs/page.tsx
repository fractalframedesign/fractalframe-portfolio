import type { Metadata } from 'next';

import { ProjectDocs } from '@/components/showcase/project-docs';
import { getShowcaseProject } from '@/lib/showcase';

export const metadata: Metadata = { title: 'Docs' };

export default function Page() {
  return <ProjectDocs project={getShowcaseProject('smart-home-dashboard')!} />;
}
