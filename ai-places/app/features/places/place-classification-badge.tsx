'use client'

import { CheckCircle, AlertCircle, XCircle, Clock, Star } from 'lucide-react'

import type { PlaceClassification } from '@/types/places'
import { cn } from '@/lib/utils'

interface PlaceClassificationBadgeProps {
  classification: PlaceClassification
  confidence?: number
  showConfidence?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const classificationConfig = {
  excellent: {
    label: 'Excellent',
    icon: Star,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
  },
  very_good: {
    label: 'Very Good',
    icon: CheckCircle,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
  },
  good: {
    label: 'Good',
    icon: CheckCircle,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    dotColor: 'bg-yellow-500',
  },
  average: {
    label: 'Average',
    icon: Clock,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    dotColor: 'bg-orange-500',
  },
  poor: {
    label: 'Poor',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500',
  },
}

const sizeConfig = {
  sm: {
    badge: 'px-2 py-1 text-xs',
    icon: 'h-3 w-3',
    dot: 'h-2 w-2',
  },
  md: {
    badge: 'px-3 py-1.5 text-sm',
    icon: 'h-4 w-4',
    dot: 'h-2.5 w-2.5',
  },
  lg: {
    badge: 'px-4 py-2 text-base',
    icon: 'h-5 w-5',
    dot: 'h-3 w-3',
  },
}

export function PlaceClassificationBadge({
  classification,
  confidence,
  showConfidence = false,
  size = 'md',
  className,
}: PlaceClassificationBadgeProps): JSX.Element {
  const config = classificationConfig[classification]
  const sizes = sizeConfig[size]
  const Icon = config.icon

  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    return 'text-orange-600'
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border font-medium transition-all',
        config.bgColor,
        config.borderColor,
        config.color,
        sizes.badge,
        className
      )}
    >
      {/* Classification Icon */}
      <Icon className={cn('flex-shrink-0', sizes.icon)} />
      
      {/* Classification Label */}
      <span>{config.label}</span>
      
      {/* Confidence Score */}
      {showConfidence && confidence !== undefined && (
        <>
          <div className={cn('rounded-full', config.dotColor, sizes.dot)} />
          <span className={cn('text-xs', getConfidenceColor(confidence))}>
            {formatConfidence(confidence)}
          </span>
        </>
      )}
    </div>
  )
}

/**
 * Simplified version for use in lists
 */
export function PlaceClassificationDot({
  classification,
  className,
}: {
  classification: PlaceClassification
  className?: string
}): JSX.Element {
  const config = classificationConfig[classification]
  
  return (
    <div
      className={cn(
        'h-2 w-2 rounded-full',
        config.dotColor,
        className
      )}
      title={config.label}
    />
  )
}

/**
 * Large version for detailed views
 */
export function PlaceClassificationCard({
  classification,
  confidence,
  summary,
  className,
}: {
  classification: PlaceClassification
  confidence?: number
  summary?: string
  className?: string
}): JSX.Element {
  const config = classificationConfig[classification]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          'flex items-center justify-center rounded-full p-2',
          'bg-white shadow-sm'
        )}>
          <Icon className={cn('h-5 w-5', config.color)} />
        </div>
        <div>
          <h3 className={cn('font-semibold text-lg', config.color)}>
            {config.label}
          </h3>
          {confidence !== undefined && (
            <p className="text-sm text-muted-foreground">
              {Math.round(confidence * 100)}% confidence
            </p>
          )}
        </div>
      </div>
      
      {summary && (
        <p className="text-sm text-muted-foreground">{summary}</p>
      )}
    </div>
  )
}

/**
 * Get classification from rating (utility function)
 */
export function getClassificationFromRating(rating: number): PlaceClassification {
  if (rating >= 4.5) return 'excellent'
  if (rating >= 4.0) return 'very_good'
  if (rating >= 3.5) return 'good'
  if (rating >= 3.0) return 'average'
  return 'poor'
}

/**
 * Get all classifications with their configs (for filters, etc.)
 */
export function getAllClassifications(): Array<{
  value: PlaceClassification
  label: string
  color: string
}> {
  return Object.entries(classificationConfig).map(([key, config]) => ({
    value: key as PlaceClassification,
    label: config.label,
    color: config.color,
  }))
}