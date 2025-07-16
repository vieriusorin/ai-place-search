/**
 * Application route constants
 * Centralized route management for type safety and easy maintenance
 */

/**
 * Public routes (accessible without authentication)
 */
export const PUBLIC_ROUTES = {
    HOME: '/',
    ABOUT: '/about',
    CONTACT: '/contact',
    PRICING: '/pricing',
    FEATURES: '/features',
    PLACES: '/places',
    BLOG: '/blog',
    BLOG_POST: (slug: string) => `/blog/${slug}`,
    LEGAL: {
      TERMS: '/legal/terms',
      PRIVACY: '/legal/privacy',
      COOKIES: '/legal/cookies',
    },
  } as const
  
  /**
   * Authentication routes
   */
  export const AUTH_ROUTES = {
    SIGN_IN: '/auth/sign-in',
    SIGN_UP: '/auth/sign-up',
    SIGN_OUT: '/auth/sign-out',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_OTP: '/auth/verify-otp',
    CALLBACK: '/auth/callback',
    ERROR: '/auth/error',
    
    // Social auth
    GOOGLE: '/auth/google',
    GITHUB: '/auth/github',
    APPLE: '/auth/apple',
  } as const
  
  /**
   * Protected routes (require authentication)
   */
  export const PROTECTED_ROUTES = {
    DASHBOARD: '/dashboard',
    DASHBOARD_OVERVIEW: '/dashboard/overview',
    DASHBOARD_ANALYTICS: '/dashboard/analytics',
    DASHBOARD_SETTINGS: '/dashboard/settings',
    
    PROFILE: '/profile',
    PROFILE_EDIT: '/profile/edit',
    PROFILE_SECURITY: '/profile/security',
    PROFILE_PREFERENCES: '/profile/preferences',
    
    SETTINGS: '/settings',
    SETTINGS_ACCOUNT: '/settings/account',
    SETTINGS_BILLING: '/settings/billing',
    SETTINGS_NOTIFICATIONS: '/settings/notifications',
    SETTINGS_INTEGRATIONS: '/settings/integrations',
    SETTINGS_API: '/settings/api',
    
    // User management
    USERS: '/users',
    USER_DETAIL: (id: string) => `/users/${id}`,
    USER_EDIT: (id: string) => `/users/${id}/edit`,
    
    // Projects (example feature)
    PROJECTS: '/projects',
    PROJECT_DETAIL: (id: string) => `/projects/${id}`,
    PROJECT_CREATE: '/projects/create',
    PROJECT_EDIT: (id: string) => `/projects/${id}/edit`,
    PROJECT_SETTINGS: (id: string) => `/projects/${id}/settings`,
  } as const
  
  /**
   * Admin routes (require admin privileges)
   */
  export const ADMIN_ROUTES = {
    ADMIN: '/admin',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}`,
    ADMIN_ANALYTICS: '/admin/analytics',
    ADMIN_SETTINGS: '/admin/settings',
    ADMIN_LOGS: '/admin/logs',
    ADMIN_MAINTENANCE: '/admin/maintenance',
  } as const
  
  /**
   * API routes
   */
  export const API_ROUTES = {
    // Auth
    AUTH: {
      SIGN_IN: '/api/auth/sign-in',
      SIGN_UP: '/api/auth/sign-up',
      SIGN_OUT: '/api/auth/sign-out',
      REFRESH: '/api/auth/refresh',
      VERIFY: '/api/auth/verify',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    
    // Users
    USERS: '/api/users',
    USER: (id: string) => `/api/users/${id}`,
    USER_AVATAR: (id: string) => `/api/users/${id}/avatar`,
    USER_PREFERENCES: (id: string) => `/api/users/${id}/preferences`,
    
    // Profile
    PROFILE: '/api/profile',
    PROFILE_AVATAR: '/api/profile/avatar',
    PROFILE_PASSWORD: '/api/profile/password',
    
    // Projects
    PROJECTS: '/api/projects',
    PROJECT: (id: string) => `/api/projects/${id}`,
    PROJECT_MEMBERS: (id: string) => `/api/projects/${id}/members`,
    
    // Upload
    UPLOAD: '/api/upload',
    UPLOAD_AVATAR: '/api/upload/avatar',
    UPLOAD_FILE: '/api/upload/file',
    
    // Settings
    SETTINGS: '/api/settings',
    
    // Admin
    ADMIN: {
      USERS: '/api/admin/users',
      ANALYTICS: '/api/admin/analytics',
      LOGS: '/api/admin/logs',
    },
  } as const
  
  /**
   * External routes
   */
  export const EXTERNAL_ROUTES = {
    DOCUMENTATION: 'https://docs.example.com',
    SUPPORT: 'https://support.example.com',
    STATUS: 'https://status.example.com',
    GITHUB: 'https://github.com/your-org/your-repo',
    TWITTER: 'https://twitter.com/your-handle',
    DISCORD: 'https://discord.gg/your-server',
  } as const
  
  /**
   * Route metadata for navigation and SEO
   */
  export const ROUTE_METADATA = {
    [PUBLIC_ROUTES.HOME]: {
      title: 'Home',
      description: 'Welcome to our application',
      showInNav: true,
      icon: 'Home',
    },
    [PUBLIC_ROUTES.ABOUT]: {
      title: 'About',
      description: 'Learn more about us',
      showInNav: true,
      icon: 'Info',
    },
    [PUBLIC_ROUTES.CONTACT]: {
      title: 'Contact',
      description: 'Get in touch with us',
      showInNav: true,
      icon: 'Mail',
    },
    [PROTECTED_ROUTES.DASHBOARD]: {
      title: 'Dashboard',
      description: 'Your personal dashboard',
      showInNav: true,
      icon: 'LayoutDashboard',
      requiresAuth: true,
    },
    [PROTECTED_ROUTES.PROFILE]: {
      title: 'Profile',
      description: 'Manage your profile',
      showInNav: true,
      icon: 'User',
      requiresAuth: true,
    },
    [PROTECTED_ROUTES.SETTINGS]: {
      title: 'Settings',
      description: 'Application settings',
      showInNav: true,
      icon: 'Settings',
      requiresAuth: true,
    },
    [ADMIN_ROUTES.ADMIN]: {
      title: 'Admin',
      description: 'Administration panel',
      showInNav: false,
      icon: 'Shield',
      requiresAuth: true,
      requiresAdmin: true,
    },
  } as const
  
  /**
   * Route utilities
   */
  export const routeUtils = {
    /**
     * Check if route requires authentication
     */
    requiresAuth: (pathname: string): boolean => {
      return pathname.startsWith('/dashboard') ||
             pathname.startsWith('/profile') ||
             pathname.startsWith('/settings') ||
             pathname.startsWith('/admin') ||
             pathname.startsWith('/projects')
    },
  
    /**
     * Check if route is public
     */
    isPublicRoute: (pathname: string): boolean => {
      const publicPaths = [
        '/',
        '/about',
        '/contact',
        '/pricing',
        '/features',
        '/blog',
        '/legal',
      ]
      
      return publicPaths.some(path => 
        pathname === path || pathname.startsWith(`${path}/`)
      )
    },
  
    /**
     * Check if route is auth route
     */
    isAuthRoute: (pathname: string): boolean => {
      return pathname.startsWith('/auth')
    },
  
    /**
     * Check if route requires admin privileges
     */
    requiresAdmin: (pathname: string): boolean => {
      return pathname.startsWith('/admin')
    },
  
    /**
     * Get redirect URL after successful authentication
     */
    getRedirectAfterAuth: (returnTo?: string): string => {
      if (returnTo && routeUtils.requiresAuth(returnTo)) {
        return returnTo
      }
      return PROTECTED_ROUTES.DASHBOARD
    },
  
    /**
     * Get breadcrumb items for a given pathname
     */
    getBreadcrumbs: (pathname: string): Array<{ title: string; href?: string }> => {
      const segments = pathname.split('/').filter(Boolean)
      const breadcrumbs: Array<{ title: string; href?: string }> = []
  
      let currentPath = ''
      for (const segment of segments) {
        currentPath += `/${segment}`
        const metadata = ROUTE_METADATA[currentPath as keyof typeof ROUTE_METADATA]
        
        breadcrumbs.push({
          title: metadata?.title || segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath,
        })
      }
  
      return breadcrumbs
    },
  }