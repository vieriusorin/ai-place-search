import { useEffect, useState } from 'react'

/**
 * Custom hook for debouncing values
 * Delays updating the debounced value until after wait time has passed
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook for debouncing callbacks
 * Returns a memoized version of the callback that only changes if delay changes
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(callback)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(callback)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [callback, delay])

  return debouncedCallback
}

/**
 * Custom hook for debouncing async operations
 * Useful for search inputs, API calls, etc.
 */
export function useAsyncDebounce<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  delay: number
): {
  debouncedFn: T
  isLoading: boolean
  cancel: () => void
} {
  const [isLoading, setIsLoading] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
      setIsLoading(false)
    }
  }

  const debouncedFn = ((...args: Parameters<T>) => {
    cancel()
    setIsLoading(true)

    const id = setTimeout(async () => {
      try {
        const result = await asyncFn(...args)
        setIsLoading(false)
        return result
      } catch (error) {
        setIsLoading(false)
        throw error
      }
    }, delay)

    setTimeoutId(id)
  }) as T

  useEffect(() => {
    return cancel
  }, [])

  return { debouncedFn, isLoading, cancel }
}