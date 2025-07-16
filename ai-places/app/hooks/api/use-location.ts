import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import type { Coordinates, UserLocation, GeolocationOptions } from '@/types/places'
import { GoogleMapsGeolocationService } from '@/lib/services/google-maps'

/**
 * Hook for managing user location and geolocation
 */
export function useLocation() {
  const [manualLocation, setManualLocation] = useState<Coordinates | null>(null)
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null)
  const queryClient = useQueryClient()

  /**
   * Get current location query
   */
  const {
    data: currentLocation,
    isLoading: isLoadingLocation,
    error: locationError,
    refetch: refetchLocation,
  } = useQuery({
    queryKey: ['location', 'current'], // Fixed queryKey to use array directly
    queryFn: GoogleMapsGeolocationService.getCurrentLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    enabled: !manualLocation, // Don't auto-fetch if manual location is set
  })

  /**
   * Reverse geocoding mutation
   */
  const reverseGeocodeMutation = useMutation({
    mutationFn: GoogleMapsGeolocationService.getAddressFromCoordinates,
    onSuccess: (address, coordinates) => {
      // Update cache with address information
      queryClient.setQueryData(
        ['location', 'address', coordinates],
        address
      )
    },
  })

  /**
   * Forward geocoding mutation
   */
  const geocodeMutation = useMutation({
    mutationFn: GoogleMapsGeolocationService.getCoordinatesFromAddress,
    onSuccess: (coordinates, address) => {
      // Update cache with coordinates
      queryClient.setQueryData(
        ['location', 'coordinates', address],
        coordinates
      )
    },
  })

  /**
   * Check geolocation permission
   */
  const checkLocationPermission = useCallback(async (): Promise<PermissionState> => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        setLocationPermission(result.state)
        return result.state
      } catch (error) {
        console.error('Error checking geolocation permission:', error)
      }
    }
    return 'prompt'
  }, [])

  /**
   * Request current location with options
   */
  const requestCurrentLocation = useCallback(async (
    options?: GeolocationOptions
  ): Promise<UserLocation> => {
    try {
      const location = await GoogleMapsGeolocationService.getCurrentLocation()
      // Invalidate and refetch current location query
      queryClient.setQueryData(['location', 'current'], location)

      return location
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get location')
    }
  }, [queryClient])

  /**
   * Set manual location (when user clicks on map)
   */
  const setUserLocation = useCallback((coordinates: Coordinates) => {
    setManualLocation(coordinates)

    // Create a user location object
    const userLocation: UserLocation = {
      current: coordinates,
      timestamp: Date.now(),
    }

    // Update cache
    queryClient.setQueryData(['location', 'current'], userLocation)
  }, [queryClient])

  /**
   * Get address for coordinates
   */
  const getAddress = useCallback(async (coordinates: Coordinates): Promise<string> => {
    // Check cache first
    const cachedAddress = queryClient.getQueryData<string>(
      ['location', 'address', coordinates]
    )

    if (cachedAddress) {
      return cachedAddress
    }

    // Fetch from API
    return reverseGeocodeMutation.mutateAsync(coordinates)
  }, [queryClient, reverseGeocodeMutation])

  /**
   * Get coordinates for address
   */
  const getCoordinates = useCallback(async (address: string): Promise<Coordinates> => {
    // Check cache first
    const cachedCoordinates = queryClient.getQueryData<Coordinates>(
      ['location', 'coordinates', address]
    )

    if (cachedCoordinates) {
      return cachedCoordinates
    }

    // Fetch from API
    const coordinates = await geocodeMutation.mutateAsync(address)
    setUserLocation(coordinates)
    return coordinates
  }, [queryClient, geocodeMutation, setUserLocation])

  /**
   * Clear manual location and use GPS
   */
  const useGPSLocation = useCallback(() => {
    setManualLocation(null)
    refetchLocation()
  }, [refetchLocation])

  /**
   * Get effective location (manual or GPS)
   */
  const effectiveLocation = manualLocation
    ? { current: manualLocation, timestamp: Date.now() }
    : currentLocation

  /**
   * Check if location is available
   */
  const hasLocation = Boolean(effectiveLocation?.current)

  /**
   * Check if using manual location
   */
  const isManualLocation = Boolean(manualLocation)

  /**
   * Get location loading state
   */
  const isGettingLocation = isLoadingLocation ||
    reverseGeocodeMutation.isPending ||
    geocodeMutation.isPending

  /**
   * Get location error
   */
  const error = locationError ||
    reverseGeocodeMutation.error ||
    geocodeMutation.error

  // Effect to check permission on mount
  useEffect(() => {
    checkLocationPermission()
  }, [checkLocationPermission])

  return {
    // State
    currentLocation: effectiveLocation,
    hasLocation,
    isManualLocation,
    locationPermission,

    // Loading states
    isLoadingLocation,
    isGettingLocation,
    isGeocodingAddress: geocodeMutation.isPending,
    isReverseGeocoding: reverseGeocodeMutation.isPending,

    // Errors
    locationError,
    geocodingError: geocodeMutation.error,
    reverseGeocodingError: reverseGeocodeMutation.error,
    error,

    // Actions
    requestCurrentLocation,
    setUserLocation,
    useGPSLocation,
    getAddress,
    getCoordinates,
    checkLocationPermission,
    refetchLocation,

    // Utilities
    isLocationSupported: 'geolocation' in navigator,
  }
}

/**
 * Extended query keys for location
 */
declare module '@/lib/tanstack-query/client' {
  interface QueryKeys {
    location: {
      all: ['location']
      current: () => ['location', 'current']
      address: (coordinates: Coordinates) => ['location', 'address', Coordinates]
      coordinates: (address: string) => ['location', 'coordinates', string]
    }
  }
}

// Extend the query keys
export const locationQueryKeys = {
  all: ['location'] as const,
  current: () => [...locationQueryKeys.all, 'current'] as const,
  address: (coordinates: Coordinates) => [...locationQueryKeys.all, 'address', coordinates] as const,
  coordinates: (address: string) => [...locationQueryKeys.all, 'coordinates', address] as const,
}