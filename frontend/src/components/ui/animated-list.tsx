"use client"
import { useRef } from "react"
import { motion, useInView } from "motion/react"
import { cn } from "@/lib/utils"

function AnimatedList({
  children,
  className,
  delay = 0.1,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "0px" })

  return (
    <div ref={ref} className={cn("flex flex-col", className)}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: i * delay,
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </div>
  )
}

export { AnimatedList }
