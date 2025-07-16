import type { Metadata } from 'next'

import { PlacesSearchContainer } from '@/components/features/places/places-search-container'

export const metadata: Metadata = {
  title: 'Find Places',
  description: 'Discover restaurants, hotels, and parking spots near you with AI-powered recommendations',
}

export default function PlacesPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-padding max-width-container">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold">Find Places</h1>
              <p className="text-sm text-muted-foreground">
                Discover the best spots with AI-powered insights
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <PlacesSearchContainer />
    </div>
  )
}