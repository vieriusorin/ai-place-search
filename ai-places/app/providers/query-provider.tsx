'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

import { createQueryClient } from '@/lib/tanstack-query/client'

interface QueryProviderProps {
  children: React.ReactNode
}

/**
 * QueryProvider wraps the application with Tanstack Query
 * Provides query client to all child components
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create query client only once per provider instance
  // This prevents the client from being recreated on every render
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query Devtools in development only */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}

/**
 * Custom hook to access the query client
 * Use this when you need direct access to the query client
 */
export { useQueryClient } from '@tanstack/react-query'