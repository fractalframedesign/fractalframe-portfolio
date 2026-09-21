import type { Metadata } from 'next';

import { ProjectCaseStudy } from '@/components/showcase/project-case-study';

export const metadata: Metadata = { title: 'Case study' };

export default function Page() {
  return <ProjectCaseStudy />;
}
