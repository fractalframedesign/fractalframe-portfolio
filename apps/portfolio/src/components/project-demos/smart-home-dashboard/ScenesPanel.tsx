'use client'

import { motion } from 'motion/react'
import { useState } from 'react'


interface Scene {
  id: string
  name: string
  deviceCount: number
  icon: 'sun' | 'moon'
}

interface ScenesPanelProps {
  scenes?: Scene[]
  defaultActiveId?: string
  scenesCreated?: number
  devicesInUse?: number
  showCreateRow?: boolean
  className?: string
}

const DEFAULT_SCENES: Scene[] = [
  { id: 'morning', name: 'Morning Scene', deviceCount: 7, icon: 'sun' },
  { id: 'night', name: 'Night Scene', deviceCount: 2, icon: 'moon' },
]

function SceneIcon({ icon }: { icon: Scene['icon'] }) {
  if (icon === 'sun') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ScenesPanel({
  scenes = DEFAULT_SCENES,
  defaultActiveId = 'morning',
  scenesCreated = 8,
  devicesInUse = 24,
  showCreateRow = true,
  className = '',
}: ScenesPanelProps) {
  const [activeId, setActiveId] = useState(defaultActiveId)

  return (
    <div
      className={`mx-auto flex w-full min-w-70 max-w-145 flex-col gap-4 rounded-[1.75rem] bg-muted p-5 ${className}`}
    >
      <div className="grid grid-cols-2 gap-4">
        {scenes.map((scene, index) => {
          const active = scene.id === activeId
          return (
            <motion.button
              key={scene.id}
              type="button"
              onClick={() => setActiveId(scene.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                backgroundColor: active ? 'var(--chart-2)' : 'var(--card)',
              }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3, delay: 0.05 * index }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={active}
              className="relative flex flex-col items-start gap-6 rounded-3xl p-4 text-left shadow-[0_10px_24px_-14px_rgba(0,0,0,0.3)]"
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`flex size-9 items-center justify-center rounded-full transition-colors ${
 active
 ? 'bg-primary-foreground text-chart-2'
 : 'bg-muted text-foreground/50 dark:text-foreground/60'
 }`}
                >
                  <SceneIcon icon={scene.icon} />
                </span>
                <span className={active ? 'text-primary-foreground/80' : 'text-foreground/30'}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="2.5" r="1.3" fill="currentColor" />
                    <circle cx="8" cy="8" r="1.3" fill="currentColor" />
                    <circle cx="8" cy="13.5" r="1.3" fill="currentColor" />
                  </svg>
                </span>
              </div>
              <div>
                <p className={`font-bold ${active ? 'text-primary-foreground' : 'text-foreground'}`}>{scene.name}</p>
                <p className={`text-sm ${active ? 'text-primary-foreground/70' : 'text-foreground/40'}`}>
                  {scene.deviceCount} Devices
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {showCreateRow ? (
        <div className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.3)]">
          <motion.span
            whileHover={{ rotate: 90 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-foreground/60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </motion.span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-foreground">You created {scenesCreated} scenes</p>
            <p className="text-sm text-foreground/40 tabular-nums">{devicesInUse} devices in use</p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/85"
          >
            See All
          </motion.button>
        </div>
      ) : null}
    </div>
  )
}

export default ScenesPanel
