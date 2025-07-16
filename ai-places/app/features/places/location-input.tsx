'use client'

import { useState } from 'react'
import { MapPin, Navigation, Search } from 'lucide-react'

import type { UserLocation, Coordinates } from '@/types/places'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocation } from '@/hooks/api/use-location'

interface LocationInputProps {
  currentLocation: UserLocation | null
  onLocationChange: (location: Coordinates) => void
  isLoading: boolean
  error: any
}

export function LocationInput({
  currentLocation,
  onLocationChange,
  isLoading,
  error,
}: LocationInputProps): JSX.Element {
  const [addressInput, setAddressInput] = useState('')
  const [isGeocoding, setIsGeocoding] = useState(false)
  
  const { 
    getCoordinates, 
    getAddress, 
    requestCurrentLocation,
    isManualLocation,
    useGPSLocation,
  } = useLocation()

  // Handle address search
  const handleAddressSearch = async () => {
    if (!addressInput.trim()) return
    
    setIsGeocoding(true)
    try {
      const coordinates = await getCoordinates(addressInput)
      onLocationChange(coordinates)
    } catch (error) {
      console.error('Geocoding failed:', error)
    } finally {
      setIsGeocoding(false)
    }
  }

  // Handle GPS location request
  const handleUseCurrentLocation = async () => {
    try {
      const location = await requestCurrentLocation()
      onLocationChange(location.current)
    } catch (error) {
      console.error('Failed to get current location:', error)
    }
  }

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddressSearch()
    }
  }

  return (
    <div className="space-y-3">
      {/* Current Location Display */}
      {currentLocation && (
        <div className="flex items-center gap-2 rounded-md bg-muted p-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Current Location</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentLocation.address || 
                `${currentLocation.current.lat.toFixed(4)}, ${currentLocation.current.lng.toFixed(4)}`}
            </p>
          </div>
          {isManualLocation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={useGPSLocation}
              className="text-xs"
            >
              Use GPS
            </Button>
          )}
        </div>
      )}

      {/* Address Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Enter address or location..."
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
            disabled={isGeocoding}
          />
        </div>
        <Button
          onClick={handleAddressSearch}
          disabled={!addressInput.trim() || isGeocoding}
          size="default"
        >
          {isGeocoding ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* GPS Location Button */}
      <Button
        variant="outline"
        onClick={handleUseCurrentLocation}
        disabled={isLoading}
        className="w-full"
      >
        <Navigation className="mr-2 h-4 w-4" />
        {isLoading ? 'Getting Location...' : 'Use My Current Location'}
      </Button>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm text-destructive">
            {error.message || 'Failed to get location'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please enter an address manually or check your location permissions.
          </p>
        </div>
      )}

      {/* Location Accuracy Info */}
      {currentLocation?.accuracy && (
        <div className="text-xs text-muted-foreground">
          Location accuracy: ±{Math.round(currentLocation.accuracy)}m
        </div>
      )}
    </div>
  )
}