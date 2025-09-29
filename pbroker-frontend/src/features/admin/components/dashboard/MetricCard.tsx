// src/components/dashboard/MetricCard.tsx
import React from 'react'
import { Card } from '../../../../components/ui/card'
import { cn } from '../../../../lib/utils'
import { ChevronRight, type LucideIcon } from 'lucide-react'

interface MetricCardProps {
  /** big number at top */
  value: number | string
  /** main label underneath the value */
  label: string
  /** secondary text (optional) */
  description?: string
  /** icon to show as faint background */
  icon: LucideIcon
  /** tailwind bg color, e.g. "bg-teal-500" */
  bgColor?: string
  /** href for the "More info" link */
  href?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  description,
  icon: Icon,
  bgColor = 'bg-teal-500',
  href = '#',
}) => (
  <Card
    className={cn(
      bgColor,
      'text-white',
      'relative overflow-hidden',
      'flex flex-col justify-between'
    )}
  >
    {/* content */}
    <div className="px-4 z-10">
      <div className="text-xl font-bold leading-tight">{value}</div>
      <div className="mt-1 text-sm">{label}</div>
      {description && <div className="mt-1 text-xs opacity-75">{description}</div>}
    </div>

    {/* faint icon in corner */}
    <Icon
      className="absolute top-2 right-2 h-24 w-24 opacity-10"
    />

    {/* footer link */}
    <div className={cn(
      "px-4 py-2 transition-all duration-300 hover:bg-white/10 backdrop-blur-sm",
      bgColor.replace('500', '600')
    )}>
      <a
        href={href}
        className="inline-flex items-center text-sm font-medium hover:underline"
      >
        <span className='text-white'>More info</span> <ChevronRight className="ml-1 h-4 w-4 text-white" />
      </a>
    </div>
  </Card>
)
