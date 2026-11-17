import type { AudienceCard } from '@kiran/playground/audience-expand-cards';

/**
 * What the /playground page shows. The experiments themselves live in
 * packages/playground; the words, pictures and project picks stay here
 * because they belong to this site.
 */

// TODO(Kiran): replace these sample cards with your own words and links
/** Cards in the Playground expand image cards */
export const PLAYGROUND_AUDIENCES: AudienceCard[] = [
  {
    number: '01',
    label: 'FOR CREATORS',
    title: 'Portfolios.',
    description: 'Give your best work the space it deserves.',
    detail: 'A personal website, completely your own.',
    cta: 'Create Your Site',
    image: '/images/about/coding.webp',
    alt: 'A creator working on a laptop',
    href: 'https://www.framer.com/',
    position: 'center 44%',
  },
  {
    number: '02',
    label: 'FOR STUDIOS',
    title: 'Studios.',
    description: 'Show what makes your practice different with a portfolio as thoughtful as your projects.',
    detail: '',
    cta: 'Get Started',
    image: '/images/home/hero-previews/sonic.webp',
    alt: 'A visual project from a creative studio',
    href: 'https://www.framer.com/',
    position: 'center',
  },
  {
    number: '03',
    label: 'FOR BUSINESSES',
    title: 'Businesses.',
    description: 'Build a confident digital home for your next big idea, from first impression to launch.',
    detail: '',
    cta: 'Create Your Site',
    image: '/images/home/hero-previews/fintech.webp',
    alt: 'A business product interface',
    href: 'https://www.framer.com/',
    position: 'center',
  },
];

/** Pictures in the Playground tunnel gallery */
export const PLAYGROUND_TUNNEL_ITEMS = [
  {
    title: 'Fintech components',
    image: '/images/projects/fintech-components/cover.png',
  },
  { title: 'Charter', image: '/images/home/hero-previews/charter.webp' },
  {
    title: 'Finance dashboard',
    image: '/images/projects/finance-dashboard/cover.png',
  },
  { title: 'Sonic', image: '/images/home/hero-previews/sonic.webp' },
  {
    title: 'Smart home dashboard',
    image: '/images/projects/smart-home-dashboard/cover.png',
  },
  { title: 'Stellar', image: '/images/home/hero-previews/stellar.webp' },
  { title: 'Rakuten Link', image: '/images/projects/rakuten-link/cover.png' },
  { title: 'Streamline', image: '/images/home/hero-previews/streamline.webp' },
  { title: 'Nature', image: '/images/home/hero-previews/nature.webp' },
];

/** Projects on the Playground depth carousel, in order (name and summary come from the project) */
export const PLAYGROUND_CAROUSEL_SLUGS = [
  'fintech-components',
  'finance-dashboard',
  'smart-home-dashboard',
  'rakuten-link',
] as const;

// TODO(Kiran): replace these sample cards with real work, or delete them
/** Extra cards after the projects, so the carousel has enough depth */
export const PLAYGROUND_CAROUSEL_EXTRAS = [
  {
    title: 'Motion study',
    description: 'Sample card. Swap in a title, a line about it and a picture.',
    image: '/images/home/hero-previews/sonic.webp',
  },
  {
    title: 'Colour study',
    description: 'Sample card. Swap in a title, a line about it and a picture.',
    image: '/images/home/hero-previews/stellar.webp',
  },
  {
    title: 'Texture study',
    description: 'Sample card. Swap in a title, a line about it and a picture.',
    image: '/images/home/hero-previews/nature.webp',
  },
];

/** Words in the Playground tag pile */
export const PLAYGROUND_TAGS = [
  'Strategy',
  'Interfaces',
  'Motion',
  'Typography',
  'Research',
  'Prototyping',
  'Design systems',
  'Frontend',
  'Accessibility',
  'Leadership',
  'Workshops',
  'Tokens',
  'React',
  'Figma',
  'Iteration',
  'Ship it',
] as const;

// TODO(Kiran): rewrite these steps in your own words
/** How I work, shown in the Playground follow accordion */
export const PLAYGROUND_PROCESS = [
  {
    title: 'Listen first',
    description:
      'Before any screens, I sit with the people who will use the product and the team who will build it, until the real problem is clear.',
    image: {
      src: '/images/projects/rakuten-link/cover.png',
      alt: 'Rakuten Link calling and messaging screens',
    },
  },
  {
    title: 'Map the flow',
    description:
      'I sketch the whole journey end to end, so every screen has a reason to exist and nothing important falls between two of them.',
    image: {
      src: '/images/projects/finance-dashboard/cover.png',
      alt: 'Finance dashboard made of bento-grid cards',
    },
  },
  {
    title: 'Design the system',
    description:
      'Tokens and components come early, so the tenth screen is as consistent as the first and engineers can build with confidence.',
    image: {
      src: '/images/projects/fintech-components/cover.png',
      alt: 'A set of fintech interface components',
    },
    link: { label: 'See the components', href: '/showcase/fintech-components' },
  },
  {
    title: 'Build it for real',
    description:
      'I take the design into code myself, so motion, edge cases and accessibility survive all the way to production.',
    image: {
      src: '/images/projects/smart-home-dashboard/cover.png',
      alt: 'Smart home dashboard controls',
    },
    link: {
      label: 'Try the dashboard',
      href: '/showcase/smart-home-dashboard',
    },
  },
  {
    title: 'Ship and learn',
    description:
      'After launch I watch how people actually use it, then fold what we learn into the next round instead of guessing.',
    image: {
      src: '/images/home/hero-previews/streamline.webp',
      alt: 'A product preview',
    },
  },
];
