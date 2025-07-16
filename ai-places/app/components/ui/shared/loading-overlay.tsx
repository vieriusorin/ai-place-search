'use client'

import { Loader2, MapPin, Search, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  message?: string
  type?: 'search' | 'location' | 'ai' | 'general'
  className?: string
}

export function LoadingOverlay({
  message = 'Loading...',
  type = 'general',
  className,
}: LoadingOverlayProps): JSX.Element {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="h-8 w-8 animate-pulse" />
      case 'location':
        return <MapPin className="h-8 w-8 animate-pulse" />
      case 'ai':
        return <Sparkles className="h-8 w-8 animate-pulse" />
      default:
        return <Loader2 className="h-8 w-8 animate-spin" />
    }
  }

  const getAnimationClass = () => {
    switch (type) {
      case 'search':
        return 'animate-pulse'
      case 'location':
        return 'animate-bounce'
      case 'ai':
        return 'animate-pulse'
      default:
        return 'animate-spin'
    }
  }

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50',
        className
      )}
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center text-primary">
          {getIcon()}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">{message}</p>
          
          {type === 'ai' && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>AI is analyzing reviews...</span>
            </div>
          )}
          
          {type === 'search' && (
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}