import { Tile } from '@/components/project-demos/finance-dashboard/ui/tile'

type Purchase = { name: string; amount: string; tone: string; initial: string }

type RecentPurchasesCardProps = {
  total?: string
  purchases?: Purchase[]
}

const defaultPurchases: Purchase[] = [
  { name: 'Dior', amount: 'AED 17,800.00', tone: 'bg-black text-foreground', initial: 'D' },
  { name: 'Starbucks', amount: 'AED 17.00', tone: 'bg-[#00704A] text-foreground', initial: 'S' },
]

export function RecentPurchasesCard({
  total = 'AED 21,380',
  purchases = defaultPurchases,
}: RecentPurchasesCardProps) {
  return (
    <Tile className="justify-between gap-4">
      <div>
        <p className="text-2xl font-semibold">{total}</p>
        <p className="mt-1 text-xs tracking-wide text-muted-foreground">TODAY SPENDING</p>
      </div>

      <div className="flex flex-col gap-3">
        {purchases.map((purchase) => (
          <button
            key={purchase.name}
            type="button"
            className="flex items-center gap-3 rounded-xl px-2 py-1 text-left transition-colors hover:bg-foreground/5"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${purchase.tone}`}
            >
              {purchase.initial}
            </span>
            <span className="flex-1">
              <p className="text-sm font-medium">{purchase.name}</p>
              <p className="text-xs text-muted-foreground">{purchase.amount}</p>
            </span>
          </button>
        ))}
      </div>
    </Tile>
  )
}
