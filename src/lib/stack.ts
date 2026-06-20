import {
  DockerIcon,
  FigmaIcon,
  FlyIoIcon,
  NextJsIcon,
  NodeJsIcon,
  TailwindIcon,
  TypeScriptIcon,
  VercelIcon,
} from '@/components/icons/stack';

export interface StackItem {
  name: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

export const stackConfig: Record<string, StackItem> = {
  typescript: { name: 'TypeScript', Icon: TypeScriptIcon, color: '#3178C6' },
  nextjs: { name: 'Next.js', Icon: NextJsIcon, color: '#000000' },
  figma: { name: 'Figma', Icon: FigmaIcon, color: '#F24E1E' },
  nodejs: { name: 'Node.js', Icon: NodeJsIcon, color: '#3C873A' },
  vercel: { name: 'Vercel', Icon: VercelIcon, color: '#000000' },
  tailwind: { name: 'Tailwind CSS', Icon: TailwindIcon, color: '#06B6D4' },
  docker: { name: 'Docker', Icon: DockerIcon, color: '#0DB7ED' },
  flyio: { name: 'Fly.io', Icon: FlyIoIcon, color: '#8B5CF6' },
};

export function getStackItems(stackKeys: string[]): StackItem[] {
  return stackKeys.map((key) => stackConfig[key.toLowerCase()]).filter(Boolean);
}
