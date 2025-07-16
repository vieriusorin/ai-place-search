'use client'

import { forwardRef, useEffect, useState, useRef } from 'react'
import { MapPin, Loader2, AlertCircle, Navigation, Map, MoreHorizontal } from 'lucide-react'

import type { Coordinates, Place } from '@/types/places'
import { PlaceType } from '@/types/places'
import { cn } from '@/lib/utils'
import { GoogleMapsLoader } from '@/lib/services/google-maps'
import { useNavigationState } from '@/hooks/shared/use-navigation-state'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface MapContainerProps {
  isLoading?: boolean
  center?: Coordinates
  selectedPlaceType: PlaceType
  className?: string
  onLocationClick?: (location: Coordinates) => void
  markers?: Array<{
    id: string
    position: Coordinates
    type: PlaceType
    place: Place
    isSelected?: boolean
  }>
}

export const MapContainer = forwardRef<HTMLDivElement, MapContainerProps>(
  ({ isLoading = false, center, selectedPlaceType, className, onLocationClick, markers = [] }, _ref) => {
    const mapRef = useRef<HTMLDivElement>(null)
    const googleMapRef = useRef<google.maps.Map | null>(null)
    const markersRef = useRef<google.maps.Marker[]>([])
    const currentLocationMarkerRef = useRef<google.maps.Marker | null>(null)
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)
    const locationWatchIdRef = useRef<number | null>(null)
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
    const [mapError, setMapError] = useState<string | null>(null)
    
    // Navigation state from URL
    const { navigationMode, destinationId, isNavigating, isLiveNavigation, startNavigation, stopNavigation } = useNavigationState()
    
    // Find current destination from markers
    const currentDestination = markers.find(m => m.place.id === destinationId)?.place || null

    // Load Google Maps API
    useEffect(() => {
      const loadGoogleMaps = async () => {
        try {
          console.log('Loading Google Maps API...')
          await GoogleMapsLoader.loadGoogleMaps()
          console.log('Google Maps API loaded successfully')
          setIsGoogleMapsLoaded(true)
        } catch (error) {
          console.error('Failed to load Google Maps:', error)
          setMapError(error instanceof Error ? error.message : 'Failed to load Google Maps')
        }
      }

      loadGoogleMaps()
    }, [])

    // Initialize map
    useEffect(() => {
      if (!isGoogleMapsLoaded || !mapRef.current) return

      const defaultCenter = center || { lat: 44.4268, lng: 26.1025 } // Bucharest

      googleMapRef.current = new google.maps.Map(mapRef.current, {
        zoom: 13,
        center: defaultCenter,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      // Add click listener for location selection
      if (onLocationClick) {
        googleMapRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            onLocationClick({
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            })
          }
        })
      }

    }, [isGoogleMapsLoaded, center, onLocationClick])

    // Update map center when center prop changes
    useEffect(() => {
      if (googleMapRef.current && center) {
        googleMapRef.current.setCenter(center)
      }
    }, [center])

    // Update current location marker
    useEffect(() => {
      if (!googleMapRef.current || !center) return

      // Remove existing current location marker
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setMap(null)
      }

      // Create new current location marker
      currentLocationMarkerRef.current = new google.maps.Marker({
        position: center,
        map: googleMapRef.current,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        zIndex: 1000 // Ensure it appears above other markers
      })

      // Add info window for current location
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #4285F4;">📍 Your Location</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}
            </p>
          </div>
        `
      })

      currentLocationMarkerRef.current.addListener('click', () => {
        infoWindow.open(googleMapRef.current, currentLocationMarkerRef.current)
      })

    }, [center])

    // Update markers
    useEffect(() => {
      if (!googleMapRef.current) return

      // Clear existing markers
      markersRef.current.forEach(marker => {
        marker.setMap(null)
      })
      markersRef.current = []

      // Add new markers
      markers.forEach(markerData => {
        const marker = new google.maps.Marker({
          position: markerData.position,
          map: googleMapRef.current,
          title: markerData.place.name,
          icon: {
            url: getMarkerIcon(markerData.type, markerData.isSelected),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32)
          },
          animation: google.maps.Animation.DROP
        })

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: createInfoWindowContent(markerData.place)
        })

        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker)
          
          // Add event listeners to dropdown after info window opens
          google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
            const placeId = markerData.place.id.replace(/[^a-zA-Z0-9]/g, '_')
            
            const dropdownBtn = document.getElementById(`navigation-dropdown-${placeId}`)
            const dropdownMenu = document.getElementById(`dropdown-menu-${placeId}`)
            const staticRouteBtn = document.getElementById(`static-route-${placeId}`)
            const liveNavBtn = document.getElementById(`live-nav-${placeId}`)
            const googleMapsBtn = document.getElementById(`google-maps-${placeId}`)
            const stopNavBtn = document.getElementById(`stop-nav-${placeId}`)
            
            // Toggle dropdown
            if (dropdownBtn && dropdownMenu) {
              dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                const isVisible = dropdownMenu.style.display === 'block'
                dropdownMenu.style.display = isVisible ? 'none' : 'block'
              })
            }
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
              if (dropdownMenu) {
                dropdownMenu.style.display = 'none'
              }
            })
            
            // Handle dropdown actions
            if (staticRouteBtn) {
              staticRouteBtn.addEventListener('click', () => {
                handleStaticRoute(markerData.place)
                if (dropdownMenu) dropdownMenu.style.display = 'none'
              })
            }
            
            if (liveNavBtn) {
              liveNavBtn.addEventListener('click', () => {
                handleLiveNavigation(markerData.place)
                if (dropdownMenu) dropdownMenu.style.display = 'none'
              })
            }
            
            if (googleMapsBtn) {
              googleMapsBtn.addEventListener('click', () => {
                handleOpenInGoogleMaps(markerData.place)
                if (dropdownMenu) dropdownMenu.style.display = 'none'
              })
            }
            
            if (stopNavBtn) {
              stopNavBtn.addEventListener('click', () => {
                handleStopNavigation()
                if (dropdownMenu) dropdownMenu.style.display = 'none'
              })
            }
          })
        })

        markersRef.current.push(marker)
      })
    }, [markers, selectedPlaceType])

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        // Stop navigation
        if (locationWatchIdRef.current) {
          navigator.geolocation.clearWatch(locationWatchIdRef.current)
        }
        
        // Clean up markers
        if (currentLocationMarkerRef.current) {
          currentLocationMarkerRef.current.setMap(null)
        }
        markersRef.current.forEach(marker => {
          marker.setMap(null)
        })
        
        // Clean up directions
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setMap(null)
        }
      }
    }, [])

    // Get marker icon based on type and selection state
    const getMarkerIcon = (type: PlaceType, isSelected?: boolean): string => {
      const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/'
      const selectedSuffix = isSelected ? '-pushpin' : ''
      
      switch (type) {
        case PlaceType.RESTAURANTS:
          return `${baseUrl}restaurant${selectedSuffix}.png`
        case PlaceType.HOTELS:
          return `${baseUrl}lodging${selectedSuffix}.png`
        case PlaceType.PARKINGS:
          return `${baseUrl}parking${selectedSuffix}.png`
        default:
          return `${baseUrl}red-dot${selectedSuffix}.png`
      }
    }

    // Create info window content with dropdown
    const createInfoWindowContent = (place: Place): string => {
      const placeId = place.id.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize ID for DOM
      const isNavigatingToThis = isNavigating && currentDestination?.id === place.id
      
      return `
        <div style="padding: 8px; max-width: 220px;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${place.name}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${place.address}</p>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
            <span style="font-size: 12px;">⭐ ${place.rating}</span>
            <span style="font-size: 12px; color: #666;">(${place.totalReviews} reviews)</span>
          </div>
          ${isNavigatingToThis ? `
            <div style="background: #E8F5E8; padding: 6px; border-radius: 4px; margin-bottom: 8px;">
              <p style="margin: 0; font-size: 12px; color: #2D8A47; font-weight: bold;">
                🧭 ${isLiveNavigation ? 'Live Navigation' : 'Static Route'}
              </p>
              <p style="margin: 0; font-size: 11px; color: #666;">
                ${isLiveNavigation ? 'Route updates automatically as you move' : 'Static route displayed'}
              </p>
            </div>
          ` : ''}
          <div style="position: relative;">
            <button 
              id="navigation-dropdown-${placeId}"
              style="
                background: #4285F4;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                justify-content: space-between;
              "
              onmouseover="this.style.background='#3367D6'"
              onmouseout="this.style.background='#4285F4'"
            >
              <span>🧭 Navigation Options</span>
              <span style="font-size: 10px;">▼</span>
            </button>
            <div 
              id="dropdown-menu-${placeId}" 
              style="
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                z-index: 1000;
                margin-top: 2px;
              "
            >
              ${isNavigatingToThis ? `
                <div 
                  id="stop-nav-${placeId}"
                  style="
                    padding: 8px 12px;
                    font-size: 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
                    color: #EA4335;
                  "
                  onmouseover="this.style.background='#f5f5f5'"
                  onmouseout="this.style.background='white'"
                >
                  ⏹️ Stop Navigation
                </div>
              ` : ''}
              <div 
                id="static-route-${placeId}"
                style="
                  padding: 8px 12px;
                  font-size: 12px;
                  cursor: pointer;
                  border-bottom: 1px solid #eee;
                "
                onmouseover="this.style.background='#f5f5f5'"
                onmouseout="this.style.background='white'"
              >
                📍 Show Static Route
              </div>
              <div 
                id="live-nav-${placeId}"
                style="
                  padding: 8px 12px;
                  font-size: 12px;
                  cursor: pointer;
                  border-bottom: 1px solid #eee;
                "
                onmouseover="this.style.background='#f5f5f5'"
                onmouseout="this.style.background='white'"
              >
                🧭 Start Live Navigation
              </div>
              <div 
                id="google-maps-${placeId}"
                style="
                  padding: 8px 12px;
                  font-size: 12px;
                  cursor: pointer;
                  color: #34A853;
                "
                onmouseover="this.style.background='#f5f5f5'"
                onmouseout="this.style.background='white'"
              >
                🗺️ Open in Google Maps
              </div>
            </div>
          </div>
        </div>
      `
    }

    // Calculate and display route
    const calculateRoute = (origin: Coordinates, destination: Coordinates) => {
      const directionsService = new google.maps.DirectionsService()
      
      directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRendererRef.current?.setDirections(result)
          
          // Show route info only on initial calculation
          if (!isNavigating) {
            const route = result.routes[0]
            const leg = route.legs[0]
            
            const confirmNavigation = confirm(`🚗 Start Navigation to ${currentDestination?.name}?
            
📍 Distance: ${leg.distance?.text}
⏱️ Duration: ${leg.duration?.text}
📋 Steps: ${leg.steps?.length} steps

Click OK to start real-time navigation with live updates.
Click Cancel to just show the route.`)
            
            if (confirmNavigation) {
              startRealTimeNavigation()
            }
          }
        } else {
          alert('Could not calculate directions. Please try again.')
        }
      })
    }

    // Start real-time navigation
    const startRealTimeNavigation = () => {
      // Start watching user's location
      if (navigator.geolocation) {
        locationWatchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            
            // Update current location marker
            if (currentLocationMarkerRef.current) {
              currentLocationMarkerRef.current.setPosition(newLocation)
            }
            
            // Recalculate route from new position
            if (currentDestination) {
              calculateRoute(newLocation, currentDestination.coordinates)
            }
            
            // Center map on current location
            googleMapRef.current?.setCenter(newLocation)
          },
          (error) => {
            console.error('Error watching location:', error)
            alert('Could not track your location. Navigation will use static route.')
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 1000
          }
        )
      }
    }

    // Stop navigation using URL state
    const handleStopNavigation = () => {
      stopNavigation()
      
      // Stop watching location
      if (locationWatchIdRef.current) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current)
        locationWatchIdRef.current = null
      }
      
      // Clear directions
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null)
        directionsRendererRef.current = null
      }
    }

    // Handle static route
    const handleStaticRoute = (place: Place) => {
      if (!center) {
        alert('Current location not available. Please allow location access or set a location manually.')
        return
      }

      startNavigation(place.id, 'static')
    }

    // Handle live navigation
    const handleLiveNavigation = (place: Place) => {
      if (!center) {
        alert('Current location not available. Please allow location access or set a location manually.')
        return
      }

      startNavigation(place.id, 'live')
    }

    // Handle navigation state changes
    useEffect(() => {
      if (!center || !currentDestination) return

      // Create new directions renderer if not exists
      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          suppressMarkers: true, // Keep our custom markers
          polylineOptions: {
            strokeColor: '#4285F4',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        })
        directionsRendererRef.current.setMap(googleMapRef.current)
      }

      if (navigationMode === 'static') {
        // Show static route
        calculateRoute(center, currentDestination.coordinates)
      } else if (navigationMode === 'live') {
        // Start live navigation
        calculateRoute(center, currentDestination.coordinates)
        startRealTimeNavigation()
      } else if (navigationMode === 'none') {
        // Clear navigation
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setMap(null)
          directionsRendererRef.current = null
        }
        if (locationWatchIdRef.current) {
          navigator.geolocation.clearWatch(locationWatchIdRef.current)
          locationWatchIdRef.current = null
        }
      }
    }, [navigationMode, currentDestination, center])

    // Handle directions functionality
    const handleGetDirections = (place: Place) => {
      if (!center) {
        alert('Current location not available. Please allow location access or set a location manually.')
        return
      }

      // If already navigating, stop previous navigation
      if (isNavigating) {
        stopNavigation()
      }

      // Create new directions renderer
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // Keep our custom markers
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      })

      directionsRendererRef.current.setMap(googleMapRef.current)

      // Calculate initial route
      calculateRoute(center, place.coordinates)
    }

    const handleOpenInGoogleMaps = (place: Place) => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}&destination_place_id=${place.id}`
      window.open(url, '_blank')
    }

    // Handle retry
    const handleRetry = () => {
      setMapError(null)
      setIsGoogleMapsLoaded(false)
    }

    if (mapError) {
      return (
        <div className={cn(
          'flex h-full items-center justify-center bg-muted',
          className
        )}>
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Map Failed to Load</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {mapError}
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    console.log('MapContainer render - isGoogleMapsLoaded:', isGoogleMapsLoaded, 'isLoading:', isLoading)
    
    if (!isGoogleMapsLoaded || isLoading) {
      return (
        <div className={cn(
          'flex h-full items-center justify-center bg-muted',
          className
        )}>
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isLoading ? 'Loading places...' : 'Loading Google Maps...'}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className={cn('relative h-full w-full', className)}>
        {/* Map Container */}
        <div
          ref={mapRef}
          className="h-full w-full"
          style={{ minHeight: '400px' }}
        />
        
        {/* Map Overlay Info */}
        <div className="absolute top-4 left-4 rounded-lg bg-background/95 backdrop-blur p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Google Maps</p>
              <p className="text-xs text-muted-foreground">
                Click anywhere to set location
              </p>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 rounded-lg bg-background/95 backdrop-blur p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500 border-2 border-white"></div>
              <span className="text-xs">Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 border border-white"></div>
              <span className="text-xs capitalize">{selectedPlaceType}</span>
            </div>
          </div>
        </div>

        {/* Current Location Marker */}
        {center && (
          <div className="absolute pointer-events-none">
            {/* This will be handled by Google Maps API */}
          </div>
        )}
      </div>
    )
  }
)

MapContainer.displayName = 'MapContainer'