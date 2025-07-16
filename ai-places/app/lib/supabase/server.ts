import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

import type { Database } from '@/types/supabase'

/**
 * Server-side Supabase client for use in Server Components
 * This client reads cookies to maintain auth state across requests
 */
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

/**
 * Service role client for admin operations
 * This client bypasses RLS and should be used carefully
 * Only use for server-side operations that require elevated privileges
 */
export const createServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Server-side auth utilities
 */
export const serverAuth = {
  /**
   * Get user from server component
   */
  getUser: async () => {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  /**
   * Get session from server component
   */
  getSession: async () => {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  /**
   * Require authentication - throws if not authenticated
   */
  requireAuth: async () => {
    const { user, error } = await serverAuth.getUser()
    
    if (error || !user) {
      throw new Error('Authentication required')
    }
    
    return user
  },

  /**
   * Check if user has specific role (requires custom user_roles table)
   */
  hasRole: async (role: string) => {
    const user = await serverAuth.requireAuth()
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', role)
      .single()
    
    return !error && data !== null
  },

  /**
   * Check if user is admin
   */
  isAdmin: async () => {
    return await serverAuth.hasRole('admin')
  },
}

/**
 * Server-side database utilities
 */
export const serverDb = {
  /**
   * Execute query with service role privileges
   */
  withServiceRole: () => {
    return createServiceRoleClient()
  },

  /**
   * Execute query with user context
   */
  withUser: () => {
    return createServerSupabaseClient()
  },

  /**
   * Safe query execution with error handling
   */
  safeQuery: async <T>(
    queryFn: (client: ReturnType<typeof createServerSupabaseClient>) => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: any; success: boolean }> => {
    try {
      const client = createServerSupabaseClient()
      const result = await queryFn(client)
      
      return {
        ...result,
        success: !result.error && result.data !== null,
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },
}

/**
 * Middleware helper for route protection
 */
export const middleware = {
  /**
   * Protect routes that require authentication
   */
  requireAuth: async (request: Request) => {
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    return null
  },

  /**
   * Protect admin routes
   */
  requireAdmin: async (request: Request) => {
    const authError = await middleware.requireAuth(request)
    if (authError) return authError
    
    const isAdmin = await serverAuth.isAdmin()
    if (!isAdmin) {
      return new Response('Forbidden', { status: 403 })
    }
    
    return null
  },
}