'use client'

import { Star, MapPin, TrendingUp, Users, Award, Target } from 'lucide-react'

import type { Place } from '@/types/places'
import { cn } from '@/lib/utils'

interface SearchStatsProps {
  stats: {
    total: number
    averageRating: number
    averageReviews: number
    topRated: Place | null
    mostReviewed: Place | null
  }
  className?: string
}

export function SearchStats({
  stats,
  className,
}: SearchStatsProps): JSX.Element {
  const { total, averageRating, averageReviews, topRated, mostReviewed } = stats

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-yellow-600'
    if (rating >= 3.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const StatItem = ({ 
    icon: Icon, 
    label, 
    value, 
    color = 'text-muted-foreground' 
  }: {
    icon: React.ComponentType<any>
    label: string
    value: string | number
    color?: string
  }) => (
    <div className="flex items-center gap-2">
      <Icon className={cn('h-4 w-4', color)} />
      <div className="flex-1">
        <div className="text-sm font-medium">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <h3 className="font-medium">Search Results</h3>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatItem
          icon={MapPin}
          label="Places found"
          value={total}
          color="text-primary"
        />
        
        <StatItem
          icon={Star}
          label="Avg. rating"
          value={`${averageRating}★`}
          color={getRatingColor(averageRating)}
        />
        
        <StatItem
          icon={Users}
          label="Avg. reviews"
          value={formatNumber(averageReviews)}
          color="text-blue-600"
        />
        
        <StatItem
          icon={TrendingUp}
          label="Quality"
          value={averageRating >= 4.0 ? 'High' : averageRating >= 3.5 ? 'Good' : 'Mixed'}
          color={getRatingColor(averageRating)}
        />
      </div>

      {/* Top Picks */}
      {(topRated || mostReviewed) && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Top Picks</h4>
          
          {topRated && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Highest Rated</span>
              </div>
              <div className="text-sm">{topRated.name}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-current text-yellow-500" />
                <span>{topRated.rating}</span>
                <span>({topRated.totalReviews} reviews)</span>
              </div>
            </div>
          )}
          
          {mostReviewed && mostReviewed.id !== topRated?.id && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Most Reviewed</span>
              </div>
              <div className="text-sm">{mostReviewed.name}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-current text-yellow-500" />
                <span>{mostReviewed.rating}</span>
                <span>({formatNumber(mostReviewed.totalReviews)} reviews)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quality Distribution */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Quality Distribution</h4>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (averageRating / 5) * 100)}%` 
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground min-w-0">
              {averageRating >= 4.0 ? 'Excellent' : averageRating >= 3.5 ? 'Good' : 'Mixed'}
            </span>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="rounded-lg bg-blue-50 p-3 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900">Quick Insights</span>
        </div>
        
        <ul className="space-y-1 text-blue-800">
          {averageRating >= 4.0 && (
            <li>• High quality options in this area</li>
          )}
          {averageReviews >= 100 && (
            <li>• Well-reviewed establishments</li>
          )}
          {total >= 8 && (
            <li>• Good variety of choices</li>
          )}
          {total < 5 && (
            <li>• Limited options - consider expanding search</li>
          )}
        </ul>
      </div>
    </div>
  )
}