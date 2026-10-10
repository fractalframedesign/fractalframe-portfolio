'use client'

import { ChevronDown, MoreHorizontal } from 'lucide-react'
import * as React from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/project-demos/fintech-components/ui/tabs'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

const bitcoinIcon = '/images/projects/fintech-components/price/bitcoin.svg'
const ethereumIcon = '/images/projects/fintech-components/price/ethereum.svg'
const litecoinIcon = '/images/projects/fintech-components/price/litecoin.svg'
const xrpIcon = '/images/projects/fintech-components/price/xrp.svg'

export interface PriceAsset {
  id: string
  symbol: string
  changePercent: number
  price: string
  holdings: string
  iconBg: string
  icon: string
  chartColor: string
  series: number[]
  dayHigh: string
  dayLow: string
}

export interface PriceProps {
  className?: string
  loading?: boolean
  title?: string
  assets?: PriceAsset[]
}

const defaultAssets: PriceAsset[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    changePercent: 1.6,
    price: '$29,850.15',
    holdings: '2.73 BTC',
    iconBg: 'bg-destructive/10',
    icon: bitcoinIcon,
    chartColor: 'var(--color-chart-5)',
    series: [4, 6, 5, 7, 9, 8, 11, 10, 13, 15, 14, 17],
    dayHigh: '$30,120.40',
    dayLow: '$29,340.02',
  },
  {
    id: 'eth',
    symbol: 'ETH',
    changePercent: 0.8,
    price: '$10,651.24',
    holdings: '47.64 ETH',
    iconBg: 'bg-accent',
    icon: ethereumIcon,
    chartColor: 'var(--color-chart-1)',
    series: [8, 7, 9, 8, 10, 9, 12, 11, 10, 12, 13, 12],
    dayHigh: '$10,780.10',
    dayLow: '$10,502.55',
  },
  {
    id: 'ltc',
    symbol: 'LTC',
    changePercent: 0.4,
    price: '$3,724.76',
    holdings: '39.27 LTC',
    iconBg: 'bg-success/10',
    icon: litecoinIcon,
    chartColor: 'var(--color-chart-2)',
    series: [6, 6, 7, 6, 8, 9, 8, 10, 9, 11, 10, 11],
    dayHigh: '$3,780.90',
    dayLow: '$3,690.11',
  },
  {
    id: 'xrp',
    symbol: 'XRP',
    changePercent: 0.1,
    price: '$5,241.62',
    holdings: '1,442.62 XRP',
    iconBg: 'bg-accent',
    icon: xrpIcon,
    chartColor: 'var(--color-chart-4)',
    series: [9, 10, 8, 9, 7, 8, 9, 8, 10, 9, 9, 9],
    dayHigh: '$5,290.00',
    dayLow: '$5,190.34',
  },
]

type SortMode = 'value' | 'change'

export function Price({ className, loading: forcedLoading, title = 'Price', assets = defaultAssets }: PriceProps) {
  const { loading, refresh } = useWidgetLoading(forcedLoading)
  const [sortMode, setSortMode] = React.useState<SortMode>('value')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const sorted = React.useMemo(() => {
    const copy = [...assets]
    if (sortMode === 'change') {
      copy.sort((a, b) => b.changePercent - a.changePercent)
    } else {
      copy.sort((a, b) => parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, '')))
    }
    return copy
  }, [assets, sortMode])

  if (loading) {
    return (
 <div className={cn('flex max-w-[480px] flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="size-9 rounded-full" />
        </div>
        <div className="flex w-full flex-col gap-1">
          {assets.map((a) => (
            <div key={a.id} className="flex w-full items-center justify-between py-2.5">
              <div className="flex flex-1 items-center gap-4">
                <Skeleton className="size-[58px] shrink-0 rounded-xl" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </div>
              <Skeleton className="h-9 w-[84px] rounded-md" />
              <div className="flex flex-1 flex-col items-end gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
 'flex max-w-[480px] flex-col gap-4 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-base uppercase tracking-[0.24px] text-muted-foreground">{title}</p>
        <div className="flex items-center gap-2">
          <Tabs value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
            <TabsList>
              <TabsTrigger value="value">Value</TabsTrigger>
              <TabsTrigger value="change">Change</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="secondary" size="icon" className="rounded-full" aria-label="Refresh prices" onClick={refresh}>
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex w-full flex-col">
        {sorted.map((asset) => {
          const expanded = expandedId === asset.id
          const positive = asset.changePercent >= 0
          return (
            <div key={asset.id} className="w-full border-b border-border/60 last:border-b-0">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : asset.id)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-4 rounded-lg py-2.5 text-left outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-1 items-center gap-4">
                  <div className={cn('flex size-[58px] shrink-0 items-center justify-center rounded-xl', asset.iconBg)}>
                    <img src={asset.icon} alt="" className="size-6" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-lg font-semibold leading-[1.4] text-foreground">{asset.symbol}</p>
                    <p className={cn('text-sm font-medium tracking-[0.14px]', positive ? 'text-success' : 'text-destructive')}>
                      {positive ? '+' : ''}
                      {asset.changePercent}%
                    </p>
                  </div>
                </div>
                <div className="h-9 w-[84px] flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={asset.series.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
                      <defs>
                        <linearGradient id={`price-grad-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={asset.chartColor} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={asset.chartColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={asset.chartColor}
                        strokeWidth={2}
                        fill={`url(#price-grad-${asset.id})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-1 items-center justify-end gap-3">
                  <div className="flex flex-col items-end gap-0.5 text-right">
                    <p className="text-lg font-semibold leading-[1.4] text-foreground">{asset.price}</p>
                    <p className="text-sm font-medium tracking-[0.14px] text-muted-foreground">{asset.holdings}</p>
                  </div>
                  <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
                </div>
              </button>
              {expanded && (
                <div className="flex w-full items-center justify-between gap-4 pb-3 pl-[74px] text-sm text-muted-foreground">
                  <span>
                    24h high <span className="font-medium text-foreground">{asset.dayHigh}</span>
                  </span>
                  <span>
                    24h low <span className="font-medium text-foreground">{asset.dayLow}</span>
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Price

/**
 * Tailwind v4 theme variables this component relies on.
 * Copy into your project's global stylesheet (e.g. styles.css) alongside `@import 'tailwindcss';`.
 * Requires `@custom-variant dark (&:where(.dark, .dark *));` for the .dark overrides to apply.
 *
 * :root {
 *   --radius: 0.75rem;
 * 
 *   --background: oklch(0.99 0.002 260);
 *   --foreground: oklch(0.19 0.015 260);
 * 
 *   --card: oklch(1 0 0);
 *   --card-foreground: oklch(0.19 0.015 260);
 * 
 *   --popover: oklch(1 0 0);
 *   --popover-foreground: oklch(0.19 0.015 260);
 * 
 *   --primary: oklch(0.5 0.19 264);
 *   --primary-foreground: oklch(0.99 0.005 260);
 * 
 *   --secondary: oklch(0.955 0.008 260);
 *   --secondary-foreground: oklch(0.28 0.02 260);
 * 
 *   --muted: oklch(0.955 0.008 260);
 *   --muted-foreground: oklch(0.5 0.02 260);
 * 
 *   --accent: oklch(0.94 0.03 264);
 *   --accent-foreground: oklch(0.32 0.08 264);
 * 
 *   --destructive: oklch(0.58 0.22 25);
 *   --destructive-foreground: oklch(0.99 0.005 260);
 * 
 *   --success: oklch(0.6 0.135 155);
 *   --success-foreground: oklch(0.99 0.005 260);
 * 
 *   --warning: oklch(0.77 0.16 75);
 *   --warning-foreground: oklch(0.25 0.05 75);
 * 
 *   --border: oklch(0.9 0.008 260);
 *   --input: oklch(0.9 0.008 260);
 *   --ring: oklch(0.5 0.19 264 / 45%);
 * 
 *   --chart-1: oklch(0.5 0.19 264);
 *   --chart-2: oklch(0.6 0.135 155);
 *   --chart-3: oklch(0.77 0.16 75);
 *   --chart-4: oklch(0.62 0.2 320);
 *   --chart-5: oklch(0.65 0.19 25);
 * }
 *
 * .dark {
 *   --background: oklch(0.17 0.014 260);
 *   --foreground: oklch(0.95 0.006 260);
 * 
 *   --card: oklch(0.21 0.015 260);
 *   --card-foreground: oklch(0.95 0.006 260);
 * 
 *   --popover: oklch(0.21 0.015 260);
 *   --popover-foreground: oklch(0.95 0.006 260);
 * 
 *   --primary: oklch(0.68 0.16 264);
 *   --primary-foreground: oklch(0.15 0.02 264);
 * 
 *   --secondary: oklch(0.27 0.015 260);
 *   --secondary-foreground: oklch(0.92 0.006 260);
 * 
 *   --muted: oklch(0.27 0.015 260);
 *   --muted-foreground: oklch(0.68 0.015 260);
 * 
 *   --accent: oklch(0.3 0.05 264);
 *   --accent-foreground: oklch(0.88 0.03 264);
 * 
 *   --destructive: oklch(0.65 0.2 25);
 *   --destructive-foreground: oklch(0.15 0.02 25);
 * 
 *   --success: oklch(0.68 0.14 155);
 *   --success-foreground: oklch(0.15 0.03 155);
 * 
 *   --warning: oklch(0.78 0.15 75);
 *   --warning-foreground: oklch(0.2 0.04 75);
 * 
 *   --border: oklch(1 0 0 / 10%);
 *   --input: oklch(1 0 0 / 15%);
 *   --ring: oklch(0.68 0.16 264 / 45%);
 * 
 *   --chart-1: oklch(0.68 0.16 264);
 *   --chart-2: oklch(0.68 0.14 155);
 *   --chart-3: oklch(0.78 0.15 75);
 *   --chart-4: oklch(0.7 0.18 320);
 *   --chart-5: oklch(0.7 0.17 25);
 * }
 */
