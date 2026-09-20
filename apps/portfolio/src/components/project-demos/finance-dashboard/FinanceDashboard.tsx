import { AddExpenseCard } from '@/components/project-demos/finance-dashboard/AddExpenseCard'
import { BudgetUsedCard } from '@/components/project-demos/finance-dashboard/BudgetUsedCard'
import { EarningsRingCard } from '@/components/project-demos/finance-dashboard/EarningsRingCard'
import { GroceriesSpendingCard } from '@/components/project-demos/finance-dashboard/GroceriesSpendingCard'
import { LatestTransactionCard } from '@/components/project-demos/finance-dashboard/LatestTransactionCard'
import { RecentPurchasesCard } from '@/components/project-demos/finance-dashboard/RecentPurchasesCard'
import { SavingsOverviewCard } from '@/components/project-demos/finance-dashboard/SavingsOverviewCard'
import { ScanReceiptCard } from '@/components/project-demos/finance-dashboard/ScanReceiptCard'
import { SendReceiveCard } from '@/components/project-demos/finance-dashboard/SendReceiveCard'
import { SharePayCard } from '@/components/project-demos/finance-dashboard/SharePayCard'
import { ShoppingBudgetCard } from '@/components/project-demos/finance-dashboard/ShoppingBudgetCard'
import { SpendingBreakdownCard } from '@/components/project-demos/finance-dashboard/SpendingBreakdownCard'
import { WeeklySpendingCard } from '@/components/project-demos/finance-dashboard/WeeklySpendingCard'
import { YesterdayEarningCard } from '@/components/project-demos/finance-dashboard/YesterdayEarningCard'

export function FinanceDashboard() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 bg-canvas p-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2">
        <SavingsOverviewCard />
      </div>
      <ShoppingBudgetCard />
      <BudgetUsedCard />

      <SpendingBreakdownCard />
      <AddExpenseCard />
      <RecentPurchasesCard />
      <WeeklySpendingCard />

      <LatestTransactionCard />
      <SharePayCard />
      <div className="sm:col-span-2">
        <EarningsRingCard />
      </div>

      <YesterdayEarningCard />
      <ScanReceiptCard />
      <GroceriesSpendingCard />
      <SendReceiveCard />
    </div>
  )
}
