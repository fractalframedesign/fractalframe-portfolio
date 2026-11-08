import { Split } from 'lucide-react'

import { Tile } from '@/components/project-demos/finance-dashboard/ui/tile'

type LatestTransactionCardProps = {
  merchant?: string
  amount?: string
  date?: string
  extraPeople?: number
}

export function LatestTransactionCard({
  merchant = '88 TERRACE',
  amount = 'AED 562.40',
  date = '12 DEC 2023, 9:00 AM',
  extraPeople = 1,
}: LatestTransactionCardProps) {
  return (
    <Tile className="justify-between gap-4">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground">
          LATEST
          <br />
          TRANSACTION
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Split className="h-4 w-4 rotate-90 text-foreground" />
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-xs font-black text-background">
          {merchant.slice(0, 2)}
        </span>
        <div className="flex items-center">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-orange-300 text-xs">
            🙂
          </span>
          <span className="-ml-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-pink-300 text-xs">
            🙂
          </span>
          {extraPeople > 0 && (
            <span className="-ml-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-foreground/20 text-xs font-semibold">
              +{extraPeople}
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-primary">Splitted</span>
      </div>

      <div>
        <p className="text-xl font-semibold">{amount}</p>
        <p className="mt-1 text-xs tracking-wide text-muted-foreground">{date}</p>
      </div>
    </Tile>
  )
}
