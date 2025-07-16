'use client'

import { UtensilsCrossed, Car, Building2 } from 'lucide-react'

import type { PlaceType } from '@/types/places'
import { cn } from '@/lib/utils'

interface PlaceTypeSelectorProps {
  selectedType: PlaceType
  onTypeChange: (type: PlaceType) => void
  className?: string
}

const placeTypeConfig = {
  [PlaceType.RESTAURANTS]: {
    label: 'Restaurants',
    icon: UtensilsCrossed,
    description: 'Find great dining spots',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    selectedBg: 'bg-orange-100',
    selectedBorder: 'border-orange-500',
  },
  [PlaceType.PARKINGS]: {
    label: 'Parking',
    icon: Car,
    description: 'Find parking spaces',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    selectedBg: 'bg-blue-100',
    selectedBorder: 'border-blue-500',
  },
  [PlaceType.HOTELS]: {
    label: 'Hotels',
    icon: Building2,
    description: 'Find accommodations',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    selectedBg: 'bg-purple-100',
    selectedBorder: 'border-purple-500',
  },
}

export function PlaceTypeSelector({
  selectedType,
  onTypeChange,
  className,
}: PlaceTypeSelectorProps): JSX.Element {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">What are you looking for?</label>
      
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(placeTypeConfig).map(([type, config]) => {
          const isSelected = selectedType === type
          const Icon = config.icon

          return (
            <button
              key={type}
              onClick={() => onTypeChange(type as PlaceType)}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-sm',
                isSelected
                  ? `${config.selectedBg} ${config.selectedBorder} shadow-sm`
                  : `${config.bgColor} ${config.borderColor} hover:${config.selectedBg}`
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  isSelected ? 'bg-white shadow-sm' : 'bg-white/50'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isSelected ? config.color : 'text-muted-foreground'
                  )}
                />
              </div>
              
              <div className="flex-1">
                <h3 className={cn(
                  'font-medium',
                  isSelected ? config.color : 'text-foreground'
                )}>
                  {config.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {config.description}
                </p>
              </div>
              
              {isSelected && (
                <div className={cn(
                  'h-2 w-2 rounded-full',
                  config.color.replace('text-', 'bg-')
                )} />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Quick Stats */}
      <div className="mt-3 text-xs text-muted-foreground">
        <p>✨ Results include AI-powered quality analysis</p>
        <p>📍 Showing top 10 places based on ratings and distance</p>
      </div>
    </div>
  )
}