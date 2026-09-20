import { Split } from 'lucide-react'

import { Tile } from '@/components/ui/tile'

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
        <span className="text-xs font-semibold tracking-widest text-ink-muted">
          LATEST
          <br />
          TRANSACTION
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-violet">
          <Split className="h-4 w-4 rotate-90 text-white" />
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[10px] font-black text-black">
          {merchant.slice(0, 2)}
        </span>
        <div className="flex items-center">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-tile bg-orange-300 text-[9px]">
            🙂
          </span>
          <span className="-ml-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-tile bg-pink-300 text-[9px]">
            🙂
          </span>
          {extraPeople > 0 && (
            <span className="-ml-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-tile bg-white/20 text-[9px] font-semibold">
              +{extraPeople}
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-accent-violet">Splitted</span>
      </div>

      <div>
        <p className="text-xl font-semibold">{amount}</p>
        <p className="mt-1 text-xs tracking-wide text-ink-muted">{date}</p>
      </div>
    </Tile>
  )
}
