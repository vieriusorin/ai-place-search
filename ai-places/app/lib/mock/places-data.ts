import {
    Place,
    PlaceType,
    PlaceClassification,
    Review,
    AIAnalysis,
    Coordinates,
    PlaceDetails,
  } from '@/types/places'
  
  /**
   * Mock coordinates for different cities
   */
  export const mockLocations: Record<string, Coordinates> = {
    bucharest: { lat: 44.4268, lng: 26.1025 },
    iasi: { lat: 47.1585, lng: 27.6014 },
    cluj: { lat: 46.7712, lng: 23.6236 },
    timisoara: { lat: 45.7489, lng: 21.2087 },
    constanta: { lat: 44.1598, lng: 28.6348 },
  }
  
  /**
   * Mock reviews data
   */
  export const mockReviews: Review[] = [
    {
      id: '1',
      author: 'John Doe',
      rating: 5,
      text: 'Amazing food and great service! The pasta was perfectly cooked and the atmosphere was wonderful.',
      date: '2024-01-15',
      helpful: 12,
    },
    {
      id: '2',
      author: 'Maria Popescu',
      rating: 4,
      text: 'Good restaurant with nice ambiance. Food was tasty but a bit overpriced.',
      date: '2024-01-10',
      helpful: 8,
    },
    {
      id: '3',
      author: 'Alex Johnson',
      rating: 3,
      text: 'Average experience. Food was okay but service was slow.',
      date: '2024-01-05',
      helpful: 3,
    },
    {
      id: '4',
      author: 'Elena Ionescu',
      rating: 5,
      text: 'Exceptional dining experience! Every dish was perfectly prepared.',
      date: '2024-01-12',
      helpful: 15,
    },
    {
      id: '5',
      author: 'David Smith',
      rating: 2,
      text: 'Disappointing meal. Food was cold and service was poor.',
      date: '2024-01-08',
      helpful: 5,
    },
  ]
  
  /**
   * Mock AI analysis data
   */
  export const mockAIAnalyses: Record<PlaceClassification, AIAnalysis> = {
    [PlaceClassification.EXCELLENT]: {
      classification: PlaceClassification.EXCELLENT,
      confidence: 0.92,
      summary: 'Outstanding establishment with consistently excellent reviews. Customers praise the quality, service, and atmosphere.',
      pros: ['Exceptional food quality', 'Outstanding service', 'Great atmosphere', 'Consistent experience'],
      cons: ['Higher price point', 'Sometimes busy'],
      sentiment: 'positive',
      keywords: ['amazing', 'excellent', 'outstanding', 'perfect', 'wonderful'],
    },
    [PlaceClassification.VERY_GOOD]: {
      classification: PlaceClassification.VERY_GOOD,
      confidence: 0.87,
      summary: 'Very good place with mostly positive reviews. Minor areas for improvement but overall highly recommended.',
      pros: ['Good food quality', 'Friendly staff', 'Nice location'],
      cons: ['Slightly expensive', 'Occasional service delays'],
      sentiment: 'positive',
      keywords: ['good', 'nice', 'friendly', 'recommended', 'quality'],
    },
    [PlaceClassification.GOOD]: {
      classification: PlaceClassification.GOOD,
      confidence: 0.75,
      summary: 'Solid choice with decent reviews. Good value for money with room for improvement.',
      pros: ['Reasonable prices', 'Decent food', 'Good location'],
      cons: ['Service could be better', 'Limited menu options'],
      sentiment: 'neutral',
      keywords: ['decent', 'reasonable', 'okay', 'fair', 'acceptable'],
    },
    [PlaceClassification.AVERAGE]: {
      classification: PlaceClassification.AVERAGE,
      confidence: 0.68,
      summary: 'Mixed reviews with average performance. Some customers satisfied, others disappointed.',
      pros: ['Affordable prices', 'Central location'],
      cons: ['Inconsistent quality', 'Service issues', 'Limited options'],
      sentiment: 'neutral',
      keywords: ['average', 'mixed', 'inconsistent', 'basic', 'standard'],
    },
    [PlaceClassification.POOR]: {
      classification: PlaceClassification.POOR,
      confidence: 0.81,
      summary: 'Consistently poor reviews citing quality and service issues. Not recommended.',
      pros: ['Low prices'],
      cons: ['Poor food quality', 'Bad service', 'Unclean environment', 'Long wait times'],
      sentiment: 'negative',
      keywords: ['poor', 'bad', 'terrible', 'disappointing', 'avoid'],
    },
  }
  
  /**
   * Generate mock restaurants
   */
  export const generateMockRestaurants = (center: Coordinates, count: number = 10): Place[] => {
    const restaurantNames = [
      'La Mama', 'Trattoria Italiana', 'Sushi Zen', 'Burger Palace', 'Café Central',
      'Bistro Modern', 'Pizza Corner', 'Thai Garden', 'Steakhouse Premium', 'Vegan Delight',
      'French Brasserie', 'Mexican Cantina', 'Fish & Chips', 'Pasta House', 'BBQ Pit'
    ]
  
    return Array.from({ length: count }, (_, index) => {
      const rating = Math.random() * 2 + 3 // 3-5 rating
      const classification = getClassificationFromRating(rating)
      
      // Generate coordinates within ~1km radius
      const latOffset = (Math.random() - 0.5) * 0.02
      const lngOffset = (Math.random() - 0.5) * 0.02
      
      return {
        id: `restaurant_${index + 1}`,
        name: restaurantNames[index % restaurantNames.length],
        address: `Strada ${Math.floor(Math.random() * 100)}, Bucuresti`,
        coordinates: {
          lat: center.lat + latOffset,
          lng: center.lng + lngOffset,
        },
        rating: Number(rating.toFixed(1)),
        totalReviews: Math.floor(Math.random() * 500) + 50,
        priceLevel: Math.floor(Math.random() * 4) + 1,
        photoUrl: `https://picsum.photos/400/300?random=${index}`,
        websiteUrl: `https://restaurant${index}.com`,
        phoneNumber: `+40 21 ${Math.floor(Math.random() * 9000000) + 1000000}`,
        openingHours: [
          'Monday: 10:00 AM – 10:00 PM',
          'Tuesday: 10:00 AM – 10:00 PM',
          'Wednesday: 10:00 AM – 10:00 PM',
          'Thursday: 10:00 AM – 10:00 PM',
          'Friday: 10:00 AM – 11:00 PM',
          'Saturday: 10:00 AM – 11:00 PM',
          'Sunday: 11:00 AM – 9:00 PM',
        ],
        reviews: mockReviews.slice(0, Math.floor(Math.random() * 3) + 2),
        aiAnalysis: mockAIAnalyses[classification],
        distance: Math.floor(Math.random() * 1000) + 100,
      }
    })
  }
  
  /**
   * Generate mock parking spots
   */
  export const generateMockParkings = (center: Coordinates, count: number = 10): Place[] => {
    const parkingNames = [
      'Central Parking', 'City Mall Parking', 'Underground Garage', 'Street Parking Zone',
      'Business Center Parking', 'Hotel Parking', 'Public Parking Lot', 'Shopping Complex',
      'Airport Parking', 'Train Station Parking'
    ]
  
    return Array.from({ length: count }, (_, index) => {
      const rating = Math.random() * 1.5 + 3.5 // 3.5-5 rating
      const classification = getClassificationFromRating(rating)
      
      const latOffset = (Math.random() - 0.5) * 0.02
      const lngOffset = (Math.random() - 0.5) * 0.02
      
      return {
        id: `parking_${index + 1}`,
        name: parkingNames[index % parkingNames.length],
        address: `Strada ${Math.floor(Math.random() * 100)}, Bucuresti`,
        coordinates: {
          lat: center.lat + latOffset,
          lng: center.lng + lngOffset,
        },
        rating: Number(rating.toFixed(1)),
        totalReviews: Math.floor(Math.random() * 200) + 20,
        priceLevel: Math.floor(Math.random() * 3) + 1,
        photoUrl: `https://picsum.photos/400/300?random=${index + 100}`,
        phoneNumber: `+40 21 ${Math.floor(Math.random() * 9000000) + 1000000}`,
        openingHours: [
          'Monday: 24 hours',
          'Tuesday: 24 hours', 
          'Wednesday: 24 hours',
          'Thursday: 24 hours',
          'Friday: 24 hours',
          'Saturday: 24 hours',
          'Sunday: 24 hours',
        ],
        reviews: mockReviews.slice(0, Math.floor(Math.random() * 2) + 1),
        aiAnalysis: mockAIAnalyses[classification],
        distance: Math.floor(Math.random() * 800) + 50,
      }
    })
  }
  
  /**
   * Generate mock hotels
   */
  export const generateMockHotels = (center: Coordinates, count: number = 10): Place[] => {
    const hotelNames = [
      'Grand Hotel Bucharest', 'City Inn', 'Business Hotel', 'Luxury Resort',
      'Budget Hotel', 'Boutique Hotel', 'Airport Hotel', 'Downtown Lodge',
      'Royal Suite Hotel', 'Modern Residence'
    ]
  
    return Array.from({ length: count }, (_, index) => {
      const rating = Math.random() * 2 + 3 // 3-5 rating
      const classification = getClassificationFromRating(rating)
      
      const latOffset = (Math.random() - 0.5) * 0.02
      const lngOffset = (Math.random() - 0.5) * 0.02
      
      return {
        id: `hotel_${index + 1}`,
        name: hotelNames[index % hotelNames.length],
        address: `Strada ${Math.floor(Math.random() * 100)}, Bucuresti`,
        coordinates: {
          lat: center.lat + latOffset,
          lng: center.lng + lngOffset,
        },
        rating: Number(rating.toFixed(1)),
        totalReviews: Math.floor(Math.random() * 800) + 100,
        priceLevel: Math.floor(Math.random() * 4) + 1,
        photoUrl: `https://picsum.photos/400/300?random=${index + 200}`,
        websiteUrl: `https://hotel${index}.com`,
        phoneNumber: `+40 21 ${Math.floor(Math.random() * 9000000) + 1000000}`,
        openingHours: [
          'Monday: 24 hours',
          'Tuesday: 24 hours',
          'Wednesday: 24 hours', 
          'Thursday: 24 hours',
          'Friday: 24 hours',
          'Saturday: 24 hours',
          'Sunday: 24 hours',
        ],
        reviews: mockReviews.slice(0, Math.floor(Math.random() * 4) + 1),
        aiAnalysis: mockAIAnalyses[classification],
        distance: Math.floor(Math.random() * 1200) + 200,
      }
    })
  }
  
  /**
   * Get classification based on rating
   */
  function getClassificationFromRating(rating: number): PlaceClassification {
    if (rating >= 4.5) return PlaceClassification.EXCELLENT
    if (rating >= 4.0) return PlaceClassification.VERY_GOOD
    if (rating >= 3.5) return PlaceClassification.GOOD
    if (rating >= 3.0) return PlaceClassification.AVERAGE
    return PlaceClassification.POOR
  }
  
  /**
   * Generate mock places based on type
   */
  export const generateMockPlaces = (
    type: PlaceType,
    center: Coordinates,
    count: number = 10
  ): Place[] => {
    switch (type) {
      case PlaceType.RESTAURANTS:
        return generateMockRestaurants(center, count)
      case PlaceType.PARKINGS:
        return generateMockParkings(center, count)
      case PlaceType.HOTELS:
        return generateMockHotels(center, count)
      default:
        return []
    }
  }