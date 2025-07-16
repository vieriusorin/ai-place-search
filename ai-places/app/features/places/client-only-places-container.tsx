'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const PlacesSearchContainer = dynamic(
  () => import('./place-search-container').then(mod => ({ default: mod.PlacesSearchContainer })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading places...</p>
        </div>
      </div>
    )
  }
)

export function ClientOnlyPlacesContainer() {
  return <PlacesSearchContainer />
}