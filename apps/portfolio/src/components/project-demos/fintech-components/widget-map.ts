import type { ComponentType } from 'react';

import { Activity } from './widgets/Activity';
import { Activity1 } from './widgets/Activity1';
import { AiRecommendations } from './widgets/AiRecommendations';
import { Analytics } from './widgets/Analytics';
import { AverageExpenses } from './widgets/AverageExpenses';
import { Balance } from './widgets/Balance';
import { Balance2 } from './widgets/Balance2';
import { Balance3 } from './widgets/Balance3';
import { Breakdown } from './widgets/Breakdown';
import { CardFeatures } from './widgets/CardFeatures';
import { CardsOverview } from './widgets/CardsOverview';
import { Cashback } from './widgets/Cashback';
import { Checkout } from './widgets/Checkout';
import { ChoosePlan } from './widgets/ChoosePlan';
import { CreditCard } from './widgets/CreditCard';
import { CreditPaymentPlanner } from './widgets/CreditPaymentPlanner';
import { Discount } from './widgets/Discount';
import { ExchangeRates } from './widgets/ExchangeRates';
import { Expenses2 } from './widgets/Expenses2';
import { Expenses3 } from './widgets/Expenses3';
import { ExpensesBreakdown } from './widgets/ExpensesBreakdown';
import { ManageExpenses } from './widgets/ManageExpenses';
import { MicroInvestments } from './widgets/MicroInvestments';
import { MoneyEnvelope } from './widgets/MoneyEnvelope';
import { MoneyManager } from './widgets/MoneyManager';
import { MonthlySubscriptions } from './widgets/MonthlySubscriptions';
import { MostSpendings } from './widgets/MostSpendings';
import { MyCard } from './widgets/MyCard';
import { NotificationPreferences } from './widgets/NotificationPreferences';
import { OnlinePaymentConfirmation1 } from './widgets/OnlinePaymentConfirmation1';
import { OnlinePaymentConfirmation2 } from './widgets/OnlinePaymentConfirmation2';
import { Payment } from './widgets/Payment';
import { PaymentSummary } from './widgets/PaymentSummary';
import { Price } from './widgets/Price';
import { PricingOptions } from './widgets/PricingOptions';
import { QuickActions } from './widgets/QuickActions';
import { QuickTransfer } from './widgets/QuickTransfer';
import { Receipt } from './widgets/Receipt';
import { RecommendationsHowToEarnMore } from './widgets/RecommendationsHowToEarnMore';
import { SavedCards } from './widgets/SavedCards';
import { SavedMoney } from './widgets/SavedMoney';
import { SaveMoney } from './widgets/SaveMoney';
import { Savings } from './widgets/Savings';
import { Savings2 } from './widgets/Savings2';
import { Savings3 } from './widgets/Savings3';
import { Savings4 } from './widgets/Savings4';
import { SavingsGoals } from './widgets/SavingsGoals';
import { SetSpendingBudget } from './widgets/SetSpendingBudget';
import { Slippage } from './widgets/Slippage';
import { SpendingCategories } from './widgets/SpendingCategories';
import { Transactions } from './widgets/Transactions';
import { Transactions2 } from './widgets/Transactions2';
import { Transactions3 } from './widgets/Transactions3';
import { TransferMoney } from './widgets/TransferMoney';
import { TransferMoney2 } from './widgets/TransferMoney2';
import { VerificationSteps } from './widgets/VerificationSteps';
import { YourLimits } from './widgets/YourLimits';

/** Live component for each widget file listed in sections.ts */
export const widgetMap: Record<string, ComponentType> = {
  CreditCard,
  MyCard,
  CardsOverview,
  CardFeatures,
  SavedCards,
  QuickTransfer,
  TransferMoney,
  TransferMoney2,
  Receipt,
  Payment,
  Checkout,
  PaymentSummary,
  ExchangeRates,
  OnlinePaymentConfirmation1,
  OnlinePaymentConfirmation2,
  SetSpendingBudget,
  Transactions,
  Transactions2,
  Transactions3,
  Activity,
  Activity1,
  Expenses2,
  Expenses3,
  ExpensesBreakdown,
  ManageExpenses,
  MonthlySubscriptions,
  AverageExpenses,
  MostSpendings,
  YourLimits,
  Savings,
  Savings2,
  Savings3,
  Savings4,
  SavingsGoals,
  SavedMoney,
  SaveMoney,
  MoneyEnvelope,
  MoneyManager,
  Balance,
  Balance2,
  Balance3,
  Price,
  Breakdown,
  Slippage,
  MicroInvestments,
  PricingOptions,
  CreditPaymentPlanner,
  Analytics,
  AiRecommendations,
  RecommendationsHowToEarnMore,
  Cashback,
  Discount,
  NotificationPreferences,
  ChoosePlan,
  SpendingCategories,
  VerificationSteps,
  QuickActions,
};
