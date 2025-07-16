import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import type {
  PlaceType,
  PlaceSearchParams,
  PlaceSearchResult,
  Place,
  Coordinates,
  PlaceFilters,
  AIAnalysis,
} from '@/types/places'
import { MockPlacesService, MockOpenAIService } from '@/lib/mock/places-services'
import { queryKeys } from '@/lib/tanstack-query/client'

/**
 * Hook for searching and managing places
 */
export function usePlacesSearch() {
  const [searchParams, setSearchParams] = useState<PlaceSearchParams | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [filters, setFilters] = useState<Partial<PlaceFilters>>({})
  const [enableAIAnalysis, setEnableAIAnalysis] = useState(true)
  const queryClient = useQueryClient()

  /**
   * Search places query
   */
  const {
    data: searchResult,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: queryKeys.places.search(searchParams),
    queryFn: () => MockPlacesService.searchPlaces(searchParams!),
    enabled: Boolean(searchParams),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  /**
   * Place details query
   */
  const {
    data: placeDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useQuery({
    queryKey: queryKeys.places.detail(selectedPlace?.id || ''),
    queryFn: () => MockPlacesService.getPlaceDetails(selectedPlace!.id),
    enabled: Boolean(selectedPlace?.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  /**
   * AI analysis mutation for individual place
   */
  const analyzeePlaceMutation = useMutation({
    mutationFn: MockOpenAIService.analyzePlaceReviews,
    onSuccess: (analysis, place) => {
      // Update the place in cache with AI analysis
      queryClient.setQueryData(
        queryKeys.places.detail(place.id),
        (oldData: Place | undefined) => 
          oldData ? { ...oldData, aiAnalysis: analysis } : undefined
      )
      
      // Update place in search results
      queryClient.setQueryData(
        queryKeys.places.search(searchParams),
        (oldData: PlaceSearchResult | undefined) => {
          if (!oldData) return oldData
          
          return {
            ...oldData,
            places: oldData.places.map(p => 
              p.id === place.id ? { ...p, aiAnalysis: analysis } : p
            )
          }
        }
      )
    },
  })

  /**
   * Batch AI analysis mutation
   */
  const batchAnalyzeMutation = useMutation({
    mutationFn: MockOpenAIService.batchAnalyzePlaces,
    onSuccess: (analyses) => {
      // Update all places in search results with AI analysis
      queryClient.setQueryData(
        queryKeys.places.search(searchParams),
        (oldData: PlaceSearchResult | undefined) => {
          if (!oldData) return oldData
          
          return {
            ...oldData,
            places: oldData.places.map(place => ({
              ...place,
              aiAnalysis: analyses[place.id] || place.aiAnalysis
            }))
          }
        }
      )
    },
  })

  /**
   * Search places with parameters
   */
  const searchPlaces = useCallback(async (params: PlaceSearchParams) => {
    setSearchParams(params)
    setSelectedPlace(null)
    
    try {
      const result = await queryClient.fetchQuery({
        queryKey: queryKeys.places.search(params),
        queryFn: () => MockPlacesService.searchPlaces(params),
      })
      
      // Automatically analyze places with AI if enabled
      if (enableAIAnalysis && result.places.length > 0) {
        batchAnalyzeMutation.mutate(result.places)
      }
      
      return result
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Search failed')
    }
  }, [queryClient, enableAIAnalysis, batchAnalyzeMutation])

  /**
   * Search places by type and location
   */
  const searchByTypeAndLocation = useCallback((
    type: PlaceType,
    location: Coordinates,
    options?: Partial<PlaceSearchParams>
  ) => {
    const params: PlaceSearchParams = {
      location,
      type,
      radius: 2000, // 2km default
      ...options,
      ...filters,
    }
    
    return searchPlaces(params)
  }, [searchPlaces, filters])

  /**
   * Get places in map bounds
   */
  const getPlacesInBounds = useCallback(async (
    bounds: { northeast: Coordinates; southwest: Coordinates },
    type: PlaceType
  ) => {
    return MockPlacesService.getPlacesInBounds(bounds, type)
  }, [])

  /**
   * Select a place for detailed view
   */
  const selectPlace = useCallback((place: Place | null) => {
    setSelectedPlace(place)
    
    // Analyze selected place if AI is enabled and not already analyzed
    if (place && enableAIAnalysis && !place.aiAnalysis) {
      analyzeePlaceMutation.mutate(place)
    }
  }, [enableAIAnalysis, analyzeePlaceMutation])

  /**
   * Update search filters
   */
  const updateFilters = useCallback((newFilters: Partial<PlaceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    
    // Re-search if we have active search params
    if (searchParams) {
      const updatedParams = { ...searchParams, ...newFilters }
      searchPlaces(updatedParams)
    }
  }, [searchParams, searchPlaces])

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    setSearchParams(null)
    setSelectedPlace(null)
    setFilters({})
  }, [])

  /**
   * Analyze place with AI
   */
  const analyzePlace = useCallback(async (place: Place): Promise<AIAnalysis> => {
    return analyzeePlaceMutation.mutateAsync(place)
  }, [analyzeePlaceMutation])

  /**
   * Get filtered places from current search results
   */
  const filteredPlaces = useMemo(() => {
    if (!searchResult?.places) return []
    
    let places = [...searchResult.places]
    
    // Apply rating filter
    if (filters.rating) {
      places = places.filter(place => 
        place.rating >= filters.rating!.min && place.rating <= filters.rating!.max
      )
    }
    
    // Apply price level filter
    if (filters.priceLevel && filters.priceLevel.length > 0) {
      places = places.filter(place => 
        place.priceLevel && filters.priceLevel!.includes(place.priceLevel)
      )
    }
    
    // Apply distance filter
    if (filters.distance?.max) {
      const maxDistanceMeters = filters.distance.max * 1000
      places = places.filter(place => 
        !place.distance || place.distance <= maxDistanceMeters
      )
    }
    
    return places
  }, [searchResult?.places, filters])

  /**
   * Get places grouped by classification
   */
  const placesByClassification = useMemo(() => {
    const groups = {
      excellent: [] as Place[],
      very_good: [] as Place[],
      good: [] as Place[],
      average: [] as Place[],
      poor: [] as Place[],
      unclassified: [] as Place[],
    }
    
    filteredPlaces.forEach(place => {
      if (place.aiAnalysis?.classification) {
        groups[place.aiAnalysis.classification].push(place)
      } else {
        groups.unclassified.push(place)
      }
    })
    
    return groups
  }, [filteredPlaces])

  /**
   * Get search statistics
   */
  const searchStats = useMemo(() => {
    if (!filteredPlaces.length) {
      return {
        total: 0,
        averageRating: 0,
        averageReviews: 0,
        topRated: null,
        mostReviewed: null,
      }
    }
    
    const total = filteredPlaces.length
    const averageRating = filteredPlaces.reduce((sum, place) => sum + place.rating, 0) / total
    const averageReviews = filteredPlaces.reduce((sum, place) => sum + place.totalReviews, 0) / total
    
    const topRated = filteredPlaces.reduce((best, place) => 
      place.rating > best.rating ? place : best
    )
    
    const mostReviewed = filteredPlaces.reduce((best, place) => 
      place.totalReviews > best.totalReviews ? place : best
    )
    
    return {
      total,
      averageRating: Number(averageRating.toFixed(1)),
      averageReviews: Math.round(averageReviews),
      topRated,
      mostReviewed,
    }
  }, [filteredPlaces])

  return {
    // State
    searchParams,
    searchResult,
    filteredPlaces,
    selectedPlace,
    placeDetails,
    filters,
    enableAIAnalysis,
    placesByClassification,
    searchStats,
    
    // Loading states
    isSearching,
    isLoadingDetails,
    isAnalyzing: analyzeePlaceMutation.isPending,
    isBatchAnalyzing: batchAnalyzeMutation.isPending,
    
    // Errors
    searchError,
    detailsError,
    analysisError: analyzeePlaceMutation.error,
    
    // Actions
    searchPlaces,
    searchByTypeAndLocation,
    getPlacesInBounds,
    selectPlace,
    updateFilters,
    clearSearch,
    analyzePlace,
    setEnableAIAnalysis,
    refetchSearch,
    
    // Utilities
    hasResults: Boolean(searchResult?.places?.length),
    hasSelectedPlace: Boolean(selectedPlace),
  }
}

/**
 * Extended query keys for places
 */
declare module '@/lib/tanstack-query/client' {
  interface QueryKeys {
    places: {
      all: ['places']
      search: (params: PlaceSearchParams | null) => ['places', 'search', PlaceSearchParams | null]
      detail: (id: string) => ['places', 'detail', string]
      bounds: (bounds: any, type: PlaceType) => ['places', 'bounds', any, PlaceType]
    }
  }
}

// Extend the query keys
export const placesQueryKeys = {
  all: ['places'] as const,
  search: (params: PlaceSearchParams | null) => [...placesQueryKeys.all, 'search', params] as const,
  detail: (id: string) => [...placesQueryKeys.all, 'detail', id] as const,
  bounds: (bounds: any, type: PlaceType) => [...placesQueryKeys.all, 'bounds', bounds, type] as const,
}