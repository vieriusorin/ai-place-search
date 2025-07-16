'use client'

import { forwardRef, useEffect, useState } from 'react'
import { MapPin, Loader2, AlertCircle } from 'lucide-react'

import type { Coordinates, PlaceType } from '@/types/places'
import { cn } from '@/lib/utils'

interface MapContainerProps {
  isLoading?: boolean
  center?: Coordinates
  selectedPlaceType: PlaceType
  className?: string
}

export const MapContainer = forwardRef<HTMLDivElement, MapContainerProps>(
  ({ isLoading = false, center, selectedPlaceType, className }, ref) => {
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
    const [mapError, setMapError] = useState<string | null>(null)

    // Mock Google Maps loading
    useEffect(() => {
      const loadGoogleMaps = async () => {
        try {
          // In a real implementation, you would load Google Maps API here
          // For now, we'll simulate loading
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Mock Google Maps API
          if (!window.google) {
            (window as any).google = {
              maps: {
                Map: class MockMap {
                  constructor(container: HTMLElement, options: any) {
                    // Create a visual representation
                    container.innerHTML = `
                      <div style="
                        width: 100%; 
                        height: 100%; 
                        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        overflow: hidden;
                      ">
                        <!-- Streets -->
                        <div style="
                          position: absolute;
                          width: 200%;
                          height: 2px;
                          background: #fff;
                          top: 30%;
                          left: -50%;
                          opacity: 0.8;
                        "></div>
                        <div style="
                          position: absolute;
                          width: 2px;
                          height: 200%;
                          background: #fff;
                          left: 40%;
                          top: -50%;
                          opacity: 0.8;
                        "></div>
                        <div style="
                          position: absolute;
                          width: 200%;
                          height: 2px;
                          background: #fff;
                          top: 70%;
                          left: -50%;
                          opacity: 0.8;
                        "></div>
                        <div style="
                          position: absolute;
                          width: 2px;
                          height: 200%;
                          background: #fff;
                          left: 65%;
                          top: -50%;
                          opacity: 0.8;
                        "></div>
                        
                        <!-- User Location -->
                        <div style="
                          position: absolute;
                          width: 20px;
                          height: 20px;
                          background: #2563eb;
                          border: 3px solid #fff;
                          border-radius: 50%;
                          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
                          left: 50%;
                          top: 50%;
                          transform: translate(-50%, -50%);
                          z-index: 10;
                        "></div>
                        
                        <!-- Mock Places -->
                        <div style="
                          position: absolute;
                          width: 12px;
                          height: 12px;
                          background: #f97316;
                          border: 2px solid #fff;
                          border-radius: 50%;
                          left: 35%;
                          top: 35%;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        "></div>
                        <div style="
                          position: absolute;
                          width: 12px;
                          height: 12px;
                          background: #f97316;
                          border: 2px solid #fff;
                          border-radius: 50%;
                          left: 60%;
                          top: 40%;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        "></div>
                        <div style="
                          position: absolute;
                          width: 12px;
                          height: 12px;
                          background: #f97316;
                          border: 2px solid #fff;
                          border-radius: 50%;
                          left: 45%;
                          top: 65%;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        "></div>
                        <div style="
                          position: absolute;
                          width: 12px;
                          height: 12px;
                          background: #f97316;
                          border: 2px solid #fff;
                          border-radius: 50%;
                          left: 70%;
                          top: 25%;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        "></div>
                        
                        <!-- Map Controls -->
                        <div style="
                          position: absolute;
                          top: 10px;
                          right: 10px;
                          display: flex;
                          flex-direction: column;
                          gap: 2px;
                        ">
                          <button style="
                            width: 40px;
                            height: 40px;
                            background: #fff;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            font-size: 18px;
                            font-weight: bold;
                            cursor: pointer;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                          ">+</button>
                          <button style="
                            width: 40px;
                            height: 40px;
                            background: #fff;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            font-size: 18px;
                            font-weight: bold;
                            cursor: pointer;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                          ">−</button>
                        </div>
                        
                        <!-- Map Type Indicator -->
                        <div style="
                          position: absolute;
                          bottom: 10px;
                          left: 10px;
                          background: rgba(255, 255, 255, 0.9);
                          padding: 8px 12px;
                          border-radius: 4px;
                          font-size: 12px;
                          font-weight: 500;
                          color: #666;
                          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">
                          Map view • ${selectedPlaceType}
                        </div>
                      </div>
                    `
                  }
                  
                  setCenter() {}
                  setZoom() {}
                  addListener() {}
                  panTo() {}
                  fitBounds() {}
                  getBounds() { return null }
                  getCenter() { return null }
                  getZoom() { return 13 }
                },
                Marker: class MockMarker {
                  constructor(options: any) {}
                  setMap() {}
                  setIcon() {}
                  addListener() {}
                },
                InfoWindow: class MockInfoWindow {
                  constructor(options: any) {}
                  open() {}
                  close() {}
                },
                LatLng: class MockLatLng {
                  constructor(lat: number, lng: number) {}
                  lat() { return 0 }
                  lng() { return 0 }
                },
                LatLngBounds: class MockLatLngBounds {
                  constructor(sw: any, ne: any) {}
                  getNorthEast() { return new (window as any).google.maps.LatLng(0, 0) }
                  getSouthWest() { return new (window as any).google.maps.LatLng(0, 0) }
                },
                SymbolPath: {
                  CIRCLE: 0,
                },
                Animation: {
                  DROP: 1,
                },
                event: {
                  clearInstanceListeners() {},
                },
              },
            }
          }
          
          setIsGoogleMapsLoaded(true)
        } catch (error) {
          setMapError('Failed to load map')
          console.error('Failed to load Google Maps:', error)
        }
      }

      loadGoogleMaps()
    }, [selectedPlaceType])

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
              onClick={() => {
                setMapError(null)
                setIsGoogleMapsLoaded(false)
              }}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    if (!isGoogleMapsLoaded || isLoading) {
      return (
        <div className={cn(
          'flex h-full items-center justify-center bg-muted',
          className
        )}>
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isLoading ? 'Loading map...' : 'Initializing map...'}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className={cn('relative h-full w-full', className)}>
        {/* Map Container */}
        <div
          ref={ref}
          className="h-full w-full"
          style={{ minHeight: '400px' }}
        />
        
        {/* Map Overlay Info */}
        <div className="absolute top-4 left-4 rounded-lg bg-background/95 backdrop-blur p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Interactive Map</p>
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
              <div className="h-3 w-3 rounded-full bg-orange-500 border border-white"></div>
              <span className="text-xs capitalize">{selectedPlaceType}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

MapContainer.displayName = 'MapContainer'