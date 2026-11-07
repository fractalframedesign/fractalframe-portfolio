export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/work', label: 'Work' },
  { href: '/contact', label: 'Contact' },
];

export const SOCIAL_LINKS = [
  {
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: 'X',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: 'in',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: 'IG',
  },
];

export const CONTACT_EMAIL = 'kiranspingle@gmail.com';

export const LOCATION = {
  label: 'Tokyo, Japan',
  timeZone: 'Asia/Tokyo',
};

/** Showcase projects on the home page Highlights row, in order */
export const HIGHLIGHT_PROJECT_SLUGS = [
  'fintech-components',
  'finance-dashboard',
  'smart-home-dashboard',
] as const;

/** Articles in the home page Writing list, in order */
export const HOME_ARTICLE_SLUGS = [
  'design-to-motivate',
  'stop-bringing-more-options-to-the-meeting',
  'nature-shipped-it-first',
  'stop-making-users-read-your-dashboard',
  'proactive-ux',
] as const;
