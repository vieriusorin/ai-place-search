/**
 * Global type definitions for the application
 */

/**
 * Common API response structure
 */
export interface ApiResponse<T = unknown> {
    data: T | null
    error: string | null
    success: boolean
    message?: string
  }
  
  /**
   * Pagination metadata
   */
  export interface PaginationMeta {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  
  /**
   * Paginated response structure
   */
  export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: PaginationMeta
  }
  
  /**
   * Base entity interface
   */
  export interface BaseEntity {
    id: string
    created_at: string
    updated_at: string
  }
  
  /**
   * User roles enum
   */
  export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    MODERATOR = 'moderator',
  }
  
  /**
   * Application status enum
   */
  export enum AppStatus {
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error',
    IDLE = 'idle',
  }
  
  /**
   * Form validation state
   */
  export interface FormState {
    isValid: boolean
    errors: Record<string, string[]>
    isSubmitting: boolean
    isSubmitted: boolean
  }
  
  /**
   * Upload file interface
   */
  export interface UploadFile {
    file: File
    preview?: string
    progress?: number
    status: 'pending' | 'uploading' | 'success' | 'error'
    error?: string
    url?: string
  }
  
  /**
   * Navigation item interface
   */
  export interface NavItem {
    title: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
    description?: string
    children?: NavItem[]
    disabled?: boolean
    external?: boolean
  }
  
  /**
   * Breadcrumb item interface
   */
  export interface BreadcrumbItem {
    title: string
    href?: string
    isCurrentPage?: boolean
  }
  
  /**
   * Search filters interface
   */
  export interface SearchFilters {
    query?: string
    category?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
  }
  
  /**
   * Theme preferences
   */
  export type Theme = 'light' | 'dark' | 'system'
  
  /**
   * User preferences interface
   */
  export interface UserPreferences {
    theme: Theme
    language: string
    timezone: string
    notifications: {
      email: boolean
      push: boolean
      marketing: boolean
    }
  }
  
  /**
   * Error boundary error info
   */
  export interface ErrorInfo {
    componentStack: string
    errorBoundary?: string
    eventId?: string
  }
  
  /**
   * Loading state variants
   */
  export type LoadingVariant = 'spinner' | 'skeleton' | 'pulse' | 'dots'
  
  /**
   * Size variants for components
   */
  export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  
  /**
   * Color variants for components
   */
  export type ColorVariant = 
    | 'default' 
    | 'primary' 
    | 'secondary' 
    | 'success' 
    | 'warning' 
    | 'error' 
    | 'info'
  
  /**
   * Environment configuration
   */
  export interface EnvConfig {
    NODE_ENV: 'development' | 'production' | 'test'
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY?: string
    NEXT_PUBLIC_APP_URL: string
  }
  
  /**
   * Feature flags
   */
  export interface FeatureFlags {
    enableAnalytics: boolean
    enableErrorTracking: boolean
    enableBetaFeatures: boolean
    maintenanceMode: boolean
  }
  
  /**
   * Utility types
   */
  
  /**
   * Make all properties optional recursively
   */
  export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
  }
  
  /**
   * Make specific properties required
   */
  export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>
  
  /**
   * Omit properties and make result partial
   */
  export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>
  
  /**
   * Extract array element type
   */
  export type ArrayElement<ArrayType extends readonly unknown[]> = 
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never
  
  /**
   * Function type for event handlers
   */
  export type EventHandler<T = void> = (event?: unknown) => T | Promise<T>
  
  /**
   * Generic async function type
   */
  export type AsyncFunction<TArgs extends unknown[] = [], TReturn = void> = 
    (...args: TArgs) => Promise<TReturn>
  
  /**
   * Component props with children
   */
  export interface PropsWithChildren {
    children?: React.ReactNode
  }
  
  /**
   * Component props with className
   */
  export interface PropsWithClassName {
    className?: string
  }