/**
 * Types for the Places/Location feature
 */

/**
 * Geographic coordinates
 */
export interface Coordinates {
    lat: number
    lng: number
  }
  
  /**
   * Place types that can be searched
   */
  export enum PlaceType {
    RESTAURANTS = 'restaurants',
    PARKINGS = 'parkings',
    HOTELS = 'hotels',
  }
  
  /**
   * Place classification based on AI analysis
   */
  export enum PlaceClassification {
    EXCELLENT = 'excellent',      // 4.5+ rating, great reviews
    VERY_GOOD = 'very_good',     // 4.0-4.4 rating, good reviews
    GOOD = 'good',               // 3.5-3.9 rating, decent reviews
    AVERAGE = 'average',         // 3.0-3.4 rating, mixed reviews
    POOR = 'poor',               // Below 3.0 rating, bad reviews
  }
  
  /**
   * Review data structure
   */
  export interface Review {
    id: string
    author: string
    rating: number
    text: string
    date: string
    helpful?: number
  }
  
  /**
   * OpenAI analysis result
   */
  export interface AIAnalysis {
    classification: PlaceClassification
    confidence: number
    summary: string
    pros: string[]
    cons: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    keywords: string[]
  }
  
  /**
   * Place information from Google Places API
   */
  export interface Place {
    id: string
    name: string
    address: string
    coordinates: Coordinates
    rating: number
    totalReviews: number
    priceLevel?: number // 1-4 scale
    photoUrl?: string
    websiteUrl?: string
    phoneNumber?: string
    openingHours?: string[]
    reviews: Review[]
    aiAnalysis?: AIAnalysis
    distance?: number // in meters from user location
  }
  
  /**
   * Search parameters
   */
  export interface PlaceSearchParams {
    location: Coordinates
    type: PlaceType
    radius: number // in meters
    keyword?: string
    minRating?: number
    priceLevel?: number[]
    openNow?: boolean
  }
  
  /**
   * Search result with metadata
   */
  export interface PlaceSearchResult {
    places: Place[]
    totalFound: number
    searchParams: PlaceSearchParams
    searchTime: number
    nextPageToken?: string
  }
  
  /**
   * Map view state
   */
  export interface MapViewState {
    center: Coordinates
    zoom: number
    bounds?: {
      northeast: Coordinates
      southwest: Coordinates
    }
  }
  
  /**
   * User location data
   */
  export interface UserLocation {
    current: Coordinates
    accuracy?: number
    timestamp: number
    address?: string
  }
  
  /**
   * Filter options for places
   */
  export interface PlaceFilters {
    rating: {
      min: number
      max: number
    }
    priceLevel: number[]
    openNow: boolean
    distance: {
      max: number // in km
    }
    features: string[] // wheelchair_accessible, outdoor_seating, etc.
  }
  
  /**
   * Place details for popover/modal
   */
  export interface PlaceDetails extends Place {
    description?: string
    amenities: string[]
    busyTimes?: Array<{
      day: number // 0-6 (Sunday-Saturday)
      hours: number[] // 0-23, busy level 0-100
    }>
    popularTimes?: string[]
    similarPlaces?: string[] // Place IDs
  }
  
  /**
   * Map marker data
   */
  export interface MapMarker {
    id: string
    position: Coordinates
    type: PlaceType
    place: Place
    isSelected?: boolean
    clustered?: boolean
  }
  
  /**
   * Geolocation options
   */
  export interface GeolocationOptions {
    enableHighAccuracy?: boolean
    timeout?: number
    maximumAge?: number
  }
  
  /**
   * Error types for the places feature
   */
  export enum PlacesErrorType {
    GEOLOCATION_DENIED = 'geolocation_denied',
    GEOLOCATION_UNAVAILABLE = 'geolocation_unavailable',
    GEOLOCATION_TIMEOUT = 'geolocation_timeout',
    GOOGLE_MAPS_ERROR = 'google_maps_error',
    GOOGLE_PLACES_ERROR = 'google_places_error',
    OPENAI_ERROR = 'openai_error',
    NETWORK_ERROR = 'network_error',
    INVALID_LOCATION = 'invalid_location',
    NO_RESULTS = 'no_results',
  }
  
  /**
   * Places feature error
   */
  export interface PlacesError {
    type: PlacesErrorType
    message: string
    details?: any
    retryable?: boolean
  }
  
  /**
   * Loading states for different operations
   */
  export interface PlacesLoadingState {
    searchingPlaces: boolean
    loadingLocation: boolean
    analyzingWithAI: boolean
    loadingPlaceDetails: boolean
  }
  
  /**
   * Configuration for the places feature
   */
  export interface PlacesConfig {
    googleMapsApiKey: string
    openAiApiKey: string
    defaultRadius: number
    maxResults: number
    enableAIAnalysis: boolean
    defaultLocation: Coordinates
    mapStyles?: google.maps.MapTypeStyle[]
  }
  
  /**
   * Place type configuration
   */
  export interface PlaceTypeConfig {
    type: PlaceType
    label: string
    icon: string
    googlePlaceType: string
    color: string
    description: string
  }
  
  /**
   * Search history item
   */
  export interface SearchHistoryItem {
    id: string
    query: string
    location: Coordinates
    type: PlaceType
    timestamp: number
    resultCount: number
  }
  
  /**
   * User preferences for places
   */
  export interface PlacesUserPreferences {
    defaultSearchRadius: number
    preferredPriceLevel: number[]
    savedFilters: PlaceFilters
    favoriteTypes: PlaceType[]
    searchHistory: SearchHistoryItem[]
    savedPlaces: string[] // Place IDs
  }