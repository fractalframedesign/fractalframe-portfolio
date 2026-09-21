'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useMemo, useRef, useState } from 'react'

import { useIsDark } from '@/components/showcase/use-is-dark';

interface ClimateControlProps {
  label?: string
  subtitle?: string
  min?: number
  max?: number
  initialValue?: number
  mode?: 'cooling' | 'heating'
  showTimer?: boolean
  className?: string
}

const TIMER_STEPS = [0, 1, 2, 4]
const TICK_COUNT = 44

const VIEW_W = 340
const VIEW_H = 210
const CX = 170
const CY = 188
const TICK_OUTER_R = 150
const TICK_INNER_R = 132
const HANDLE_R = 150

function angleForValue(value: number, min: number, max: number) {
  const fraction = (value - min) / (max - min)
  return 180 - fraction * 180
}

function valueForAngle(angleDeg: number, min: number, max: number) {
  const clamped = Math.min(180, Math.max(0, angleDeg))
  const fraction = (180 - clamped) / 180
  return min + fraction * (max - min)
}

function pointOnCircle(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CX + radius * Math.cos(rad),
    y: CY - radius * Math.sin(rad),
  }
}

export function ClimateControl({
  label = 'Air Conditioner',
  subtitle = 'Auto cooling',
  min = 10,
  max = 40,
  initialValue = 24,
  mode = 'cooling',
  showTimer = true,
  className = '',
}: ClimateControlProps) {
  const [value, setValue] = useState(initialValue)
  const [on, setOn] = useState(true)
  const [timerIndex, setTimerIndex] = useState(2)
  const [dragging, setDragging] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const isDark = useIsDark();

  const accent = mode === 'cooling' ? '#5b6bf5' : '#f5793a'
  const accentSoft = mode === 'cooling' ? '#c7ccfb' : '#f9c9ab'
  const inactiveTick = isDark ? 'rgba(255,255,255,0.16)' : '#d8dae2'
  const handleFill = isDark ? '#17181c' : '#ffffff'

  const angle = angleForValue(value, min, max)

  const updateFromClientPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const centerX = rect.left + (CX / VIEW_W) * rect.width
      const centerY = rect.top + (CY / VIEW_H) * rect.height
      const dx = clientX - centerX
      const dy = clientY - centerY
      let deg = (Math.atan2(-dy, dx) * 180) / Math.PI
      if (deg < 0) deg = deg > -90 ? 0 : 180
      const next = valueForAngle(deg, min, max)
      setValue(Math.round(next))
    },
    [min, max],
  )

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!on) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    updateFromClientPoint(event.clientX, event.clientY)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragging) return
    updateFromClientPoint(event.clientX, event.clientY)
  }

  const endDrag = () => setDragging(false)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!on) return
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      setValue((v) => Math.min(max, v + 1))
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      setValue((v) => Math.max(min, v - 1))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setValue(min)
    } else if (event.key === 'End') {
      event.preventDefault()
      setValue(max)
    }
  }

  const ticks = useMemo(() => {
    return Array.from({ length: TICK_COUNT }, (_, i) => {
      const tickAngle = 180 - (i / (TICK_COUNT - 1)) * 180
      const tickValue = valueForAngle(tickAngle, min, max)
      const active = tickValue <= value + 0.001
      const inner = pointOnCircle(tickAngle, TICK_INNER_R)
      const outer = pointOnCircle(tickAngle, TICK_OUTER_R)
      return { key: i, inner, outer, active }
    })
  }, [min, max, value])

  const handlePos = pointOnCircle(angle, HANDLE_R)
  const spokeInner = pointOnCircle(angle, TICK_INNER_R - 8)

  const timerLabel = TIMER_STEPS[timerIndex] === 0 ? 'Timer' : `${TIMER_STEPS[timerIndex]}h`

  return (
    <div
      className={`relative mx-auto flex w-full min-w-[280px] max-w-[580px] flex-col overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.03] dark:bg-[#17181c] dark:ring-white/[0.06] ${className}`}
    >
      {on ? (
        <div
          aria-hidden
          className="motion-safe:animate-pulse pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-40 blur-3xl dark:opacity-20"
          style={{ background: `radial-gradient(circle, ${accentSoft}, transparent 70%)` }}
        />
      ) : null}

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-ink/5 dark:bg-white/10">
            {mode === 'cooling' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M2 12h20M6.5 4.5l11 15M17.5 4.5l-11 15"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-ink dark:text-white">{label}</p>
            <p className="text-sm text-ink/45 dark:text-white/40">{subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={`Turn ${label} ${on ? 'off' : 'on'}`}
          onClick={() => setOn((v) => !v)}
          className="relative flex h-10 w-[74px] items-center rounded-full bg-black/[0.06] p-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ink/30 dark:bg-white/10 dark:focus-visible:ring-white/30"
        >
          <span
            className={`pointer-events-none absolute left-3 text-xs font-semibold transition-opacity ${on ? 'opacity-100 text-ink/70 dark:text-white/70' : 'opacity-0'}`}
          >
            On
          </span>
          <motion.span
            layout
            transition={{ type: 'spring', duration: 0.4, bounce: 0.35 }}
            className="ml-auto flex size-8 items-center justify-center rounded-full bg-ink text-white shadow-sm dark:bg-white dark:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M6.5 5.5a8 8 0 1 0 11 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </motion.span>
        </button>
      </div>

      {showTimer ? (
        <div className="relative mt-4">
          <motion.button
            type="button"
            onClick={() => setTimerIndex((i) => (i + 1) % TIMER_STEPS.length)}
            whileTap={{ scale: 0.94 }}
            className="flex items-center gap-1.5 rounded-full bg-(--color-accent-1-soft) px-3.5 py-1.5 text-sm font-semibold text-[#3a45c2] transition-colors hover:brightness-105 dark:bg-[#2b2f63] dark:text-[#c7ccfb]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 8v4.5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {timerLabel}
          </motion.button>
        </div>
      ) : null}

      <div className="relative mt-2 flex justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className={`w-full max-w-[380px] touch-none select-none ${on ? 'cursor-pointer' : 'cursor-not-allowed opacity-50 grayscale'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {ticks.map((tick) => (
            <line
              key={tick.key}
              x1={tick.inner.x}
              y1={tick.inner.y}
              x2={tick.outer.x}
              y2={tick.outer.y}
              stroke={tick.active ? accent : inactiveTick}
              strokeWidth={3}
              strokeLinecap="round"
              style={{ transition: 'stroke 150ms ease' }}
            />
          ))}

          <line
            x1={spokeInner.x}
            y1={spokeInner.y}
            x2={handlePos.x}
            y2={handlePos.y}
            stroke={accent}
            strokeWidth={3}
            strokeLinecap="round"
          />

          <g
            role="slider"
            tabIndex={on ? 0 : -1}
            aria-label={`${label} temperature`}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={`${value} degrees`}
            aria-disabled={!on}
            onKeyDown={handleKeyDown}
            style={{ outline: 'none' }}
          >
            <circle cx={handlePos.x} cy={handlePos.y} r={13} fill={handleFill} stroke={accent} strokeWidth={4} />
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-2 text-center">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0.35 }}
              className="tabular-nums text-5xl font-extrabold tracking-tight text-ink dark:text-white"
            >
              {value}°
            </motion.span>
          </AnimatePresence>
          <p className="mt-1 text-sm font-medium text-ink/40 dark:text-white/40">Temperature</p>
        </div>

        <span className="pointer-events-none absolute bottom-1 left-2 text-sm font-medium text-ink/35 tabular-nums dark:text-white/35">
          {min}°
        </span>
        <span className="pointer-events-none absolute right-2 bottom-1 text-sm font-medium text-ink/35 tabular-nums dark:text-white/35">
          {max}°
        </span>
      </div>
    </div>
  )
}

export default ClimateControl
