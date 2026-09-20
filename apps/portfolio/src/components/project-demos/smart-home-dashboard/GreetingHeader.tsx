'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

interface GreetingHeaderProps {
  name?: string
  deviceCount?: number
  initials?: string
  className?: string
}

export function GreetingHeader({
  name = 'Diana Kemmer',
  deviceCount = 7,
  initials = 'DK',
  className = '',
}: GreetingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <div className={`mx-auto flex w-full min-w-[280px] max-w-[580px] items-center gap-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.35 }}
        className="relative flex size-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3a3f52] to-[#0b0b0d] text-lg font-semibold text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] ring-4 ring-white"
      >
        {initials}
        <span className="absolute right-0.5 bottom-0.5 size-4 rounded-full border-2 border-white bg-[#4ade80]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.3, delay: 0.08 }}
        className="relative flex min-h-20 flex-1 items-center justify-between gap-4 rounded-[28px] bg-gradient-to-br from-(--color-accent-2) to-(--color-accent-2-soft) px-7 py-5 shadow-[0_16px_36px_-16px_rgba(180,200,20,0.65)]"
      >
        <div>
          <p className="text-xl font-bold tracking-tight text-ink">
            Hi, {name.split(' ')[0]} {name.split(' ').slice(1).join(' ')}
          </p>
          <p className="mt-1 text-sm font-medium text-ink/60">
            {deviceCount} devices active
          </p>
        </div>

        <div ref={menuRef} className="relative">
          <motion.button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Profile menu"
            onClick={() => setMenuOpen((v) => !v)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-white shadow-[0_6px_16px_-4px_rgba(0,0,0,0.5)] outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-accent-2)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="2.5" r="1.5" fill="currentColor" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              <circle cx="8" cy="13.5" r="1.5" fill="currentColor" />
            </svg>
          </motion.button>

          <AnimatePresence>
            {menuOpen ? (
              <motion.div
                role="menu"
                initial={{ opacity: 0, scale: 0.92, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
                className="absolute top-12 right-0 z-10 w-44 overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 dark:bg-[#1c1d21] dark:ring-white/10"
              >
                {['Edit profile', 'Settings', 'Sign out'].map((item) => (
                  <button
                    key={item}
                    role="menuitem"
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-ink/80 transition-colors hover:bg-ink/5 hover:text-ink dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default GreetingHeader
