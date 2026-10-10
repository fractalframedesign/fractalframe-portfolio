'use client'

import * as React from 'react'

export function useWidgetLoading(forced: boolean | undefined, duration = 900) {
  const [internal, setInternal] = React.useState(false)
  const loading = forced ?? internal

  const refresh = React.useCallback(() => {
    if (forced !== undefined) return
    setInternal(true)
    window.setTimeout(() => setInternal(false), duration)
  }, [forced, duration])

  return { loading, refresh }
}
