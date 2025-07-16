import { useQueryState } from 'nuqs'

export type NavigationMode = 'none' | 'static' | 'live'

/**
 * Hook to manage navigation state in URL
 */
export function useNavigationState() {
  const [navigationMode, setNavigationMode] = useQueryState<NavigationMode>('nav', {
    defaultValue: 'none',
    parse: (value): NavigationMode => {
      if (value === 'static' || value === 'live') return value
      return 'none'
    },
    serialize: (value) => value
  })

  const [destinationId, setDestinationId] = useQueryState('destination', {
    defaultValue: null,
    parse: (value) => value || null,
    serialize: (value) => value || ''
  })

  const startNavigation = (placeId: string, mode: NavigationMode) => {
    setDestinationId(placeId)
    setNavigationMode(mode)
  }

  const stopNavigation = () => {
    setDestinationId(null)
    setNavigationMode('none')
  }

  const isNavigating = navigationMode !== 'none'
  const isLiveNavigation = navigationMode === 'live'

  return {
    navigationMode,
    destinationId,
    isNavigating,
    isLiveNavigation,
    startNavigation,
    stopNavigation,
    setNavigationMode
  }
}