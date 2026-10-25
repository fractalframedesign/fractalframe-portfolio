'use client'

import * as React from 'react'

import { useMotion } from './settings'

const RevealContext = React.createContext<() => void>(() => {})

/** Lets a widget ask its stage to play the reveal, e.g. after a refresh finishes loading */
export function useStageReveal() {
  return React.useContext(RevealContext)
}

/**
 * Wraps one widget. When motion is enabled, plays a rise + fade + un-blur on
 * mount (remount it with a new key to replay) and whenever the widget swaps
 * its skeleton for content. With motion off it is a plain wrapper.
 */
export function MotionStage({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const m = useMotion()

  const reveal = React.useCallback(() => {
    const target = ref.current?.firstElementChild as HTMLElement | null
    if (!m.enabled || !target?.animate) return
    target.animate(
      [
        {
          opacity: 0,
          transform: `translateY(${m.distance * 1.5}px) scale(${m.scale})`,
          filter: `blur(${m.blur * 2}px)`,
        },
        { opacity: 1, transform: 'none', filter: 'blur(0px)' },
      ],
      { duration: m.seconds(500) * 1000, easing: `cubic-bezier(${m.curve.join(',')})` },
    )
  }, [m])

  // Play once per mount; later reveals come from the widget
  const revealOnMount = React.useRef(reveal)
  React.useEffect(() => {
    revealOnMount.current()
  }, [])

  return (
    <RevealContext.Provider value={reveal}>
      <div ref={ref} className={className} style={m.cssVars}>
        {children}
      </div>
    </RevealContext.Provider>
  )
}
