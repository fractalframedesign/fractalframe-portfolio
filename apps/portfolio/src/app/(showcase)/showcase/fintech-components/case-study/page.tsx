import type { Metadata } from 'next';

import { FintechCaseStudy } from '@/components/project-demos/fintech-components/docs/case-study';

export const metadata: Metadata = { title: 'Case study' };

export default function Page() {
  return <FintechCaseStudy />;
}
