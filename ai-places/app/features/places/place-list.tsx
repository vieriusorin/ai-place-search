'use client'

import { useState } from 'react'
import { Star, MapPin, Phone, Globe, Clock, Loader2 } from 'lucide-react'

import type { Place, PlaceType } from '@/types/places'
import { cn } from '@/lib/utils'
import { PlaceCard } from './place-card'
import { PlaceDetailsPopover } from './place-details-popover'

interface PlacesListProps {
  places: Place[]
  selectedPlace: Place | null
  onPlaceSelect: (place: Place) => void
  isLoading: boolean
  error: any
  placeType: PlaceType
}

export function PlacesList({
  places,
  selectedPlace,
  onPlaceSelect,
  isLoading,
  error,
  placeType,
}: PlacesListProps): JSX.Element {
  const [expandedPlace, setExpandedPlace] = useState<string | null>(null)

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <MapPin className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Search Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || 'Failed to load places'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            Searching for {placeType}...
          </p>
        </div>
      </div>
    )
  }

  if (places.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Places Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your search location or filters
          </p>
          <div className="text-xs text-muted-foreground">
            <p>• Make sure location services are enabled</p>
            <p>• Try a different area or expand search radius</p>
            <p>• Check if filters are too restrictive</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-3">
        {places.map((place, index) => (
          <PlaceCard
            key={place.id}
            place={place}
            index={index + 1}
            isSelected={selectedPlace?.id === place.id}
            isExpanded={expandedPlace === place.id}
            onSelect={() => onPlaceSelect(place)}
            onToggleExpand={() => 
              setExpandedPlace(expandedPlace === place.id ? null : place.id)
            }
            placeType={placeType}
          />
        ))}
        
        {/* Load More Button (for future pagination) */}
        {places.length >= 10 && (
          <div className="pt-4">
            <button
              disabled
              className="w-full rounded-md border border-dashed border-muted-foreground/25 p-4 text-sm text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/25"
            >
              Load More Places (Coming Soon)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlacesList