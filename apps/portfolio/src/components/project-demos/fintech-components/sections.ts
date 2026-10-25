export type FintechWidget = {
  /** File name in widgets/, also the exported component name */
  file: string;
  name: string;
  /** One line under the name in the gallery */
  description: string;
};

export type FintechSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  widgets: FintechWidget[];
};

export const fintechSections: FintechSection[] = [
  {
    id: 'cards-payments',
    eyebrow: 'Cards & payments',
    title: 'Ready-made card, transfer and payment flows',
    description:
      'Manage cards, send money and confirm payments with widgets that handle real interactions and loading states out of the box.',
    widgets: [
      {
        file: 'CreditCard',
        name: 'Credit Card',
        description: 'Flip, freeze and copy card details',
      },
      {
        file: 'MyCard',
        name: 'My Card',
        description: 'Card with a transaction list and quick toggle',
      },
      {
        file: 'CardsOverview',
        name: 'Cards',
        description: 'All cards with an activity summary',
      },
      {
        file: 'CardFeatures',
        name: 'Card Features',
        description: 'Card perks and settings in one place',
      },
      {
        file: 'SavedCards',
        name: 'Saved Cards',
        description: 'Pick from saved payment cards',
      },
      {
        file: 'QuickTransfer',
        name: 'Quick Transfer',
        description: 'Send money to a recent contact fast',
      },
      {
        file: 'TransferMoney',
        name: 'Transfer Money',
        description: 'Transfer with live currency conversion',
      },
      {
        file: 'TransferMoney2',
        name: 'Transfer Money 2',
        description: 'Card-to-card transfer with no commission',
      },
      {
        file: 'Receipt',
        name: 'Receipt',
        description: 'Transaction receipt with ID and status',
      },
      {
        file: 'Payment',
        name: 'Payment',
        description: 'Pay with a selected card',
      },
      {
        file: 'Checkout',
        name: 'Checkout',
        description: 'Choose a plan and card, then pay',
      },
      {
        file: 'PaymentSummary',
        name: 'Payment Summary',
        description: 'Successful payment, summed up',
      },
      {
        file: 'ExchangeRates',
        name: 'Exchange Rates',
        description: 'Buy and sell rates by currency',
      },
      {
        file: 'OnlinePaymentConfirmation1',
        name: 'Online Payment Confirmation 1',
        description: 'Approve an online payment request',
      },
      {
        file: 'OnlinePaymentConfirmation2',
        name: 'Online Payment Confirmation 2',
        description: 'Confirm a payment for an order',
      },
      {
        file: 'SetSpendingBudget',
        name: 'Set Spending Budget',
        description: 'Split a budget across categories',
      },
    ],
  },
  {
    id: 'transactions-activity',
    eyebrow: 'Transactions',
    title: 'Every transaction, in the right context',
    description:
      'Activity feeds and transaction lists with charts, filters and clear status, so people always know where their money went.',
    widgets: [
      {
        file: 'Transactions',
        name: 'Transactions',
        description: 'Recent transactions in a clean list',
      },
      {
        file: 'Transactions2',
        name: 'Transactions 2',
        description: 'Expenses and income with a bar chart',
      },
      {
        file: 'Transactions3',
        name: 'Transactions 3',
        description: 'Transaction details with reference ID',
      },
      {
        file: 'Activity',
        name: 'Activity',
        description: 'Weekly activity as a bar chart',
      },
      {
        file: 'Activity1',
        name: 'Activity 1',
        description: 'Activity trend as an area chart',
      },
    ],
  },
  {
    id: 'expenses-budgeting',
    eyebrow: 'Expenses',
    title: 'Spending you can actually understand',
    description:
      'Breakdowns, subscriptions and limits that turn raw spending into something people can act on.',
    widgets: [
      {
        file: 'Expenses2',
        name: 'Expenses 2',
        description: 'Expenses at a glance',
      },
      {
        file: 'Expenses3',
        name: 'Recent Expenses',
        description: 'Latest expenses with categories',
      },
      {
        file: 'ExpensesBreakdown',
        name: 'Expenses Breakdown',
        description: 'Spending split by period',
      },
      {
        file: 'ManageExpenses',
        name: 'Manage Expenses',
        description: 'Review and sort expenses',
      },
      {
        file: 'MonthlySubscriptions',
        name: 'Monthly Subscriptions',
        description: 'Active subscriptions you can switch off',
      },
      {
        file: 'AverageExpenses',
        name: 'Average Expenses',
        description: 'Average spend by period, in tabs',
      },
      {
        file: 'MostSpendings',
        name: 'Most Spendings',
        description: 'Where most of the money goes',
      },
      {
        file: 'YourLimits',
        name: 'Your Limits',
        description: 'Adjust spending limits with sliders',
      },
    ],
  },
  {
    id: 'savings-goals',
    eyebrow: 'Savings',
    title: 'Savings that stay on track',
    description:
      'Goal trackers, envelopes and saved balances that make progress visible and keep people motivated.',
    widgets: [
      {
        file: 'Savings',
        name: 'Savings Tracker',
        description: 'Track progress toward a savings goal',
      },
      { file: 'Savings2', name: 'Savings 2', description: 'Savings overview' },
      {
        file: 'Savings3',
        name: 'Savings 3',
        description: 'What is left to reach the goal',
      },
      {
        file: 'Savings4',
        name: 'Savings 4',
        description: 'Savings progress, step by step',
      },
      {
        file: 'SavingsGoals',
        name: 'Savings Goals',
        description: 'Set a goal amount with a slider',
      },
      {
        file: 'SavedMoney',
        name: 'Saved Money',
        description: 'Total saved so far',
      },
      {
        file: 'SaveMoney',
        name: 'Save Money',
        description: 'Pick a saving period and amount',
      },
      {
        file: 'MoneyEnvelope',
        name: 'Money Envelope',
        description: 'Budget envelope with currency and expiry',
      },
      {
        file: 'MoneyManager',
        name: 'Money Manager',
        description: 'All operations and quick transfers',
      },
    ],
  },
  {
    id: 'balance',
    eyebrow: 'Balances',
    title: 'Every account and currency at a glance',
    description:
      'Balance overviews that switch currencies, hide sensitive numbers and stay readable at any size.',
    widgets: [
      {
        file: 'Balance',
        name: 'Balance Overview',
        description: 'Balance with account number',
      },
      {
        file: 'Balance2',
        name: 'Balance Summary',
        description: 'Total balance, hide or show',
      },
      {
        file: 'Balance3',
        name: 'Balance 3',
        description: 'Balance with deposit and transfer actions',
      },
    ],
  },
  {
    id: 'investing-crypto',
    eyebrow: 'Investing',
    title: 'Portfolio and market tools',
    description:
      'Prices, portfolio breakdowns and planning tools for investing and crypto products.',
    widgets: [
      {
        file: 'Price',
        name: 'Crypto Prices',
        description: 'Crypto prices with a range chart',
      },
      {
        file: 'Breakdown',
        name: 'Portfolio Breakdown',
        description: 'Portfolio split as a donut chart',
      },
      {
        file: 'Slippage',
        name: 'Slippage Settings',
        description: 'Set slippage tolerance for a trade',
      },
      {
        file: 'MicroInvestments',
        name: 'Micro-Investments',
        description: 'Round-ups that invest spare change',
      },
      {
        file: 'PricingOptions',
        name: 'Pricing Options',
        description: 'Compare pricing tiers',
      },
      {
        file: 'CreditPaymentPlanner',
        name: 'Credit Payment Planner',
        description: 'Plan payments against a credit limit',
      },
    ],
  },
  {
    id: 'insights-offers',
    eyebrow: 'Insights',
    title: 'Insights that drive action',
    description:
      'Analytics, recommendations, cashback and discounts that surface the next best step.',
    widgets: [
      {
        file: 'Analytics',
        name: 'Analytics',
        description: 'Spending analytics by period',
      },
      {
        file: 'AiRecommendations',
        name: 'AI Recommendations',
        description: 'Smart tips based on spending',
      },
      {
        file: 'RecommendationsHowToEarnMore',
        name: 'How to Earn More',
        description: 'Ways to save and earn more',
      },
      {
        file: 'Cashback',
        name: 'Cashback',
        description: 'Cashback earned this month',
      },
      {
        file: 'Discount',
        name: 'Discount Offer',
        description: 'A discount offer, ready to claim',
      },
    ],
  },
  {
    id: 'design-system',
    eyebrow: 'Design system',
    title: 'One consistent set of primitives',
    description:
      'Checkboxes, radio cards, chips, steppers and action buttons from the Figma component library.',
    widgets: [
      {
        file: 'NotificationPreferences',
        name: 'Notification Preferences',
        description: 'Choose which alerts to get',
      },
      {
        file: 'ChoosePlan',
        name: 'Choose Plan',
        description: 'Radio cards for picking a plan',
      },
      {
        file: 'SpendingCategories',
        name: 'Spending Categories',
        description: 'Selectable category chips',
      },
      {
        file: 'VerificationSteps',
        name: 'Verification Steps',
        description: 'Step-by-step identity check',
      },
      {
        file: 'QuickActions',
        name: 'Quick Actions',
        description: 'Shortcut buttons for common tasks',
      },
    ],
  },
];

/** Widgets in the Figma widget set (FigmaBankingWidgets), shown as a final section */
export const FIGMA_WIDGET_COUNT = 40;

export const fintechWidgetCount =
  fintechSections.reduce((sum, section) => sum + section.widgets.length, 0) +
  FIGMA_WIDGET_COUNT;

export type FintechWidgetEntry = FintechWidget & {
  /** URL segment of the widget's own page */
  slug: string;
  section: Pick<FintechSection, 'id' | 'eyebrow' | 'description'>;
};

/** CreditCard -> credit-card, OnlinePaymentConfirmation1 -> online-payment-confirmation-1 */
function toSlug(file: string) {
  return file
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .replace(/([0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/** Every widget in gallery order, with its section and page slug */
export const fintechWidgets: FintechWidgetEntry[] = fintechSections.flatMap(
  ({ widgets, ...section }) =>
    widgets.map((widget) => ({
      ...widget,
      slug: toSlug(widget.file),
      section: {
        id: section.id,
        eyebrow: section.eyebrow,
        description: section.description,
      },
    })),
);

export function getFintechWidget(slug: string) {
  return fintechWidgets.find((widget) => widget.slug === slug);
}
