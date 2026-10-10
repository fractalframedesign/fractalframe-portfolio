import {
  fintechSections,
  fintechWidgetCount,
} from '@/components/project-demos/fintech-components/sections';

export type ShowcaseComponent = {
  name: string;
  file: string;
  description: string;
  /** The composed page/layout entry, not counted as a component */
  isLayout?: boolean;
};

export type ShowcaseProject = {
  slug: string;
  /** Value of data-project, matches the selector in the project's theme.css */
  scope: string;
  name: string;
  /** Short category line shown above the title, e.g. "Banking Widgets" */
  eyebrow: string;
  description: string;
  /** Tech shown as chips under the title */
  tags: string[];
  /** 'sections' = full-width alternating bands (children bring their own containers) */
  layout?: 'contained' | 'sections';
  /** Overrides the count of non-layout components shown in the header */
  componentCount?: number;
  components: ShowcaseComponent[];
};

const finance = (
  name: string,
  description: string,
  isLayout = false,
): ShowcaseComponent => ({
  name,
  file: `finance-dashboard/${name}`,
  description,
  isLayout,
});

const home = (
  name: string,
  description: string,
  isLayout = false,
): ShowcaseComponent => ({
  name,
  file: `smart-home-dashboard/${name}`,
  description,
  isLayout,
});

export const showcaseProjects: ShowcaseProject[] = [
  {
    slug: 'finance-dashboard',
    scope: 'finance',
    name: 'Finance Dashboard',
    eyebrow: 'Finance Widgets',
    tags: ['React', 'Tailwind CSS', 'shadcn/ui'],
    description:
      'Interactive bento-grid finance cards built on a shared tile shell.',
    components: [
      finance('FinanceDashboard', 'Composes every card into the responsive bento grid', true),
      finance('SavingsOverviewCard', 'Monthly save and spending with a weekday bar chart'),
      finance('ShoppingBudgetCard', 'Remaining shopping budget as a gauge'),
      finance('BudgetUsedCard', 'Saved today and percentage of budget used'),
      finance('SpendingBreakdownCard', 'Category split with an available balance'),
      finance('AddExpenseCard', 'Quick action tile to add an expense'),
      finance('RecentPurchasesCard', 'Today spending with recent merchants'),
      finance('WeeklySpendingCard', 'Weekly spending bars with the current day highlighted'),
      finance('LatestTransactionCard', 'Latest shared transaction with participants'),
      finance('SharePayCard', 'Payment card with a balance visibility toggle'),
      finance('EarningsRingCard', 'Earnings ring with a monthly and yearly toggle'),
      finance('YesterdayEarningCard', 'Yesterday earnings with a weekday sparkline'),
      finance('ScanReceiptCard', 'Quick action tile to scan a receipt'),
      finance('GroceriesSpendingCard', 'Groceries spending bars in the rose tone'),
      finance('SendReceiveCard', 'Send and receive quick actions'),
    ],
  },
  {
    slug: 'smart-home-dashboard',
    scope: 'smart-home',
    name: 'Smart Home Dashboard',
    eyebrow: 'Smart Home Widgets',
    tags: ['React', 'Tailwind CSS', 'shadcn/ui'],
    description:
      'Climate dial, scenes, power analytics and camera tiles for a connected home.',
    components: [
      home('SmartHomeDashboard', 'Composes the components into the two-column layout', true),
      home('GreetingHeader', 'Avatar and greeting pill with a profile menu'),
      home('PowerAnalyticsCard', 'Expandable device usage list with animated bars'),
      home('ClimateControl', 'Draggable, keyboard-accessible temperature dial'),
      home('ScenesPanel', 'Selectable scene tiles with a create scene row'),
      home('SecurityCamerasCard', 'Camera tiles with live, offline and mute states'),
      home('ThemeToggle', 'Light and dark switch wired to the site theme'),
    ],
  },
  {
    slug: 'fintech-components',
    scope: 'fintech',
    name: 'Fintech Components',
    eyebrow: 'Banking Widgets',
    description:
      'Interactive fintech dashboard widgets — light & dark, skeleton loading, and real interactions.',
    tags: ['React', 'Tailwind CSS', 'shadcn/ui', 'Recharts'],
    layout: 'sections',
    componentCount: fintechWidgetCount,
    components: [
      ...fintechSections.flatMap((section) =>
        section.widgets.map((widget) => ({
          name: widget.name,
          file: `fintech-components/widgets/${widget.file}`,
          description: section.eyebrow,
        })),
      ),
      {
        name: 'FigmaBankingWidgets',
        file: 'fintech-components/widgets/FigmaBankingWidgets',
        description: 'The Figma widget set, adapted to the theme tokens',
      },
    ],
  },
];

export function getShowcaseProject(slug: string) {
  return showcaseProjects.find((project) => project.slug === slug);
}

export function getComponentCount(project: ShowcaseProject) {
  return (
    project.componentCount ??
    project.components.filter((component) => !component.isLayout).length
  );
}
