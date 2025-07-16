import type { Coordinates, UserLocation, GeolocationOptions } from '@/types/places'

// Declare Google Maps types
declare global {
  interface Window {
    google: typeof google
    initMap: () => void
  }
}

/**
 * Google Maps API configuration
 */
const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  libraries: ['places', 'geometry'],
  region: 'US',
  language: 'en',
}

/**
 * Google Maps Loader Service
 */
export class GoogleMapsLoader {
  private static isLoaded = false
  private static isLoading = false
  private static loadPromise: Promise<void> | null = null

  /**
   * Load Google Maps API
   */
  static async loadGoogleMaps(): Promise<void> {
    if (this.isLoaded) return Promise.resolve()
    
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise
    }

    console.log('Starting Google Maps load process...')
    console.log('API Key:', GOOGLE_MAPS_CONFIG.apiKey ? 'Present' : 'Missing')

    this.isLoading = true
    this.loadPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Maps can only be loaded in the browser'))
        return
      }

      if (window.google && window.google.maps) {
        console.log('Google Maps already loaded')
        this.isLoaded = true
        resolve()
        return
      }

      const script = document.createElement('script')
      const scriptSrc = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.apiKey}&libraries=${GOOGLE_MAPS_CONFIG.libraries.join(',')}&region=${GOOGLE_MAPS_CONFIG.region}&language=${GOOGLE_MAPS_CONFIG.language}&loading=async`
      console.log('Loading script:', scriptSrc)
      script.src = scriptSrc
      script.async = true
      script.defer = true
      
      script.onload = () => {
        console.log('Script loaded, checking for google.maps...')
        if (window.google && window.google.maps) {
          console.log('Google Maps API loaded successfully')
          this.isLoaded = true
          this.isLoading = false
          resolve()
        } else {
          console.error('Google Maps API script loaded but google.maps not available')
          this.isLoading = false
          reject(new Error('Google Maps API failed to load properly'))
        }
      }
      
      script.onerror = (error) => {
        console.error('Script failed to load:', error)
        this.isLoading = false
        reject(new Error('Failed to load Google Maps API'))
      }

      document.head.appendChild(script)
    })

    return this.loadPromise
  }

  /**
   * Check if Google Maps is loaded
   */
  static isGoogleMapsLoaded(): boolean {
    return this.isLoaded && typeof window !== 'undefined' && window.google && window.google.maps
  }
}

/**
 * Google Maps Geolocation Service
 */
export class GoogleMapsGeolocationService {
  /**
   * Get current user location using browser geolocation
   */
  static async getCurrentLocation(options?: GeolocationOptions): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 10000,
        maximumAge: options?.maximumAge ?? 300000, // 5 minutes
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            current: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }
          resolve(location)
        },
        (error) => {
          let errorMessage = 'Failed to get location'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }
          
          reject(new Error(errorMessage))
        },
        defaultOptions
      )
    })
  }

  /**
   * Get address from coordinates (reverse geocoding)
   */
  static async getAddressFromCoordinates(coordinates: Coordinates): Promise<string> {
    await GoogleMapsLoader.loadGoogleMaps()
    
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder()
      
      geocoder.geocode(
        { location: coordinates },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            resolve(results[0].formatted_address)
          } else {
            reject(new Error('Failed to get address from coordinates'))
          }
        }
      )
    })
  }

  /**
   * Get coordinates from address (geocoding)
   */
  static async getCoordinatesFromAddress(address: string): Promise<Coordinates> {
    await GoogleMapsLoader.loadGoogleMaps()
    
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder()
      
      geocoder.geocode(
        { address },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const location = results[0].geometry.location
            resolve({
              lat: location.lat(),
              lng: location.lng(),
            })
          } else {
            reject(new Error('Failed to get coordinates from address'))
          }
        }
      )
    })
  }

  /**
   * Watch user location for changes
   */
  static watchLocation(
    onSuccess: (location: UserLocation) => void,
    onError: (error: string) => void,
    options?: GeolocationOptions
  ): number {
    if (!navigator.geolocation) {
      onError('Geolocation is not supported by this browser')
      return -1
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 10000,
      maximumAge: options?.maximumAge ?? 60000, // 1 minute for watching
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        const location: UserLocation = {
          current: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }
        onSuccess(location)
      },
      (error) => {
        let errorMessage = 'Failed to watch location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        
        onError(errorMessage)
      },
      defaultOptions
    )
  }

  /**
   * Stop watching location
   */
  static clearWatch(watchId: number): void {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
    }
  }
}

/**
 * Google Maps Utility Service
 */
export class GoogleMapsUtils {
  /**
   * Calculate distance between two coordinates using Google Maps geometry
   */
  static async calculateDistance(origin: Coordinates, destination: Coordinates): Promise<number> {
    await GoogleMapsLoader.loadGoogleMaps()
    
    const originLatLng = new google.maps.LatLng(origin.lat, origin.lng)
    const destinationLatLng = new google.maps.LatLng(destination.lat, destination.lng)
    
    // Returns distance in meters
    return google.maps.geometry.spherical.computeDistanceBetween(originLatLng, destinationLatLng)
  }

  /**
   * Create bounds from coordinates array
   */
  static createBounds(coordinates: Coordinates[]): google.maps.LatLngBounds {
    const bounds = new google.maps.LatLngBounds()
    
    coordinates.forEach(coord => {
      bounds.extend(new google.maps.LatLng(coord.lat, coord.lng))
    })
    
    return bounds
  }

  /**
   * Get map type ID from string
   */
  static getMapTypeId(mapType: string): google.maps.MapTypeId {
    switch (mapType.toLowerCase()) {
      case 'satellite':
        return google.maps.MapTypeId.SATELLITE
      case 'hybrid':
        return google.maps.MapTypeId.HYBRID
      case 'terrain':
        return google.maps.MapTypeId.TERRAIN
      case 'roadmap':
      default:
        return google.maps.MapTypeId.ROADMAP
    }
  }
}