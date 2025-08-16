"use client"

import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useRef, type ReactNode } from "react"

interface ScrollAnimationProps {
  children: ReactNode
  className?: string
  offset?: [number, number]
}

export function ParallaxSection({ children, className = "", offset = [0, -200] }: ScrollAnimationProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], offset)
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 })

  return (
    <motion.div ref={ref} style={{ y: smoothY }} className={className}>
      {children}
    </motion.div>
  )
}

export function FadeInSection({ children, className = "" }: ScrollAnimationProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.2"],
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])

  return (
    <motion.div ref={ref} style={{ opacity, scale }} className={className}>
      {children}
    </motion.div>
  )
}

export function SlideInSection({
  children,
  className = "",
  direction = "left",
}: ScrollAnimationProps & { direction?: "left" | "right" | "up" | "down" }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.2"],
  })

  const xTransform = useTransform(scrollYProgress, [0, 1], [-100, 0])
  const yTransform = useTransform(scrollYProgress, [0, 1], [100, 0])
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])

  const style = direction === "left" || direction === "right" ? { x: xTransform, opacity } : { y: yTransform, opacity }

  return (
    <motion.div ref={ref} style={style} className={className}>
      {children}
    </motion.div>
  )
}

export function StaggeredAnimation({
  children,
  className = "",
  staggerDelay = 0.1,
}: ScrollAnimationProps & { staggerDelay?: number }) {
  const ref = useRef(null)

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggeredItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
