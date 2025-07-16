'use client'

import { useState } from 'react'
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  DollarSign,
  Navigation,
  ExternalLink,
} from 'lucide-react'

import type { Place, PlaceType, PlaceClassification } from '@/types/places'
import { cn } from '@/lib/utils'
import { PlaceClassificationBadge } from './place-classification-badge'
import { PlaceDetailsPopover } from './place-details-popover'

interface PlaceCardProps {
  place: Place
  index: number
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onToggleExpand: () => void
  placeType: PlaceType
}

export function PlaceCard({
  place,
  index,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  placeType,
}: PlaceCardProps): JSX.Element {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const formatDistance = (distance?: number) => {
    if (!distance) return null
    if (distance < 1000) {
      return `${Math.round(distance)}m`
    }
    return `${(distance / 1000).toFixed(1)}km`
  }

  const formatPriceLevel = (level?: number) => {
    if (!level) return null
    return '$'.repeat(level)
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-yellow-600'
    if (rating >= 3.5) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md cursor-pointer',
        isSelected && 'ring-2 ring-primary ring-offset-2 shadow-md'
      )}
      onClick={onSelect}
    >
      {/* Ranking Badge */}
      <div className="absolute -top-2 -left-2 z-10">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {index}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight truncate">
              {place.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {place.address}
            </p>
          </div>
          
          {/* Place Image */}
          {place.photoUrl && !imageError && (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
              <img
                src={place.photoUrl}
                alt={place.name}
                className={cn(
                  'w-full h-full object-cover transition-opacity',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className={cn('h-4 w-4 fill-current', getRatingColor(place.rating))} />
            <span className="font-medium">{place.rating}</span>
            <span className="text-muted-foreground">
              ({place.totalReviews} reviews)
            </span>
          </div>
          
          {place.distance && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Navigation className="h-3 w-3" />
              <span>{formatDistance(place.distance)}</span>
            </div>
          )}
          
          {place.priceLevel && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>{formatPriceLevel(place.priceLevel)}</span>
            </div>
          )}
        </div>

        {/* AI Analysis Badge */}
        {place.aiAnalysis && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <PlaceClassificationBadge 
              classification={place.aiAnalysis.classification}
              confidence={place.aiAnalysis.confidence}
            />
          </div>
        )}

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            {/* Contact Info */}
            <div className="grid grid-cols-1 gap-2 text-sm">
              {place.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${place.phoneNumber}`}
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {place.phoneNumber}
                  </a>
                </div>
              )}
              
              {place.websiteUrl && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={place.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Opening Hours */}
            {place.openingHours && place.openingHours.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Opening Hours
                </div>
                <div className="text-xs text-muted-foreground space-y-1 ml-6">
                  {place.openingHours.slice(0, 3).map((hours, idx) => (
                    <div key={idx}>{hours}</div>
                  ))}
                  {place.openingHours.length > 3 && (
                    <div className="text-muted-foreground">
                      +{place.openingHours.length - 3} more days
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Analysis Summary */}
            {place.aiAnalysis && (
              <div className="space-y-2">
                <div className="text-sm font-medium">AI Insights</div>
                <p className="text-sm text-muted-foreground">
                  {place.aiAnalysis.summary}
                </p>
                
                {place.aiAnalysis.pros.length > 0 && (
                  <div className="text-xs">
                    <div className="font-medium text-green-600 mb-1">Pros:</div>
                    <ul className="text-muted-foreground space-y-1">
                      {place.aiAnalysis.pros.slice(0, 2).map((pro, idx) => (
                        <li key={idx}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {place.aiAnalysis.cons.length > 0 && (
                  <div className="text-xs">
                    <div className="font-medium text-orange-600 mb-1">Cons:</div>
                    <ul className="text-muted-foreground space-y-1">
                      {place.aiAnalysis.cons.slice(0, 2).map((con, idx) => (
                        <li key={idx}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Recent Reviews */}
            {place.reviews && place.reviews.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Recent Reviews</div>
                <div className="space-y-2">
                  {place.reviews.slice(0, 2).map((review) => (
                    <div key={review.id} className="text-xs border-l-2 border-muted pl-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current text-yellow-500" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                        <span className="text-muted-foreground">{review.author}</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expand Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand()
          }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2 border-t"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show More
            </>
          )}
        </button>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg border-2 border-primary pointer-events-none" />
      )}
    </div>
  )
}