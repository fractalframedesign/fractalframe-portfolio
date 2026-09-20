import './theme.css';

import { ShowcaseShell } from '@/components/showcase/showcase-shell';
import { getShowcaseProject } from '@/lib/showcase';

const project = getShowcaseProject('smart-home-dashboard')!;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ShowcaseShell project={project}>{children}</ShowcaseShell>;
}
