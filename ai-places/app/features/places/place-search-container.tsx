'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { PlaceType } from '@/types/places'
import { useLocation } from '@/hooks/api/use-location'
import { usePlacesSearch } from '@/hooks/api/use-places-search'
import { useMap } from '@/hooks/shared/use-map'

import { LocationInput } from './location-input'
import { PlaceTypeSelector } from './place-type-selector'
import { MapContainer } from './map-container'
import { PlacesList } from './places-list'
import { PlaceFilters } from './place-filters'
import { SearchStats } from './search-stats'
import { LoadingOverlay } from '@/components/shared/loading-overlay'
import { ErrorBoundary } from '@/components/shared/error-boundary'

export function PlacesSearchContainer(): JSX.Element {
  const searchParams = useSearchParams()
  const [selectedPlaceType, setSelectedPlaceType] = useState<PlaceType>(PlaceType.RESTAURANTS)
  const [showFilters, setShowFilters] = useState(false)

  // Hooks
  const {
    currentLocation,
    hasLocation,
    isLoadingLocation,
    locationError,
    setUserLocation,
    requestCurrentLocation,
  } = useLocation()

  const {
    searchByTypeAndLocation,
    filteredPlaces,
    selectedPlace,
    selectPlace,
    isSearching,
    searchError,
    searchStats,
    updateFilters,
    filters,
    enableAIAnalysis,
    setEnableAIAnalysis,
  } = usePlacesSearch()

  const {
    mapRef,
    isMapLoaded,
    addMarkers,
    selectMarker,
    setMapCenter,
    setOnLocationClick,
    debouncedCenter,
    viewState,
  } = useMap()

  // Handle URL parameters
  useEffect(() => {
    const typeParam = searchParams.get('type') as PlaceType
    if (typeParam && Object.values(PlaceType).includes(typeParam)) {
      setSelectedPlaceType(typeParam)
    }
  }, [searchParams])

  // Handle location changes
  useEffect(() => {
    if (currentLocation?.current && selectedPlaceType) {
      searchByTypeAndLocation(selectedPlaceType, currentLocation.current)
    }
  }, [currentLocation?.current, selectedPlaceType, searchByTypeAndLocation])

  // Handle map location clicks
  useEffect(() => {
    setOnLocationClick((location) => {
      setUserLocation(location)
    })
  }, [setUserLocation, setOnLocationClick])

  // Update map when location changes
  useEffect(() => {
    if (currentLocation?.current && isMapLoaded) {
      setMapCenter(currentLocation.current)
    }
  }, [currentLocation?.current, isMapLoaded, setMapCenter])

  // Update markers when places change
  useEffect(() => {
    if (filteredPlaces.length > 0 && isMapLoaded) {
      const markers = filteredPlaces.map(place => ({
        id: place.id,
        position: place.coordinates,
        type: selectedPlaceType,
        place,
        isSelected: selectedPlace?.id === place.id,
      }))
      
      addMarkers(markers)
    }
  }, [filteredPlaces, isMapLoaded, addMarkers, selectedPlaceType, selectedPlace?.id])

  // Handle place type change
  const handlePlaceTypeChange = (type: PlaceType) => {
    setSelectedPlaceType(type)
    if (currentLocation?.current) {
      searchByTypeAndLocation(type, currentLocation.current)
    }
  }

  // Handle place selection
  const handlePlaceSelect = (place: any) => {
    selectPlace(place)
    selectMarker(place?.id || null)
    
    if (place && isMapLoaded) {
      setMapCenter(place.coordinates, 16)
    }
  }

  // Request location on mount if not available
  useEffect(() => {
    if (!hasLocation && !isLoadingLocation) {
      requestCurrentLocation()
    }
  }, [hasLocation, isLoadingLocation, requestCurrentLocation])

  return (
    <ErrorBoundary>
      <div className="relative flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="flex w-96 flex-col border-r bg-background">
          {/* Search Controls */}
          <div className="border-b p-4 space-y-4">
            <LocationInput
              currentLocation={currentLocation}
              onLocationChange={setUserLocation}
              isLoading={isLoadingLocation}
              error={locationError}
            />
            
            <PlaceTypeSelector
              selectedType={selectedPlaceType}
              onTypeChange={handlePlaceTypeChange}
            />
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">
                  AI Analysis
                </label>
                <input
                  type="checkbox"
                  checked={enableAIAnalysis}
                  onChange={(e) => setEnableAIAnalysis(e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
            
            {showFilters && (
              <PlaceFilters
                filters={filters}
                onFiltersChange={updateFilters}
                placeType={selectedPlaceType}
              />
            )}
          </div>

          {/* Search Stats */}
          {searchStats.total > 0 && (
            <div className="border-b p-4">
              <SearchStats stats={searchStats} />
            </div>
          )}

          {/* Places List */}
          <div className="flex-1 overflow-hidden">
            <PlacesList
              places={filteredPlaces}
              selectedPlace={selectedPlace}
              onPlaceSelect={handlePlaceSelect}
              isLoading={isSearching}
              error={searchError}
              placeType={selectedPlaceType}
            />
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1">
          <MapContainer
            ref={mapRef}
            isLoading={!isMapLoaded}
            center={currentLocation?.current}
            selectedPlaceType={selectedPlaceType}
          />
          
          {/* Loading Overlay */}
          {(isLoadingLocation || isSearching) && (
            <LoadingOverlay
              message={
                isLoadingLocation 
                  ? 'Getting your location...' 
                  : `Searching for ${selectedPlaceType}...`
              }
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}