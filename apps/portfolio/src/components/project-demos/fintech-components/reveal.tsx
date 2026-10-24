'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import * as React from 'react'

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } },
}

function getItemVariants(shouldReduceMotion: boolean): Variants {
  return {
    hidden: {
      opacity: 1,
      y: shouldReduceMotion ? 0 : 10,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', duration: 0.42, bounce: 0 },
    },
  }
}

export function RevealGroup({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -72px 0px' }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ className, children }: { className?: string; children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div className={className} variants={getItemVariants(Boolean(shouldReduceMotion))}>
      {children}
    </motion.div>
  )
}
