import {
  DockerIcon,
  FlyIoIcon,
  NodeJsIcon,
  VercelIcon,
} from '@/components/icons/stack';

export interface StackItem {
  name: string;
  color: string;
  lightSrc?: string;
  darkSrc?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const stackConfig: Record<string, StackItem> = {
  // Figma-sourced logos — light/dark image variants
  figma: {
    name: 'Figma',
    lightSrc: '/images/stack/figma-light.svg',
    darkSrc: '/images/stack/figma-dark.svg',
    color: '#F24E1E',
  },
  js: {
    name: 'JavaScript',
    lightSrc: '/images/stack/js-light.svg',
    darkSrc: '/images/stack/js-dark.svg',
    color: '#F7DF1E',
  },
  html5: {
    name: 'HTML5',
    lightSrc: '/images/stack/html5-light.svg',
    darkSrc: '/images/stack/html5-dark.svg',
    color: '#E34F26',
  },
  typescript: {
    name: 'TypeScript',
    lightSrc: '/images/stack/typescript-light.svg',
    darkSrc: '/images/stack/typescript-dark.svg',
    color: '#3178C6',
  },
  reactjs: {
    name: 'React',
    lightSrc: '/images/stack/reactjs-light.svg',
    darkSrc: '/images/stack/reactjs-dark.svg',
    color: '#61DAFB',
  },
  nextjs: {
    name: 'Next.js',
    lightSrc: '/images/stack/nextjs-light.svg',
    darkSrc: '/images/stack/nextjs-dark.svg',
    color: '#000000',
  },
  tailwind: {
    name: 'Tailwind CSS',
    lightSrc: '/images/stack/tailwind-light.svg',
    darkSrc: '/images/stack/tailwind-dark.svg',
    color: '#06B6D4',
  },
  vscode: {
    name: 'VS Code',
    lightSrc: '/images/stack/vscode-light.svg',
    darkSrc: '/images/stack/vscode-dark.svg',
    color: '#007ACC',
  },
  claude: {
    name: 'Claude',
    lightSrc: '/images/stack/claude-light.svg',
    darkSrc: '/images/stack/claude-dark.svg',
    color: '#D97757',
  },
  codex: {
    name: 'Codex',
    lightSrc: '/images/stack/codex-light.svg',
    darkSrc: '/images/stack/codex-dark.svg',
    color: '#7A9DFF',
  },
  // Icon-based fallbacks (used on other pages)
  nodejs: { name: 'Node.js', Icon: NodeJsIcon, color: '#3C873A' },
  vercel: { name: 'Vercel', Icon: VercelIcon, color: '#000000' },
  docker: { name: 'Docker', Icon: DockerIcon, color: '#0DB7ED' },
  flyio: { name: 'Fly.io', Icon: FlyIoIcon, color: '#8B5CF6' },
};

export function getStackItems(stackKeys: string[]): StackItem[] {
  return stackKeys.map((key) => stackConfig[key.toLowerCase()]).filter(Boolean);
}
