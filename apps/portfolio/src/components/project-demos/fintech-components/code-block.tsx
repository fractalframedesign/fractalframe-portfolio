'use client'

import { Check, Copy } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import * as React from 'react'

import { cn } from '@/lib/utils'

export function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // clipboard unavailable — still flip the affordance for demo purposes
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn('relative w-full overflow-hidden rounded-xl border border-white/10', className)}>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-md bg-white/5 text-white/60 backdrop-blur transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
      <Highlight code={code.trim()} language="tsx" theme={themes.dracula}>
        {({ className: preClassName, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(preClassName, 'max-h-[460px] overflow-auto py-4 pr-14 pl-4 text-xs leading-relaxed')}
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                <span className="table-cell w-px pr-4 text-right align-top text-white/25 select-none">{i + 1}</span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
