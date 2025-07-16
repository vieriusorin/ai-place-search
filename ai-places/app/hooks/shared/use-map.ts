import { useState, useCallback, useRef, useEffect } from 'react'
import { useDebounce } from './use-debounce'

import type {
  Coordinates,
  MapViewState,
  MapMarker,
  Place,
  PlaceType,
} from '@/types/places'

/**
 * Hook for managing Google Maps state and interactions
 */
export function useMap() {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [viewState, setViewState] = useState<MapViewState>({
    center: { lat: 44.4268, lng: 26.1025 }, // Bucharest default
    zoom: 13,
  })
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map())
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)

  // Check if we're on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true)
    }
  }, [])

  // Debounce map movement to avoid excessive API calls - only on client
  const debouncedCenter = useDebounce(viewState.center, 500)
  const debouncedZoom = useDebounce(viewState.zoom, 300)

  /**
   * Initialize Google Maps
   */
  const initializeMap = useCallback(async (container: HTMLDivElement) => {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        throw new Error('Cannot initialize map on server side')
      }
      
      // Wait for Google Maps to load if not already loaded
      if (!window.google) {
        throw new Error('Google Maps not loaded')
      }

      const map = new google.maps.Map(container, {
        center: viewState.center,
        zoom: viewState.zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      })

      // Set up map event listeners
      setupMapListeners(map)
      
      setMapInstance(map)
      setIsMapLoaded(true)
      
      return map
    } catch (error) {
      console.error('Failed to initialize map:', error)
      throw error
    }
  }, [viewState.center, viewState.zoom])

  /**
   * Set up map event listeners
   */
  const setupMapListeners = useCallback((map: google.maps.Map) => {
    // Handle map movement
    const handleCenterChanged = () => {
      const center = map.getCenter()
      if (center) {
        setViewState(prev => ({
          ...prev,
          center: { lat: center.lat(), lng: center.lng() },
        }))
      }
    }

    // Handle zoom changes
    const handleZoomChanged = () => {
      const zoom = map.getZoom()
      if (zoom !== undefined) {
        setViewState(prev => ({ ...prev, zoom }))
      }
    }

    // Handle map bounds changes
    const handleBoundsChanged = () => {
      const bounds = map.getBounds()
      if (bounds) {
        const ne = bounds.getNorthEast()
        const sw = bounds.getSouthWest()
        
        setViewState(prev => ({
          ...prev,
          bounds: {
            northeast: { lat: ne.lat(), lng: ne.lng() },
            southwest: { lat: sw.lat(), lng: sw.lng() },
          },
        }))
      }
    }

    // Handle drag events
    const handleDragStart = () => {
      setIsDragging(true)
      setIsUserInteracting(true)
    }

    const handleDragEnd = () => {
      setIsDragging(false)
      setIsUserInteracting(false)
    }

    // Handle click events
    const handleMapClick = (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const clickedLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        }
        
        // Close any open info windows
        closeInfoWindow()
        
        // Trigger location update callback
        onLocationClick?.(clickedLocation)
      }
    }

    // Add listeners
    map.addListener('center_changed', handleCenterChanged)
    map.addListener('zoom_changed', handleZoomChanged)
    map.addListener('bounds_changed', handleBoundsChanged)
    map.addListener('dragstart', handleDragStart)
    map.addListener('dragend', handleDragEnd)
    map.addListener('click', handleMapClick)

    // Cleanup function
    return () => {
      google.maps.event.clearInstanceListeners(map)
    }
  }, [])

  /**
   * Callback for location clicks (can be overridden)
   */
  const [onLocationClick, setOnLocationClick] = useState<
    ((location: Coordinates) => void) | null
  >(null)

  /**
   * Update map center
   */
  const setMapCenter = useCallback((center: Coordinates, zoom?: number) => {
    if (mapInstance) {
      mapInstance.setCenter(center)
      if (zoom !== undefined) {
        mapInstance.setZoom(zoom)
      }
    }
    
    setViewState(prev => ({
      ...prev,
      center,
      ...(zoom !== undefined && { zoom }),
    }))
  }, [mapInstance])

  /**
   * Fit map to bounds
   */
  const fitToBounds = useCallback((bounds: {
    northeast: Coordinates
    southwest: Coordinates
  }) => {
    if (mapInstance) {
      const googleBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds.southwest.lat, bounds.southwest.lng),
        new google.maps.LatLng(bounds.northeast.lat, bounds.northeast.lng)
      )
      
      mapInstance.fitBounds(googleBounds)
    }
  }, [mapInstance])

  /**
   * Add markers to map
   */
  const addMarkers = useCallback((newMarkers: MapMarker[]) => {
    if (!mapInstance) return

    // Clear existing markers
    clearMarkers()

    newMarkers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: mapInstance,
        title: markerData.place.name,
        icon: getMarkerIcon(markerData.type, markerData.isSelected),
        animation: google.maps.Animation.DROP,
      })

      // Add click listener
      marker.addListener('click', () => {
        selectMarker(markerData.id)
        showInfoWindow(marker, markerData.place)
      })

      markersRef.current.set(markerData.id, marker)
    })

    setMarkers(newMarkers)
  }, [mapInstance])

  /**
   * Clear all markers
   */
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      marker.setMap(null)
    })
    markersRef.current.clear()
    setMarkers([])
    setSelectedMarkerId(null)
  }, [])

  /**
   * Select a marker
   */
  const selectMarker = useCallback((markerId: string | null) => {
    setSelectedMarkerId(markerId)
    
    // Update marker icons
    markers.forEach(markerData => {
      const marker = markersRef.current.get(markerData.id)
      if (marker) {
        marker.setIcon(getMarkerIcon(markerData.type, markerData.id === markerId))
      }
    })
  }, [markers])

  /**
   * Show info window for place
   */
  const showInfoWindow = useCallback((marker: google.maps.Marker, place: Place) => {
    closeInfoWindow()

    const content = createInfoWindowContent(place)
    
    infoWindowRef.current = new google.maps.InfoWindow({
      content,
      maxWidth: 300,
    })

    infoWindowRef.current.open(mapInstance, marker)
  }, [mapInstance])

  /**
   * Close info window
   */
  const closeInfoWindow = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close()
      infoWindowRef.current = null
    }
  }, [])

  /**
   * Get marker icon based on type and selection state
   */
  const getMarkerIcon = useCallback((type: PlaceType, isSelected: boolean = false) => {
    const colors = {
      restaurants: isSelected ? '#ef4444' : '#f97316',
      parkings: isSelected ? '#3b82f6' : '#06b6d4',
      hotels: isSelected ? '#8b5cf6' : '#a855f7',
    }

    const color = colors[type] || '#6b7280'
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: isSelected ? 12 : 8,
    }
  }, [])

  /**
   * Create info window content
   */
  const createInfoWindowContent = useCallback((place: Place) => {
    const classification = place.aiAnalysis?.classification || 'unclassified'
    const classificationColor = {
      excellent: '#22c55e',
      very_good: '#84cc16',
      good: '#eab308',
      average: '#f97316',
      poor: '#ef4444',
      unclassified: '#6b7280',
    }[classification]

    return `
      <div style="padding: 8px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${place.name}</h3>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="color: #fbbf24;">★</span>
          <span style="font-weight: 500;">${place.rating}</span>
          <span style="color: #6b7280;">(${place.totalReviews} reviews)</span>
        </div>
        ${place.aiAnalysis ? `
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="
              background: ${classificationColor}; 
              color: white; 
              padding: 2px 8px; 
              border-radius: 12px; 
              font-size: 12px; 
              font-weight: 500;
              text-transform: capitalize;
            ">
              ${classification.replace('_', ' ')}
            </span>
          </div>
        ` : ''}
        <p style="margin: 6px 0; color: #6b7280; font-size: 14px;">${place.address}</p>
        ${place.distance ? `
          <p style="margin: 6px 0; color: #6b7280; font-size: 12px;">
            📍 ${Math.round(place.distance)}m away
          </p>
        ` : ''}
      </div>
    `
  }, [])

  /**
   * Pan to location smoothly
   */
  const panTo = useCallback((location: Coordinates) => {
    if (mapInstance) {
      mapInstance.panTo(location)
    }
  }, [mapInstance])

  /**
   * Set zoom level
   */
  const setZoom = useCallback((zoom: number) => {
    if (mapInstance) {
      mapInstance.setZoom(zoom)
    }
  }, [mapInstance])

  /**
   * Get current map bounds
   */
  const getCurrentBounds = useCallback(() => {
    if (!mapInstance) return null
    
    const bounds = mapInstance.getBounds()
    if (!bounds) return null
    
    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()
    
    return {
      northeast: { lat: ne.lat(), lng: ne.lng() },
      southwest: { lat: sw.lat(), lng: sw.lng() },
    }
  }, [mapInstance])

  // Effect to handle map container changes
  useEffect(() => {
    if (isClient && mapRef.current && !mapInstance) {
      initializeMap(mapRef.current)
    }
  }, [isClient, mapInstance, initializeMap])

  return {
    // Refs
    mapRef,
    
    // State
    mapInstance,
    isMapLoaded,
    viewState,
    markers,
    selectedMarkerId,
    isDragging,
    isUserInteracting,
    debouncedCenter,
    debouncedZoom,
    
    // Actions
    initializeMap,
    setMapCenter,
    fitToBounds,
    addMarkers,
    clearMarkers,
    selectMarker,
    showInfoWindow,
    closeInfoWindow,
    panTo,
    setZoom,
    getCurrentBounds,
    setOnLocationClick,
    
    // Utilities
    isGoogleMapsLoaded: Boolean(window.google?.maps),
  }
}