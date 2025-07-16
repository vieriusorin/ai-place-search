'use client'

import { useState } from 'react'
import { 
  Star, 
  DollarSign, 
  Clock, 
  MapPin, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react'

import type { PlaceFilters, PlaceType } from '@/types/places'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'

interface PlaceFiltersProps {
  filters: Partial<PlaceFilters>
  onFiltersChange: (filters: Partial<PlaceFilters>) => void
  placeType: PlaceType
  className?: string
}

export function PlaceFilters({
  filters,
  onFiltersChange,
  placeType,
  className,
}: PlaceFiltersProps): JSX.Element {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['rating', 'distance'])
  )

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const resetFilters = () => {
    onFiltersChange({
      rating: { min: 0, max: 5 },
      priceLevel: [],
      openNow: false,
      distance: { max: 5 },
      features: [],
    })
  }

  const hasActiveFilters = Boolean(
    filters.rating?.min !== 0 ||
    filters.rating?.max !== 5 ||
    filters.priceLevel?.length ||
    filters.openNow ||
    filters.distance?.max !== 5 ||
    filters.features?.length
  )

  const priceLevelOptions = [
    { value: 1, label: '$', description: 'Budget-friendly' },
    { value: 2, label: '$$', description: 'Moderate' },
    { value: 3, label: '$$$', description: 'Expensive' },
    { value: 4, label: '$$$$', description: 'Very Expensive' },
  ]

  const getFeatureOptions = (type: PlaceType) => {
    const commonFeatures = [
      'wheelchair_accessible',
      'wifi',
      'parking',
      'air_conditioning',
    ]

    const typeSpecificFeatures = {
      restaurants: [
        'outdoor_seating',
        'takeout',
        'delivery',
        'reservations',
        'kid_friendly',
        'alcohol',
        'live_music',
      ],
      hotels: [
        'pool',
        'fitness_center',
        'spa',
        'restaurant',
        'bar',
        'business_center',
        'pet_friendly',
      ],
      parkings: [
        'covered',
        'security',
        'ev_charging',
        'valet',
        'handicap_accessible',
      ],
    }

    return [
      ...commonFeatures,
      ...(typeSpecificFeatures[type] || []),
    ].map(feature => ({
      value: feature,
      label: feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }))
  }

  const FilterSection = ({ 
    title, 
    icon: Icon, 
    children, 
    sectionKey 
  }: {
    title: string
    icon: React.ComponentType<any>
    children: React.ReactNode
    sectionKey: string
  }) => {
    const isExpanded = expandedSections.has(sectionKey)
    
    return (
      <div className="border-b last:border-b-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        
        {isExpanded && (
          <div className="px-3 pb-4 space-y-3">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('bg-background border rounded-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Filters</span>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Rating Filter */}
      <FilterSection title="Rating" icon={Star} sectionKey="rating">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Minimum Rating</span>
            <span className="font-medium">
              {filters.rating?.min || 0}+ stars
            </span>
          </div>
          
          <Slider
            value={[filters.rating?.min || 0]}
            onValueChange={(value) => 
              onFiltersChange({
                ...filters,
                rating: { ...filters.rating, min: value[0], max: 5 }
              })
            }
            max={5}
            step={0.5}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Any</span>
            <span>5 stars</span>
          </div>
        </div>
      </FilterSection>

      {/* Price Level Filter */}
      <FilterSection title="Price Level" icon={DollarSign} sectionKey="price">
        <div className="space-y-2">
          {priceLevelOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`price-${option.value}`}
                checked={filters.priceLevel?.includes(option.value) || false}
                onCheckedChange={(checked) => {
                  const currentPrices = filters.priceLevel || []
                  const newPrices = checked
                    ? [...currentPrices, option.value]
                    : currentPrices.filter(p => p !== option.value)
                  
                  onFiltersChange({
                    ...filters,
                    priceLevel: newPrices
                  })
                }}
              />
              <label
                htmlFor={`price-${option.value}`}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-muted-foreground">{option.description}</span>
              </label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Distance Filter */}
      <FilterSection title="Distance" icon={MapPin} sectionKey="distance">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Maximum Distance</span>
            <span className="font-medium">
              {filters.distance?.max || 5} km
            </span>
          </div>
          
          <Slider
            value={[filters.distance?.max || 5]}
            onValueChange={(value) => 
              onFiltersChange({
                ...filters,
                distance: { max: value[0] }
              })
            }
            max={20}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 km</span>
            <span>20 km</span>
          </div>
        </div>
      </FilterSection>

      {/* Open Now Filter */}
      <FilterSection title="Availability" icon={Clock} sectionKey="availability">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="open-now"
            checked={filters.openNow || false}
            onCheckedChange={(checked) => 
              onFiltersChange({
                ...filters,
                openNow: checked as boolean
              })
            }
          />
          <label
            htmlFor="open-now"
            className="text-sm cursor-pointer"
          >
            Open now
          </label>
        </div>
      </FilterSection>

      {/* Features Filter */}
      <FilterSection title="Features" icon={Filter} sectionKey="features">
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {getFeatureOptions(placeType).map((feature) => (
            <div key={feature.value} className="flex items-center space-x-2">
              <Checkbox
                id={`feature-${feature.value}`}
                checked={filters.features?.includes(feature.value) || false}
                onCheckedChange={(checked) => {
                  const currentFeatures = filters.features || []
                  const newFeatures = checked
                    ? [...currentFeatures, feature.value]
                    : currentFeatures.filter(f => f !== feature.value)
                  
                  onFiltersChange({
                    ...filters,
                    features: newFeatures
                  })
                }}
              />
              <label
                htmlFor={`feature-${feature.value}`}
                className="text-sm cursor-pointer"
              >
                {feature.label}
              </label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Apply Filters Summary */}
      {hasActiveFilters && (
        <div className="p-3 bg-muted/50 text-xs text-muted-foreground">
          <p>Active filters will be applied to search results</p>
        </div>
      )}
    </div>
  )
}