import { ImageIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProjectImagePlaceholderProps {
  label: string;
  decorative?: boolean;
  className?: string;
}

const ProjectImagePlaceholder = ({
  label,
  decorative = false,
  className,
}: ProjectImagePlaceholderProps) => (
  <div
    role={decorative ? undefined : 'img'}
    aria-label={decorative ? undefined : label}
    aria-hidden={decorative || undefined}
    className={cn(
      'text-muted-foreground bg-muted flex min-h-48 w-full flex-col items-center justify-center gap-3 px-6 py-10 text-center',
      className,
    )}
  >
    <ImageIcon aria-hidden="true" className="size-8" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default ProjectImagePlaceholder;
