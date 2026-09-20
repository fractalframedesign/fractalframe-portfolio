'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

interface Camera {
  id: string
  name: string
  location: string
  status: 'live' | 'offline'
}

interface SecurityCamerasCardProps {
  title?: string
  subtitle?: string
  cameras?: Camera[]
  columns?: 2 | 4 | '2' | '4'
  className?: string
}

const DEFAULT_CAMERAS: Camera[] = [
  { id: 'front-door', name: 'Front Door', location: 'Entrance', status: 'live' },
  { id: 'backyard', name: 'Backyard', location: 'Garden', status: 'live' },
  { id: 'garage', name: 'Garage', location: 'Driveway', status: 'offline' },
  { id: 'living-room', name: 'Living Room', location: 'Indoor', status: 'live' },
]

const FEED_GRADIENTS = [
  'from-[#1c2b22] to-[#0c120d]',
  'from-[#1a2440] to-[#0b0e1a]',
  'from-[#241a12] to-[#0d0906]',
  'from-[#1c1c22] to-[#08080a]',
]

function CameraIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2.5" y="7" width="13" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M15.5 10.2 20 8v8l-4.5-2.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {muted ? (
        <path d="m16.5 9.5 4 5m0-5-4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path
          d="M16 9a4 4 0 0 1 0 6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

function CameraTile({ camera, index }: { camera: Camera; index: number }) {
  const [muted, setMuted] = useState(true)
  const isLive = camera.status === 'live'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, type: 'spring', duration: 0.5, bounce: 0.25 }}
      whileHover={{ scale: 1.015 }}
      className={`group relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br shadow-[0_10px_24px_-14px_rgba(0,0,0,0.4)] ${FEED_GRADIENTS[index % FEED_GRADIENTS.length]} ${isLive ? '' : 'grayscale'}`}
    >
      <CameraIcon className="absolute inset-0 m-auto size-10 text-white/10" />

      {isLive ? (
        <div
          aria-hidden
          className="motion-safe:animate-cctv-scan pointer-events-none absolute inset-x-0 h-1/3 bg-gradient-to-b from-white/0 via-white/10 to-white/0"
        />
      ) : null}

      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm">
        <span
          className={`size-1.5 rounded-full ${isLive ? 'motion-safe:animate-pulse bg-red-500' : 'bg-white/40'}`}
        />
        <span className="text-[10px] font-bold tracking-wide text-white uppercase">
          {isLive ? 'Live' : 'Offline'}
        </span>
      </div>

      {isLive ? (
        <button
          type="button"
          onClick={() => setMuted((v) => !v)}
          aria-label={muted ? `Unmute ${camera.name}` : `Mute ${camera.name}`}
          aria-pressed={!muted}
          className="absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full bg-black/45 text-white/80 backdrop-blur-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <SpeakerIcon muted={muted} />
        </button>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pt-6 pb-2.5">
        <p className="truncate text-sm font-bold text-white">{camera.name}</p>
        <p className="truncate text-xs text-white/60">
          {isLive ? camera.location : 'No signal'}
        </p>
      </div>
    </motion.div>
  )
}

export function SecurityCamerasCard({
  title = 'Security Cameras',
  subtitle,
  cameras = DEFAULT_CAMERAS,
  columns = 4,
  className = '',
}: SecurityCamerasCardProps) {
  const liveCount = cameras.filter((c) => c.status === 'live').length
  const computedSubtitle = subtitle ?? `${liveCount} of ${cameras.length} online`
  const isFourColumns = Number(columns) === 4

  return (
    <div
      className={`mx-auto flex w-full min-w-[280px] max-w-[1180px] flex-col rounded-[28px] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.03] dark:bg-[#17181c] dark:ring-white/[0.06] ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-ink/5 text-ink dark:bg-white/10 dark:text-white">
            <CameraIcon className="size-[18px]" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-ink dark:text-white">{title}</p>
            <p className="text-sm text-ink/45 dark:text-white/40">{computedSubtitle}</p>
          </div>
        </div>

        <motion.button
          type="button"
          aria-label="View all cameras"
          whileHover={{ scale: 1.08, rotate: 6 }}
          whileTap={{ scale: 0.9 }}
          className="flex size-10 items-center justify-center rounded-full bg-ink text-white outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 dark:bg-white dark:text-ink dark:focus-visible:ring-white dark:focus-visible:ring-offset-[#17181c]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </div>

      <div className={`mt-5 grid grid-cols-2 gap-4 ${isFourColumns ? 'sm:grid-cols-4' : ''}`}>
        {cameras.map((camera, index) => (
          <CameraTile key={camera.id} camera={camera} index={index} />
        ))}
      </div>
    </div>
  )
}

export default SecurityCamerasCard
