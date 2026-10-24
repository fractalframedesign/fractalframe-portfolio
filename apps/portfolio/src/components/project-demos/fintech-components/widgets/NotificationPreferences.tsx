'use client'

import { MoreHorizontal } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/project-demos/fintech-components/ui/button'
import { Checkbox } from '@/components/project-demos/fintech-components/ui/checkbox'
import { Skeleton } from '@/components/project-demos/fintech-components/ui/skeleton'
import { useWidgetLoading } from '@/components/project-demos/fintech-components/use-widget-loading'
import { cn } from '@/lib/utils'

export interface NotificationPreference {
  id: string
  label: string
  description: string
  checked: boolean
  disabled?: boolean
}

export interface NotificationPreferencesProps {
  className?: string
  loading?: boolean
  title?: string
  preferences?: NotificationPreference[]
}

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  { id: 'push', label: 'Push notifications', description: 'Get alerts for every transaction', checked: true },
  { id: 'email', label: 'Email summaries', description: 'Weekly digest of your spending', checked: true },
  { id: 'sms', label: 'SMS alerts', description: 'Only for balances under $100', checked: false },
  { id: 'promo', label: 'Promotions', description: 'Offers and product updates', checked: false, disabled: true },
]

function NotificationPreferencesSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6', className)}>
      <div className="flex w-full items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex flex-col gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-6 shrink-0 rounded-md" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function NotificationPreferences({
  className,
  loading: loadingProp,
  title = 'Notifications',
  preferences = DEFAULT_PREFERENCES,
}: NotificationPreferencesProps) {
  const { loading, refresh } = useWidgetLoading(loadingProp)
  const [items, setItems] = React.useState(preferences)

  if (loading) return <NotificationPreferencesSkeleton className={className} />

  function toggle(id: string) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)))
  }

  return (
    <div className={cn('flex max-w-[480px] flex-col gap-5 rounded-2xl border border-border bg-card shadow-sm p-6 text-card-foreground', className)}>
      <div className="flex w-full items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button variant="secondary" size="icon-sm" className="rounded-full" aria-label="Refresh preferences" onClick={refresh}>
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <label
            key={item.id}
            className={cn(
              'flex items-center gap-3 rounded-xl transition-colors',
              !item.disabled && 'cursor-pointer',
            )}
          >
            <Checkbox
              checked={item.checked}
              disabled={item.disabled}
              onCheckedChange={() => toggle(item.id)}
              aria-label={item.label}
            />
            <div className="flex flex-1 flex-col">
              <span className={cn('text-sm font-medium', item.disabled ? 'text-muted-foreground' : 'text-foreground')}>
                {item.label}
              </span>
              <span className="text-xs text-muted-foreground">{item.description}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

export default NotificationPreferences
