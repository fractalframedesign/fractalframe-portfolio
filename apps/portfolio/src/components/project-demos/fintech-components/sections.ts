export type FintechWidget = {
  /** File name in widgets/, also the exported component name */
  file: string;
  name: string;
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
      { file: 'CreditCard', name: 'Credit Card' },
      { file: 'MyCard', name: 'My Card' },
      { file: 'CardsOverview', name: 'Cards' },
      { file: 'CardFeatures', name: 'Card Features' },
      { file: 'SavedCards', name: 'Saved Cards' },
      { file: 'QuickTransfer', name: 'Quick Transfer' },
      { file: 'TransferMoney', name: 'Transfer Money' },
      { file: 'TransferMoney2', name: 'Transfer Money 2' },
      { file: 'Receipt', name: 'Receipt' },
      { file: 'Payment', name: 'Payment' },
      { file: 'Checkout', name: 'Checkout' },
      { file: 'PaymentSummary', name: 'Payment Summary' },
      { file: 'ExchangeRates', name: 'Exchange Rates' },
      { file: 'OnlinePaymentConfirmation1', name: 'Online Payment Confirmation 1' },
      { file: 'OnlinePaymentConfirmation2', name: 'Online Payment Confirmation 2' },
      { file: 'SetSpendingBudget', name: 'Set Spending Budget' },
    ],
  },
  {
    id: 'transactions-activity',
    eyebrow: 'Transactions',
    title: 'Every transaction, in the right context',
    description:
      'Activity feeds and transaction lists with charts, filters and clear status, so people always know where their money went.',
    widgets: [
      { file: 'Transactions', name: 'Transactions' },
      { file: 'Transactions2', name: 'Transactions 2' },
      { file: 'Transactions3', name: 'Transactions 3' },
      { file: 'Activity', name: 'Activity' },
      { file: 'Activity1', name: 'Activity 1' },
    ],
  },
  {
    id: 'expenses-budgeting',
    eyebrow: 'Expenses',
    title: 'Spending you can actually understand',
    description:
      'Breakdowns, subscriptions and limits that turn raw spending into something people can act on.',
    widgets: [
      { file: 'Expenses2', name: 'Expenses 2' },
      { file: 'Expenses3', name: 'Recent Expenses' },
      { file: 'ExpensesBreakdown', name: 'Expenses Breakdown' },
      { file: 'ManageExpenses', name: 'Manage Expenses' },
      { file: 'MonthlySubscriptions', name: 'Monthly Subscriptions' },
      { file: 'AverageExpenses', name: 'Average Expenses' },
      { file: 'MostSpendings', name: 'Most Spendings' },
      { file: 'YourLimits', name: 'Your Limits' },
    ],
  },
  {
    id: 'savings-goals',
    eyebrow: 'Savings',
    title: 'Savings that stay on track',
    description:
      'Goal trackers, envelopes and saved balances that make progress visible and keep people motivated.',
    widgets: [
      { file: 'Savings', name: 'Savings Tracker' },
      { file: 'Savings2', name: 'Savings 2' },
      { file: 'Savings3', name: 'Savings 3' },
      { file: 'Savings4', name: 'Savings 4' },
      { file: 'SavingsGoals', name: 'Savings Goals' },
      { file: 'SavedMoney', name: 'Saved Money' },
      { file: 'SaveMoney', name: 'Save Money' },
      { file: 'MoneyEnvelope', name: 'Money Envelope' },
      { file: 'MoneyManager', name: 'Money Manager' },
    ],
  },
  {
    id: 'balance',
    eyebrow: 'Balances',
    title: 'Every account and currency at a glance',
    description:
      'Balance overviews that switch currencies, hide sensitive numbers and stay readable at any size.',
    widgets: [
      { file: 'Balance', name: 'Balance Overview' },
      { file: 'Balance2', name: 'Balance Summary' },
      { file: 'Balance3', name: 'Balance 3' },
    ],
  },
  {
    id: 'investing-crypto',
    eyebrow: 'Investing',
    title: 'Portfolio and market tools',
    description:
      'Prices, portfolio breakdowns and planning tools for investing and crypto products.',
    widgets: [
      { file: 'Price', name: 'Crypto Prices' },
      { file: 'Breakdown', name: 'Portfolio Breakdown' },
      { file: 'Slippage', name: 'Slippage Settings' },
      { file: 'MicroInvestments', name: 'Micro-Investments' },
      { file: 'PricingOptions', name: 'Pricing Options' },
      { file: 'CreditPaymentPlanner', name: 'Credit Payment Planner' },
    ],
  },
  {
    id: 'insights-offers',
    eyebrow: 'Insights',
    title: 'Insights that drive action',
    description:
      'Analytics, recommendations, cashback and discounts that surface the next best step.',
    widgets: [
      { file: 'Analytics', name: 'Analytics' },
      { file: 'AiRecommendations', name: 'AI Recommendations' },
      { file: 'RecommendationsHowToEarnMore', name: 'How to Earn More' },
      { file: 'Cashback', name: 'Cashback' },
      { file: 'Discount', name: 'Discount Offer' },
    ],
  },
  {
    id: 'design-system',
    eyebrow: 'Design system',
    title: 'One consistent set of primitives',
    description:
      'Checkboxes, radio cards, chips, steppers and action buttons from the Figma component library.',
    widgets: [
      { file: 'NotificationPreferences', name: 'Notification Preferences' },
      { file: 'ChoosePlan', name: 'Choose Plan' },
      { file: 'SpendingCategories', name: 'Spending Categories' },
      { file: 'VerificationSteps', name: 'Verification Steps' },
      { file: 'QuickActions', name: 'Quick Actions' },
    ],
  },
];

/** Widgets in the Figma widget set (FigmaBankingWidgets), shown as a final section */
export const FIGMA_WIDGET_COUNT = 40;

export const fintechWidgetCount =
  fintechSections.reduce((sum, section) => sum + section.widgets.length, 0) +
  FIGMA_WIDGET_COUNT;
