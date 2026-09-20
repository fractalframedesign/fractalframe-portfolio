'use client'

import { motion } from 'motion/react'
import { useTheme } from 'next-themes'

import { useIsDark } from './use-is-dark'

interface ThemeToggleProps {
  className?: string
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" fill="currentColor" />
    </svg>
  )
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { setTheme } = useTheme();
  const isDark = useIsDark();
  const toggle = () => setTheme(isDark ? 'light' : 'dark')

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={toggle}
      className={`relative flex h-10 w-[74px] shrink-0 items-center rounded-full bg-black/[0.06] p-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-home-ink/30 dark:bg-white/10 dark:focus-visible:ring-white/40 ${className}`}
    >
      <span className="pointer-events-none absolute left-2.5 flex text-home-ink/35 dark:text-white/30">
        <SunIcon />
      </span>
      <span className="pointer-events-none absolute right-2.5 flex text-home-ink/25 dark:text-white/70">
        <MoonIcon />
      </span>
      <motion.span
        layout
        transition={{ type: 'spring', duration: 0.4, bounce: 0.35 }}
        className="z-10 flex size-8 items-center justify-center rounded-full bg-white text-home-ink shadow-[0_4px_10px_-2px_rgba(0,0,0,0.3)] dark:bg-home-ink dark:text-white"
        style={{ marginLeft: isDark ? 'auto' : 0 }}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </motion.span>
    </button>
  )
}

export default ThemeToggle
