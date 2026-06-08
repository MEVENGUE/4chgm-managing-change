'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'

type Props = HTMLMotionProps<'div'> & {
  delay?: number
  hover?: boolean
  /** Stretch the card itself to fill its grid/flex track (use when this card is the panel). */
  fill?: boolean
  /** Stretch the card AND its single child panel (use when wrapping a separate panel). */
  fillChild?: boolean
}

export default function MotionCard({
  children,
  delay = 0,
  hover = true,
  fill = false,
  fillChild = false,
  className = '',
  ...props
}: Props) {
  const fillClass = fillChild ? 'h-full fill-child' : fill ? 'h-full' : ''
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`${fillClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </motion.div>
  )
}
