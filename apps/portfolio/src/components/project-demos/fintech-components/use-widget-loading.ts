'use client'

import * as React from 'react'

import { useStageReveal } from '@/components/project-demos/fintech-components/motion/stage'

export function useWidgetLoading(forced: boolean | undefined, duration = 900) {
  const [internal, setInternal] = React.useState(false)
  const loading = forced ?? internal
  const reveal = useStageReveal()

  // Skeleton swapped for content: let the stage play the reveal
  const wasLoading = React.useRef(loading)
  React.useEffect(() => {
    if (wasLoading.current && !loading) reveal()
    wasLoading.current = loading
  }, [loading, reveal])

  const refresh = React.useCallback(() => {
    if (forced !== undefined) return
    setInternal(true)
    window.setTimeout(() => setInternal(false), duration)
  }, [forced, duration])

  return { loading, refresh }
}
