"use client"

import { useEffect, useRef } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"

export function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number
  suffix?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node || !isInView) return

    if (shouldReduceMotion) {
      node.textContent = `${value}${suffix}`
      return
    }

    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        node.textContent = `${Math.round(latest)}${suffix}`
      },
    })
    return () => controls.stop()
  }, [isInView, value, suffix, shouldReduceMotion])

  return <span ref={ref}>0{suffix}</span>
}
