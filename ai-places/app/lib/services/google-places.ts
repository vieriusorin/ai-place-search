import type {
  Coordinates,
  Place,
  PlaceSearchParams,
  PlaceSearchResult,
  Review,
} from '@/types/places'
import { PlaceType } from '@/types/places'
import { GoogleMapsLoader } from './google-maps'

/**
 * Google Places Service
 */
export class GooglePlacesService {
  /**
   * Search places based on parameters
   */
  static async searchPlaces(params: PlaceSearchParams): Promise<PlaceSearchResult> {
    await GoogleMapsLoader.loadGoogleMaps()
    
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      )
      
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(params.location.lat, params.location.lng),
        radius: params.radius,
        type: this.getGooglePlaceType(params.type),
        keyword: params.keyword,
        minPriceLevel: params.priceLevel ? Math.min(...params.priceLevel) : undefined,
        maxPriceLevel: params.priceLevel ? Math.max(...params.priceLevel) : undefined,
        openNow: params.openNow,
      }

      service.nearbySearch(request, (results, status, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places = results
            .filter(result => result.place_id && result.name)
            .map(result => this.convertGooglePlaceToPlace(result, params.location))
            .filter(place => {
              // Apply additional filters
              if (params.minRating && place.rating < params.minRating) return false
              return true
            })
          
          const searchResult: PlaceSearchResult = {
            places,
            totalFound: results.length,
            searchParams: params,
            searchTime: Date.now(),
            nextPageToken: pagination?.hasNextPage ? 'next_page_token' : undefined,
          }
          
          resolve(searchResult)
        } else {
          reject(new Error(`Places search failed: ${status}`))
        }
      })
    })
  }

  /**
   * Get detailed information about a place
   */
  static async getPlaceDetails(placeId: string): Promise<Place | null> {
    await GoogleMapsLoader.loadGoogleMaps()
    
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      )
      
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'geometry',
          'rating',
          'user_ratings_total',
          'price_level',
          'photos',
          'website',
          'formatted_phone_number',
          'opening_hours',
          'reviews'
        ],
      }

      service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(this.convertGooglePlaceDetailsToPlace(place))
        } else if (status === google.maps.places.PlacesServiceStatus.NOT_FOUND) {
          resolve(null)
        } else {
          reject(new Error(`Place details request failed: ${status}`))
        }
      })
    })
  }

  /**
   * Get places within viewport bounds
   */
  static async getPlacesInBounds(
    bounds: { northeast: Coordinates; southwest: Coordinates },
    type: PlaceType
  ): Promise<Place[]> {
    await GoogleMapsLoader.loadGoogleMaps()
    
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      )
      
      const request: google.maps.places.PlaceSearchRequest = {
        bounds: new google.maps.LatLngBounds(
          new google.maps.LatLng(bounds.southwest.lat, bounds.southwest.lng),
          new google.maps.LatLng(bounds.northeast.lat, bounds.northeast.lng)
        ),
        type: this.getGooglePlaceType(type),
      }

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const center = {
            lat: (bounds.northeast.lat + bounds.southwest.lat) / 2,
            lng: (bounds.northeast.lng + bounds.southwest.lng) / 2,
          }
          
          const places = results
            .filter(result => result.place_id && result.name)
            .map(result => this.convertGooglePlaceToPlace(result, center))
          
          resolve(places)
        } else {
          reject(new Error(`Places search failed: ${status}`))
        }
      })
    })
  }

  /**
   * Search places by text query
   */
  static async textSearch(query: string, location?: Coordinates): Promise<Place[]> {
    await GoogleMapsLoader.loadGoogleMaps()
    
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      )
      
      const request: google.maps.places.TextSearchRequest = {
        query,
        location: location ? new google.maps.LatLng(location.lat, location.lng) : undefined,
        radius: location ? 50000 : undefined, // 50km radius if location provided
      }

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places = results
            .filter(result => result.place_id && result.name)
            .map(result => this.convertGooglePlaceToPlace(result, location))
          
          resolve(places)
        } else {
          reject(new Error(`Text search failed: ${status}`))
        }
      })
    })
  }

  /**
   * Get place photo URL
   */
  static getPlacePhotoUrl(
    photoReference: string,
    maxWidth: number = 400,
    maxHeight: number = 400
  ): string | null {
    if (!GoogleMapsLoader.isGoogleMapsLoaded()) return null
    
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    )
    
    // Note: This is a simplified approach. In a real implementation,
    // you'd need to handle the photo reference properly
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&maxheight=${maxHeight}&photoreference=${photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  }

  /**
   * Convert Google Place Type to our PlaceType enum
   */
  private static getGooglePlaceType(placeType: PlaceType): string {
    switch (placeType) {
      case PlaceType.RESTAURANTS:
        return 'restaurant'
      case PlaceType.HOTELS:
        return 'lodging'
      case PlaceType.PARKINGS:
        return 'parking'
      default:
        return 'establishment'
    }
  }

  /**
   * Convert Google Places API result to our Place interface
   */
  private static convertGooglePlaceToPlace(
    googlePlace: google.maps.places.PlaceResult,
    userLocation?: Coordinates
  ): Place {
    const coordinates: Coordinates = {
      lat: googlePlace.geometry?.location?.lat() || 0,
      lng: googlePlace.geometry?.location?.lng() || 0,
    }

    // Calculate distance if user location is provided
    let distance: number | undefined
    if (userLocation) {
      distance = this.calculateDistance(userLocation, coordinates)
    }

    const place: Place = {
      id: googlePlace.place_id || '',
      name: googlePlace.name || '',
      address: googlePlace.formatted_address || googlePlace.vicinity || '',
      coordinates,
      rating: googlePlace.rating || 0,
      totalReviews: googlePlace.user_ratings_total || 0,
      priceLevel: googlePlace.price_level,
      photoUrl: googlePlace.photos?.[0] ? this.getPlacePhotoUrl(googlePlace.photos[0].photo_reference) : undefined,
      websiteUrl: googlePlace.website,
      phoneNumber: googlePlace.formatted_phone_number,
      openingHours: googlePlace.opening_hours?.weekday_text,
      reviews: [],
      distance,
    }

    return place
  }

  /**
   * Convert Google Place Details to our Place interface
   */
  private static convertGooglePlaceDetailsToPlace(
    googlePlace: google.maps.places.PlaceResult
  ): Place {
    const coordinates: Coordinates = {
      lat: googlePlace.geometry?.location?.lat() || 0,
      lng: googlePlace.geometry?.location?.lng() || 0,
    }

    const reviews: Review[] = (googlePlace.reviews || []).map((review, index) => ({
      id: `${googlePlace.place_id}_review_${index}`,
      author: review.author_name || 'Anonymous',
      rating: review.rating || 0,
      text: review.text || '',
      date: review.time ? new Date(review.time * 1000).toISOString() : new Date().toISOString(),
    }))

    const place: Place = {
      id: googlePlace.place_id || '',
      name: googlePlace.name || '',
      address: googlePlace.formatted_address || '',
      coordinates,
      rating: googlePlace.rating || 0,
      totalReviews: googlePlace.user_ratings_total || 0,
      priceLevel: googlePlace.price_level,
      photoUrl: googlePlace.photos?.[0] ? this.getPlacePhotoUrl(googlePlace.photos[0].photo_reference) : undefined,
      websiteUrl: googlePlace.website,
      phoneNumber: googlePlace.formatted_phone_number,
      openingHours: googlePlace.opening_hours?.weekday_text,
      reviews,
    }

    return place
  }

  /**
   * Simple distance calculation (Haversine formula)
   */
  private static calculateDistance(origin: Coordinates, destination: Coordinates): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = origin.lat * Math.PI / 180
    const φ2 = destination.lat * Math.PI / 180
    const Δφ = (destination.lat - origin.lat) * Math.PI / 180
    const Δλ = (destination.lng - origin.lng) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }
}