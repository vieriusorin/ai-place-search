import { QueryClient } from '@tanstack/react-query'

/**
 * Default query options for consistent behavior across the app
 */
const defaultQueryOptions = {
  queries: {
    // Time before data is considered stale
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    // Time before inactive queries are garbage collected
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    
    // Retry configuration
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false
      }
      
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus (disabled for better UX)
    refetchOnWindowFocus: false,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Refetch on mount if data is stale
    refetchOnMount: true,
  },
  mutations: {
    // Retry mutations once on network error
    retry: (failureCount: number, error: any) => {
      if (error?.name === 'NetworkError' && failureCount < 1) {
        return true
      }
      return false
    },
    
    // Retry delay for mutations
    retryDelay: 1000,
  },
}

/**
 * Create a new QueryClient instance with our default configuration
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  })
}

/**
 * Singleton QueryClient instance for the app
 * This ensures we have a single instance across the application
 */
let queryClient: QueryClient | undefined

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = createQueryClient()
  }
  return queryClient
}

/**
 * Query keys factory for consistent query key management
 * This helps with cache invalidation and prevents key conflicts
 */
export const queryKeys = {
  // User-related queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
  },
  
  // Auth-related queries
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  
  // Posts/Content queries (example)
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.posts.lists(), filters] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
  },
  
  // Settings queries
  settings: {
    all: ['settings'] as const,
    user: () => [...queryKeys.settings.all, 'user'] as const,
    app: () => [...queryKeys.settings.all, 'app'] as const,
  },
  
  // Location queries
  location: {
    all: ['location'] as const,
    current: () => [...queryKeys.location.all, 'current'] as const,
    address: (coordinates: { lat: number; lng: number }) => [...queryKeys.location.all, 'address', coordinates] as const,
    coordinates: (address: string) => [...queryKeys.location.all, 'coordinates', address] as const,
  },
  
  // Places queries
  places: {
    all: ['places'] as const,
    lists: () => [...queryKeys.places.all, 'list'] as const,
    search: (params: any) => [...queryKeys.places.lists(), 'search', params] as const,
    details: () => [...queryKeys.places.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.places.details(), id] as const,
  },
} as const

/**
 * Common query options for different types of queries
 */
export const queryOptions = {
  // For data that changes frequently
  realtime: {
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  },
  
  // For static data that rarely changes
  static: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },
  
  // For user-specific data
  user: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // For infinite queries (pagination)
  infinite: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    getNextPageParam: (lastPage: any) => lastPage?.nextCursor,
    getPreviousPageParam: (firstPage: any) => firstPage?.prevCursor,
  },
} as const

/**
 * Error handling utilities for queries
 */
export const queryUtils = {
  /**
   * Standard error handler for queries
   */
  handleError: (error: any): string => {
    if (error?.message) {
      return error.message
    }
    
    if (error?.status) {
      switch (error.status) {
        case 401:
          return 'You are not authorized to perform this action'
        case 403:
          return 'Access denied'
        case 404:
          return 'Resource not found'
        case 500:
          return 'Server error. Please try again later'
        default:
          return 'An unexpected error occurred'
      }
    }
    
    return 'An unexpected error occurred'
  },
  
  /**
   * Check if error is a network error
   */
  isNetworkError: (error: any): boolean => {
    return error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR'
  },
  
  /**
   * Check if error requires authentication
   */
  isAuthError: (error: any): boolean => {
    return error?.status === 401 || error?.code === 'UNAUTHORIZED'
  },
}