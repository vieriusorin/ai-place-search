import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/supabase'

/**
 * Client-side Supabase client for use in React components
 * This client automatically handles auth state and cookies
 */
export const supabaseClient = createClientComponentClient<Database>()

/**
 * Alternative client for specific use cases where you need more control
 * Use this sparingly and prefer the auth-helpers client above
 */
export const createSupabaseClient = (): ReturnType<typeof createClient<Database>> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 2,
      },
    },
  })
}

/**
 * Storage utilities for Supabase
 */
export const storage = {
  /**
   * Get public URL for a file in storage
   */
  getPublicUrl: (bucket: string, path: string): string => {
    const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },

  /**
   * Upload file to storage
   */
  uploadFile: async (
    bucket: string,
    path: string,
    file: File,
    options?: { upsert?: boolean }
  ) => {
    return await supabaseClient.storage
      .from(bucket)
      .upload(path, file, options)
  },

  /**
   * Delete file from storage
   */
  deleteFile: async (bucket: string, paths: string[]) => {
    return await supabaseClient.storage.from(bucket).remove(paths)
  },

  /**
   * List files in storage bucket
   */
  listFiles: async (bucket: string, path?: string) => {
    return await supabaseClient.storage.from(bucket).list(path)
  },
}

/**
 * Auth utilities
 */
export const auth = {
  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabaseClient.auth.getUser()
    return { user, error }
  },

  /**
   * Sign out user
   */
  signOut: async () => {
    return await supabaseClient.auth.signOut()
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const { data: { session }, error } = await supabaseClient.auth.getSession()
    return { session, error }
  },
}

/**
 * Real-time utilities
 */
export const realtime = {
  /**
   * Subscribe to table changes
   */
  subscribeToTable: <T = any>(
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) => {
    let channel = supabaseClient
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table,
          filter 
        },
        callback
      )

    channel.subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  },
}

export default supabaseClient