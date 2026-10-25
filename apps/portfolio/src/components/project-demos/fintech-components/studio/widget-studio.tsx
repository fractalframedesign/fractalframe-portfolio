'use client'

import { ChevronDown, RotateCcw, RotateCw } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import * as React from 'react'

import { CodeBlock } from '@/components/project-demos/fintech-components/code-block'
import {
  defaultMotionSettings,
  easeCurves,
  easeLabels,
  type MotionEase,
  type MotionSettings,
  MotionSettingsProvider,
} from '@/components/project-demos/fintech-components/motion/settings'
import { MotionStage } from '@/components/project-demos/fintech-components/motion/stage'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ScrubField from '@/components/ui/scrub-field'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type NumericSetting = Exclude<keyof MotionSettings, 'ease'>

type FieldConfig = {
  key: NumericSetting
  label: string
  range: { min: number; max: number; step: number }
  format: (value: number) => string
  presets: Array<{ label: string; value: number }>
}

const px = (v: number) => `${v}px`

const groups: Array<{ title: string; fields: FieldConfig[] }> = [
  {
    title: 'Timing',
    fields: [
      {
        key: 'speed',
        label: 'Duration',
        range: { min: 0.25, max: 3, step: 0.05 },
        format: (v) => `${Math.round(v * 100)}%`,
        presets: [
          { label: 'Quicker', value: 0.5 },
          { label: 'Quick', value: 0.75 },
          { label: 'Default', value: 1 },
          { label: 'Relaxed', value: 1.5 },
          { label: 'Slow', value: 2 },
        ],
      },
      {
        key: 'stagger',
        label: 'Stagger',
        range: { min: 0, max: 200, step: 5 },
        format: (v) => `${v}ms`,
        presets: [
          { label: 'None', value: 0 },
          { label: 'Tight', value: 30 },
          { label: 'Default', value: 50 },
          { label: 'Loose', value: 80 },
          { label: 'Wide', value: 120 },
        ],
      },
    ],
  },
  {
    title: 'Movement',
    fields: [
      {
        key: 'distance',
        label: 'Distance',
        range: { min: 0, max: 32, step: 1 },
        format: px,
        presets: [
          { label: 'None', value: 0 },
          { label: 'Micro', value: 4 },
          { label: 'Default', value: 8 },
          { label: 'Medium', value: 12 },
          { label: 'Large', value: 24 },
        ],
      },
      {
        key: 'scale',
        label: 'Start scale',
        range: { min: 0.8, max: 1, step: 0.01 },
        format: (v) => v.toFixed(2),
        presets: [
          { label: 'None', value: 1 },
          { label: 'Subtle', value: 0.98 },
          { label: 'Default', value: 0.97 },
          { label: 'Medium', value: 0.95 },
          { label: 'Strong', value: 0.9 },
        ],
      },
    ],
  },
  {
    title: 'Blur',
    fields: [
      {
        key: 'blur',
        label: 'Blur',
        range: { min: 0, max: 12, step: 0.5 },
        format: px,
        presets: [
          { label: 'None', value: 0 },
          { label: 'Default', value: 2 },
          { label: 'Medium', value: 3 },
          { label: 'Large', value: 8 },
        ],
      },
    ],
  },
]

/** The easing's curve, drawn in a 16px box (overshoot rises past the top) */
function curvePath([x1, y1, x2, y2]: [number, number, number, number]) {
  const point = (x: number, y: number) => `${2 + x * 12} ${14 - y * 12}`
  return `M2 14 C${point(x1, y1)} ${point(x2, y2)} 14 2`
}

/**
 * A widget's own page: motion settings on the left, Preview / Code on the right.
 * The preview keeps the widget's original motion until a setting is changed;
 * from then on the new motion applies to this preview only.
 */
export default function WidgetStudio({
  code,
  notes,
  children,
}: {
  code: string
  /** Shown under the motion panel, e.g. when to use the component */
  notes?: React.ReactNode
  children: React.ReactNode
}) {
  const [settings, setSettings] = React.useState(defaultMotionSettings)
  const [enabled, setEnabled] = React.useState(false)
  const [view, setView] = React.useState('preview')
  const [replay, setReplay] = React.useState(0)
  const reducedMotion = useReducedMotion()

  const replayPreview = () => setReplay((count) => count + 1)

  function update(patch: Partial<MotionSettings>, final = true) {
    setSettings((current) => ({ ...current, ...patch }))
    setEnabled(true)
    if (final) replayPreview()
  }

  function reset() {
    setSettings(defaultMotionSettings)
    setEnabled(false)
    replayPreview()
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="order-2 space-y-4 lg:order-1">
      <aside
        aria-label="Motion settings"
        className="bg-card border-border space-y-4 rounded-3xl border p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Motion</h2>
            <p className="text-muted-foreground text-xs text-pretty">
              {enabled
                ? 'Your motion, in this preview only.'
                : 'Original motion. Change a setting to try your own.'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            tooltip="Back to original"
            className="size-8 shrink-0 rounded-full"
            disabled={!enabled}
            onClick={reset}
            aria-label="Reset motion"
          >
            <RotateCcw />
          </Button>
        </div>

        {groups.map((group) => (
          <section key={group.title} className="border-border space-y-1.5 border-t pt-3">
            <h3 className="text-[13px] font-medium">{group.title}</h3>
            {group.fields.map((field) => (
              <ScrubField
                key={field.key}
                label={field.label}
                value={settings[field.key]}
                range={field.range}
                format={field.format}
                presets={field.presets}
                onValueChange={(value, final) => update({ [field.key]: value }, final)}
              />
            ))}
          </section>
        ))}

        <section className="border-border space-y-1.5 border-t pt-3">
          <h3 className="text-[13px] font-medium">Ease</h3>
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-muted hover:bg-muted/70 data-[state=open]:bg-muted/70 focus-visible:ring-ring/50 flex h-8 min-w-0 flex-1 items-center gap-1 rounded-lg pr-2 pl-3 text-left text-[13px] transition-colors outline-none focus-visible:ring-[3px]">
                <span className="text-muted-foreground flex-1 font-medium">Easing</span>
                <span className="truncate">{easeLabels[settings.ease]}</span>
                <ChevronDown className="text-muted-foreground size-4 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuRadioGroup
                  value={settings.ease}
                  onValueChange={(value) => update({ ease: value as MotionEase })}
                >
                  {(Object.keys(easeLabels) as MotionEase[]).map((ease) => (
                    <DropdownMenuRadioItem key={ease} value={ease}>
                      <span className="flex-1">{easeLabels[ease]}</span>
                      <svg viewBox="0 0 16 16" fill="none" className="text-muted-foreground size-4 overflow-visible" aria-hidden>
                        <path d={curvePath(easeCurves[ease])} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* The current curve, at a glance */}
            <span aria-hidden className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-lg">
              <svg viewBox="0 0 16 16" fill="none" className="size-4 overflow-visible">
                <path d={curvePath(easeCurves[settings.ease])} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </section>

        {reducedMotion && (
          <p className="text-muted-foreground text-xs text-pretty">
            Reduced motion is on in your system settings, so movement and blur are turned off.
          </p>
        )}
      </aside>
      {notes}
      </div>

      {/* Stretches to the left column's height, so the two sides line up */}
      <section
        aria-label="Component"
        className="bg-card border-border order-1 flex min-w-0 flex-col gap-2 rounded-3xl border p-2 lg:order-2"
      >
        <div className="flex items-center justify-between gap-2 p-1">
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </Tabs>
          {view === 'preview' && (
            <Button
              variant="ghost"
              size="icon"
              tooltip="Replay"
              className="size-8 rounded-full"
              onClick={replayPreview}
              aria-label="Replay"
            >
              <RotateCw />
            </Button>
          )}
        </div>

        {view === 'preview' ? (
          <div className="bg-muted/60 flex min-h-80 flex-1 items-center justify-center rounded-2xl p-4 md:p-8">
            <MotionSettingsProvider value={settings} enabled={enabled}>
              <MotionStage key={replay} className="w-full max-w-120">
                {children}
              </MotionStage>
            </MotionSettingsProvider>
          </div>
        ) : (
          <CodeBlock code={code} className="flex-1" />
        )}
      </section>
    </div>
  )
}
