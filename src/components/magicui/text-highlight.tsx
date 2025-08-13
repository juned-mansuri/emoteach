"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface TextHighlightProps {
  children: React.ReactNode
  className?: string
  highlightClassName?: string
  delay?: number
}

export function TextHighlight({ 
  children, 
  className,
  highlightClassName,
  delay = 0.5
}: TextHighlightProps) {
  return (
    <span className={cn("relative inline-block ", className)}>
      {/* Animated underline */}
      <motion.span
        className={cn(
          "absolute -bottom-2  left-0 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full",
          highlightClassName
        )}
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ 
          duration: 0.8, 
          delay,
          ease: "easeInOut"
        }}
      />
      <span className="relative  bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent z-50">
        {children}
      </span> 
    </span>
  )
}
