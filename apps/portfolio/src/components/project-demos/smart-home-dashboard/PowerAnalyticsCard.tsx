'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

interface DeviceUsage {
  id: string
  name: string
  units: number
  kWh: number
  icon: 'ac' | 'router' | 'tv' | 'humidifier'
}

interface PowerAnalyticsCardProps {
  title?: string
  subtitle?: string
  devices?: DeviceUsage[]
  showUsageBars?: boolean
  className?: string
}

const DEFAULT_DEVICES: DeviceUsage[] = [
  { id: 'ac', name: 'Air Conditioner', units: 2, kWh: 18, icon: 'ac' },
  { id: 'router', name: 'Wi-Fi Router', units: 1, kWh: 8, icon: 'router' },
  { id: 'tv', name: 'Smart TV', units: 2, kWh: 12, icon: 'tv' },
  { id: 'humidifier', name: 'Humidifier', units: 1, kWh: 2, icon: 'humidifier' },
]

function DeviceIcon({ icon }: { icon: DeviceUsage['icon'] }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' } as const
  switch (icon) {
    case 'ac':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7 15v2M12 15v3M17 15v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    case 'router':
      return (
        <svg {...common}>
          <rect x="3" y="10" width="18" height="7" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="8" cy="13.5" r="1" fill="currentColor" />
          <circle cx="12" cy="13.5" r="1" fill="currentColor" />
        </svg>
      )
    case 'tv':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 20h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    case 'humidifier':
      return (
        <svg {...common}>
          <path
            d="M12 3c2.2 3 4.5 6.1 4.5 9a4.5 4.5 0 1 1-9 0c0-2.9 2.3-6 4.5-9Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      )
  }
}

export function PowerAnalyticsCard({
  title = 'AI Power Analytics',
  subtitle = 'Daily usage',
  devices = DEFAULT_DEVICES,
  showUsageBars = true,
  className = '',
}: PowerAnalyticsCardProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const maxKWh = Math.max(...devices.map((d) => d.kWh), 1)

  return (
    <div
      className={`mx-auto flex w-full min-w-[280px] max-w-[580px] flex-col rounded-[28px] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.03] dark:bg-[#17181c] dark:ring-white/[0.06] ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-ink/5 dark:bg-white/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-ink dark:text-white">{title}</p>
            <p className="text-sm text-ink/45 dark:text-white/40">{subtitle}</p>
          </div>
        </div>

        <motion.button
          type="button"
          aria-label="Open full analytics"
          whileHover={{ scale: 1.08, rotate: 6 }}
          whileTap={{ scale: 0.9 }}
          className="flex size-10 items-center justify-center rounded-full bg-ink text-white outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 dark:bg-white dark:text-ink dark:focus-visible:ring-white dark:focus-visible:ring-offset-[#17181c]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-3">
        {devices.map((device, index) => {
          const isOpen = openId === device.id
          const barPct = Math.round((device.kWh / maxKWh) * 100)
          return (
            <motion.button
              key={device.id}
              type="button"
              onClick={() => setOpenId(isOpen ? null : device.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, type: 'spring', duration: 0.5, bounce: 0.25 }}
              whileTap={{ scale: 0.99 }}
              aria-expanded={isOpen}
              className="group w-full rounded-2xl bg-black/[0.035] px-4 py-3.5 text-left transition-colors hover:bg-black/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:focus-visible:ring-white/30"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm dark:bg-white/10 dark:text-white">
                  <DeviceIcon icon={device.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink dark:text-white">{device.name}</p>
                  <p className="text-sm text-ink/40 tabular-nums dark:text-white/40">
                    {device.units} unit &nbsp;|&nbsp; {device.kWh}kWh
                  </p>
                </div>
                <motion.svg
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ type: 'spring', duration: 0.35, bounce: 0.3 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-ink/30 group-hover:text-ink/60 dark:text-white/30 dark:group-hover:text-white/60"
                >
                  <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </div>

              {showUsageBars ? (
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{ delay: 0.15 + 0.05 * index, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-(--color-accent-1) to-(--color-accent-4)"
                  />
                </div>
              ) : null}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default PowerAnalyticsCard
