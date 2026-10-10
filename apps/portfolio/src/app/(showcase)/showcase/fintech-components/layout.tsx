import './theme.css';
import '@/components/project-demos/fintech-components/tokens/tokens.css';

import { ShowcaseShell } from '@/components/showcase/showcase-shell';
import { getShowcaseProject } from '@/lib/showcase';

const project = getShowcaseProject('fintech-components')!;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ShowcaseShell project={project}>{children}</ShowcaseShell>;
}
