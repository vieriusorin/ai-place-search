'use client'

import { useState } from 'react'
import {
  X,
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  DollarSign,
  Navigation,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  Heart,
  Share2,
} from 'lucide-react'

import type { Place, PlaceClassification } from '@/types/places'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PlaceClassificationCard } from './place-classification-badge'

interface PlaceDetailsPopoverProps {
  place: Place
  isOpen: boolean
  onClose: () => void
  onDirections?: () => void
  onSave?: () => void
  onShare?: () => void
  className?: string
}

export function PlaceDetailsPopover({
  place,
  isOpen,
  onClose,
  onDirections,
  onSave,
  onShare,
  className,
}: PlaceDetailsPopoverProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'photos'>('overview')
  const [imageLoaded, setImageLoaded] = useState(false)

  if (!isOpen) return <></>

  const formatDistance = (distance?: number) => {
    if (!distance) return null
    if (distance < 1000) {
      return `${Math.round(distance)}m away`
    }
    return `${(distance / 1000).toFixed(1)}km away`
  }

  const formatPriceLevel = (level?: number) => {
    if (!level) return null
    return {
      1: 'Budget-friendly',
      2: 'Moderate',
      3: 'Expensive',
      4: 'Very Expensive',
    }[level] || 'Unknown'
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-yellow-600'
    if (rating >= 3.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getClassificationColor = (classification: PlaceClassification) => {
    const colors = {
      excellent: 'text-green-600',
      very_good: 'text-blue-600',
      good: 'text-yellow-600',
      average: 'text-orange-600',
      poor: 'text-red-600',
    }
    return colors[classification] || 'text-gray-600'
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4',
        className
      )}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">{place.name}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Hero Section */}
          <div className="relative">
            {place.photoUrl && (
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={place.photoUrl}
                  alt={place.name}
                  className={cn(
                    'h-full w-full object-cover transition-opacity',
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            )}
            
            {/* Quick Stats Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-lg bg-background/95 backdrop-blur px-3 py-2">
                <Star className={cn('h-4 w-4 fill-current', getRatingColor(place.rating))} />
                <span className="font-medium">{place.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({place.totalReviews} reviews)
                </span>
              </div>
              
              {place.distance && (
                <div className="flex items-center gap-2 rounded-lg bg-background/95 backdrop-blur px-3 py-2">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDistance(place.distance)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{place.address}</span>
              </div>
              
              {place.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${place.phoneNumber}`}
                    className="text-sm text-primary hover:underline"
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
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              
              {place.priceLevel && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatPriceLevel(place.priceLevel)}</span>
                </div>
              )}
            </div>

            {/* AI Analysis */}
            {place.aiAnalysis && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold">AI Analysis</h3>
                </div>
                
                <PlaceClassificationCard
                  classification={place.aiAnalysis.classification}
                  confidence={place.aiAnalysis.confidence}
                  summary={place.aiAnalysis.summary}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {place.aiAnalysis.pros.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {place.aiAnalysis.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {place.aiAnalysis.cons.length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-600 mb-2">Areas for Improvement</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {place.aiAnalysis.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {place.openingHours && place.openingHours.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Opening Hours</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-1 text-sm">
                  {place.openingHours.map((hours, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {place.reviews && place.reviews.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Recent Reviews</h3>
                </div>
                
                <div className="space-y-4">
                  {place.reviews.map((review) => (
                    <div key={review.id} className="border-l-2 border-muted pl-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                            <span className="font-medium">{review.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{review.author}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{review.text}</p>
                      
                      {review.helpful && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          {review.helpful} people found this helpful
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={onDirections}
              className="flex-1"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Directions
            </Button>
            
            <Button
              variant="outline"
              onClick={onSave}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Save
            </Button>
            
            <Button
              variant="outline"
              onClick={onShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}