'use client'

import { useReducedMotion } from 'motion/react'
import * as React from 'react'

export type MotionEase = 'smooth' | 'bouncy' | 'snappy' | 'linear'

/** One set of motion values every widget reads, so the studio sliders can retune them live */
export type MotionSettings = {
  /** Multiplies every duration: 1 is the default pace, 2 is twice as slow */
  speed: number
  /** How far things travel when they enter, in px */
  distance: number
  /** Blur things start from when they enter, in px */
  blur: number
  /** Scale things start from when they enter (and press to) */
  scale: number
  /** Delay between items that animate in sequence, in ms */
  stagger: number
  ease: MotionEase
}

export const defaultMotionSettings: MotionSettings = {
  speed: 1,
  distance: 8,
  blur: 2,
  scale: 0.97,
  stagger: 50,
  ease: 'smooth',
}

/** Cubic-bezier control points for each easing */
export const easeCurves: Record<MotionEase, [number, number, number, number]> = {
  smooth: [0.22, 1, 0.36, 1],
  bouncy: [0.34, 1.56, 0.64, 1],
  snappy: [0.2, 0.8, 0.2, 1],
  linear: [0, 0, 1, 1],
}

export const easeLabels: Record<MotionEase, string> = {
  smooth: 'Smooth ease out',
  bouncy: 'Bouncy overshoot',
  snappy: 'Snappy',
  linear: 'Linear',
}

const springBounce: Record<MotionEase, number> = {
  smooth: 0.1,
  bouncy: 0.45,
  snappy: 0,
  linear: 0,
}

type MotionContextValue = {
  settings: MotionSettings
  /**
   * Off by default: widgets keep their original behaviour. The studio turns it
   * on for one preview once the visitor changes that widget's motion settings.
   */
  enabled: boolean
}

const MotionSettingsContext = React.createContext<MotionContextValue>({
  settings: defaultMotionSettings,
  enabled: false,
})

export function MotionSettingsProvider({
  value,
  enabled,
  children,
}: {
  value: MotionSettings
  enabled: boolean
  children: React.ReactNode
}) {
  const context = React.useMemo(() => ({ settings: value, enabled }), [value, enabled])
  return <MotionSettingsContext.Provider value={context}>{children}</MotionSettingsContext.Provider>
}

/**
 * Resolved motion for the current widget. `enabled` is false unless the
 * studio's motion settings were changed; components then keep their original
 * behaviour. With reduced motion on in the system, movement, blur and scale
 * drop out and only quick fades remain.
 */
export function useMotion() {
  const { settings, enabled } = React.useContext(MotionSettingsContext)
  const reduced = Boolean(useReducedMotion())

  return React.useMemo(() => {
    const curve = easeCurves[settings.ease]
    /** Seconds for a base duration in ms, after the speed multiplier */
    const seconds = (ms: number) => (reduced ? Math.min(ms, 120) : ms * settings.speed) / 1000

    return {
      ...settings,
      enabled,
      reduced,
      distance: reduced ? 0 : settings.distance,
      blur: reduced ? 0 : settings.blur,
      scale: reduced ? 1 : settings.scale,
      curve,
      seconds,
      /** Tween for enter and state changes */
      tween: (ms: number, delayMs = 0) => ({
        duration: seconds(ms),
        delay: reduced ? 0 : (delayMs * settings.speed) / 1000,
        ease: curve,
      }),
      /** Spring for things that travel: thumbs, pills, presses */
      spring: (ms: number) => ({
        type: 'spring' as const,
        duration: seconds(ms),
        bounce: reduced ? 0 : springBounce[settings.ease],
      }),
      /** CSS custom properties for CSS-driven animations (skeleton pulse) */
      cssVars: (enabled
        ? { '--motion-speed': String(reduced ? 1 : settings.speed) }
        : {}) as React.CSSProperties,
    }
  }, [settings, enabled, reduced])
}
