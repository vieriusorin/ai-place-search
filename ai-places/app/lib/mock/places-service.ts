import {
    Coordinates,
    Place,
    PlaceType,
    PlaceSearchParams,
    PlaceSearchResult,
    UserLocation,
    AIAnalysis,
    PlaceClassification,
  } from '@/types/places'
  import { generateMockPlaces, mockLocations, mockAIAnalyses } from './places-data'
  import { sleep } from '@/lib/utils'
  
  /**
   * Mock Google Maps Geolocation Service
   */
  export class MockGeolocationService {
    /**
     * Get current user location (mocked)
     */
    static async getCurrentLocation(): Promise<UserLocation> {
      await sleep(1500) // Simulate network delay
      
      // Simulate geolocation permission request
      const hasPermission = Math.random() > 0.1 // 90% success rate
      
      if (!hasPermission) {
        throw new Error('Geolocation permission denied')
      }
      
      // Return mock location (Bucharest by default)
      return {
        current: mockLocations.bucharest,
        accuracy: 10,
        timestamp: Date.now(),
        address: 'Bucharest, Romania',
      }
    }
  
    /**
     * Get address from coordinates (reverse geocoding)
     */
    static async getAddressFromCoordinates(coordinates: Coordinates): Promise<string> {
      await sleep(800)
      
      // Mock reverse geocoding
      const addresses = [
        'Calea Victoriei, Bucharest',
        'Piața Universității, Bucharest', 
        'Strada Lipscani, Bucharest',
        'Bulevardul Magheru, Bucharest',
        'Strada Franceză, Bucharest',
      ]
      
      return addresses[Math.floor(Math.random() * addresses.length)]
    }
  
    /**
     * Get coordinates from address (geocoding)
     */
    static async getCoordinatesFromAddress(address: string): Promise<Coordinates> {
      await sleep(1000)
      
      // Simple mock geocoding
      if (address.toLowerCase().includes('iasi')) {
        return mockLocations.iasi
      }
      if (address.toLowerCase().includes('cluj')) {
        return mockLocations.cluj
      }
      if (address.toLowerCase().includes('timisoara')) {
        return mockLocations.timisoara
      }
      if (address.toLowerCase().includes('constanta')) {
        return mockLocations.constanta
      }
      
      // Default to Bucharest with slight variation
      return {
        lat: mockLocations.bucharest.lat + (Math.random() - 0.5) * 0.01,
        lng: mockLocations.bucharest.lng + (Math.random() - 0.5) * 0.01,
      }
    }
  }
  
  /**
   * Mock Google Places Service
   */
  export class MockPlacesService {
    /**
     * Search places based on parameters
     */
    static async searchPlaces(params: PlaceSearchParams): Promise<PlaceSearchResult> {
      await sleep(2000) // Simulate API call delay
      
      // Generate mock places based on type
      const allPlaces = generateMockPlaces(params.type, params.location, 15)
      
      // Apply filters
      let filteredPlaces = allPlaces
      
      if (params.minRating) {
        filteredPlaces = filteredPlaces.filter(place => place.rating >= params.minRating!)
      }
      
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        filteredPlaces = filteredPlaces.filter(place => 
          place.name.toLowerCase().includes(keyword) ||
          place.address.toLowerCase().includes(keyword)
        )
      }
      
      // Sort by rating and distance
      filteredPlaces.sort((a, b) => {
        const ratingDiff = b.rating - a.rating
        if (Math.abs(ratingDiff) < 0.1) {
          return (a.distance || 0) - (b.distance || 0)
        }
        return ratingDiff
      })
      
      // Return top 10 results
      const places = filteredPlaces.slice(0, 10)
      
      return {
        places,
        totalFound: filteredPlaces.length,
        searchParams: params,
        searchTime: Date.now(),
        nextPageToken: filteredPlaces.length > 10 ? 'next_page_token_123' : undefined,
      }
    }
  
    /**
     * Get detailed information about a place
     */
    static async getPlaceDetails(placeId: string): Promise<Place | null> {
      await sleep(1000)
      
      // Mock finding place by ID
      const mockPlace = generateMockPlaces(PlaceType.RESTAURANTS, mockLocations.bucharest, 1)[0]
      
      if (!mockPlace) return null
      
      // Override with the requested ID
      return {
        ...mockPlace,
        id: placeId,
      }
    }
  
    /**
     * Get places within viewport bounds
     */
    static async getPlacesInBounds(
      bounds: { northeast: Coordinates; southwest: Coordinates },
      type: PlaceType
    ): Promise<Place[]> {
      await sleep(1500)
      
      // Calculate center of bounds
      const center: Coordinates = {
        lat: (bounds.northeast.lat + bounds.southwest.lat) / 2,
        lng: (bounds.northeast.lng + bounds.southwest.lng) / 2,
      }
      
      return generateMockPlaces(type, center, 12)
    }
  }
  
  /**
   * Mock OpenAI Service for review analysis
   */
  export class MockOpenAIService {
    /**
     * Analyze place reviews and classify the place
     */
    static async analyzePlaceReviews(place: Place): Promise<AIAnalysis> {
      await sleep(3000) // Simulate AI processing time
      
      // Calculate classification based on rating and review count
      const classification = this.getClassificationFromMetrics(place.rating, place.totalReviews)
      
      // Return mock analysis based on classification
      const baseAnalysis = mockAIAnalyses[classification]
      
      // Customize analysis based on place data
      return {
        ...baseAnalysis,
        summary: this.generateCustomSummary(place, classification),
        confidence: Math.random() * 0.2 + 0.8, // 0.8-1.0 confidence
      }
    }
  
    /**
     * Batch analyze multiple places
     */
    static async batchAnalyzePlaces(places: Place[]): Promise<Record<string, AIAnalysis>> {
      await sleep(4000) // Longer processing for batch
      
      const analyses: Record<string, AIAnalysis> = {}
      
      for (const place of places) {
        analyses[place.id] = await this.analyzePlaceReviews(place)
      }
      
      return analyses
    }
  
    /**
     * Get sentiment analysis of individual review
     */
    static async analyzeReviewSentiment(reviewText: string): Promise<{
      sentiment: 'positive' | 'neutral' | 'negative'
      confidence: number
      keywords: string[]
    }> {
      await sleep(1000)
      
      const positiveWords = ['great', 'amazing', 'excellent', 'wonderful', 'fantastic', 'perfect']
      const negativeWords = ['bad', 'terrible', 'awful', 'poor', 'disappointing', 'horrible']
      
      const text = reviewText.toLowerCase()
      const positiveCount = positiveWords.filter(word => text.includes(word)).length
      const negativeCount = negativeWords.filter(word => text.includes(word)).length
      
      let sentiment: 'positive' | 'neutral' | 'negative'
      if (positiveCount > negativeCount) {
        sentiment = 'positive'
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative'
      } else {
        sentiment = 'neutral'
      }
      
      return {
        sentiment,
        confidence: Math.random() * 0.3 + 0.7,
        keywords: [...positiveWords, ...negativeWords].filter(word => text.includes(word)),
      }
    }
  
    /**
     * Generate classification from metrics
     */
    private static getClassificationFromMetrics(
      rating: number,
      reviewCount: number
    ): PlaceClassification {
      // Consider both rating and review volume
      const confidenceMultiplier = Math.min(reviewCount / 100, 1) // More reviews = higher confidence
      const adjustedRating = rating * (0.7 + 0.3 * confidenceMultiplier)
      
      if (adjustedRating >= 4.5) return PlaceClassification.EXCELLENT
      if (adjustedRating >= 4.0) return PlaceClassification.VERY_GOOD
      if (adjustedRating >= 3.5) return PlaceClassification.GOOD
      if (adjustedRating >= 3.0) return PlaceClassification.AVERAGE
      return PlaceClassification.POOR
    }
  
    /**
     * Generate custom summary based on place data
     */
    private static generateCustomSummary(place: Place, classification: PlaceClassification): string {
      const baseTemplates = {
        [PlaceClassification.EXCELLENT]: [
          `${place.name} stands out as an exceptional choice with a ${place.rating}★ rating from ${place.totalReviews} reviews.`,
          `Highly acclaimed ${place.name} delivers outstanding experience consistently, earning ${place.rating}★ from ${place.totalReviews} satisfied customers.`
        ],
        [PlaceClassification.VERY_GOOD]: [
          `${place.name} is a very good option with ${place.rating}★ rating from ${place.totalReviews} reviews.`,
          `Well-regarded ${place.name} maintains high standards with ${place.rating}★ from ${place.totalReviews} visitors.`
        ],
        [PlaceClassification.GOOD]: [
          `${place.name} offers a solid experience with ${place.rating}★ rating from ${place.totalReviews} reviews.`,
          `Dependable choice ${place.name} provides good value with ${place.rating}★ from ${place.totalReviews} customers.`
        ],
        [PlaceClassification.AVERAGE]: [
          `${place.name} shows mixed results with ${place.rating}★ rating from ${place.totalReviews} reviews.`,
          `${place.name} delivers average performance with ${place.rating}★ from ${place.totalReviews} mixed reviews.`
        ],
        [PlaceClassification.POOR]: [
          `${place.name} has concerning reviews with ${place.rating}★ rating from ${place.totalReviews} reviews.`,
          `${place.name} shows consistent issues based on ${place.rating}★ from ${place.totalReviews} disappointed customers.`
        ],
      }
      
      const templates = baseTemplates[classification]
      return templates[Math.floor(Math.random() * templates.length)]
    }
  }
  
  /**
   * Mock Distance Matrix Service
   */
  export class MockDistanceService {
    /**
     * Calculate distance between two coordinates
     */
    static calculateDistance(origin: Coordinates, destination: Coordinates): number {
      const R = 6371 // Earth's radius in km
      const dLat = this.deg2rad(destination.lat - origin.lat)
      const dLng = this.deg2rad(destination.lng - origin.lng)
      
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(origin.lat)) * Math.cos(this.deg2rad(destination.lat)) * 
        Math.sin(dLng/2) * Math.sin(dLng/2)
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c * 1000 // Convert to meters
    }
  
    /**
     * Get travel time estimation
     */
    static async getTravelTime(
      origin: Coordinates,
      destination: Coordinates,
      mode: 'driving' | 'walking' | 'transit' = 'driving'
    ): Promise<{ distance: number; duration: number; durationText: string }> {
      await sleep(800)
      
      const distance = this.calculateDistance(origin, destination)
      
      // Estimate duration based on mode
      let speedKmh: number
      switch (mode) {
        case 'walking':
          speedKmh = 5
          break
        case 'transit':
          speedKmh = 25
          break
        case 'driving':
        default:
          speedKmh = 40
          break
      }
      
      const durationHours = distance / 1000 / speedKmh
      const duration = Math.round(durationHours * 3600) // Convert to seconds
      
      let durationText: string
      if (duration < 60) {
        durationText = `${duration} sec`
      } else if (duration < 3600) {
        durationText = `${Math.round(duration / 60)} min`
      } else {
        const hours = Math.floor(duration / 3600)
        const minutes = Math.round((duration % 3600) / 60)
        durationText = `${hours}h ${minutes}m`
      }
      
      return {
        distance: Math.round(distance),
        duration,
        durationText,
      }
    }
  
    private static deg2rad(deg: number): number {
      return deg * (Math.PI / 180)
    }
  }