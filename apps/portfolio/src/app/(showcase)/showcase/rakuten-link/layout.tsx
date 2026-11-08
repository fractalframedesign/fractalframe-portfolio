import '@/components/project-demos/rakuten-link/theme.css';

import { linkFonts } from '@/components/project-demos/rakuten-link/fonts';
import { ShowcaseShell } from '@/components/showcase/showcase-shell';
import { getShowcaseProject } from '@/lib/showcase';

const project = getShowcaseProject('rakuten-link')!;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ShowcaseShell project={project}>
      <div data-project="rakuten-link" className={linkFonts}>
        {children}
      </div>
    </ShowcaseShell>
  );
}
