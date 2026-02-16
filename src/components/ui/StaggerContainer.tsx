'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StaggerContainerProps {
    children: React.ReactNode
    className?: string
    delay?: number
}

// Container variants for staggering children
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

// Item variants for individual children elements
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 50,
            damping: 20
        }
    },
}

export function StaggerContainer({
    children,
    className,
    delay = 0
}: StaggerContainerProps) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={cn('w-full', className)}
        >
            {children}
        </motion.div>
    )
}

// Export item wrapper for direct use on children if needed
export const StaggerItem = ({
    children,
    className
}: {
    children: React.ReactNode,
    className?: string
}) => (
    <motion.div variants={itemVariants} className={className}>
        {children}
    </motion.div>
)
