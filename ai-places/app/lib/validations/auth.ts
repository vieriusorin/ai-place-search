import { z } from 'zod'

/**
 * Common validation patterns
 */
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

/**
 * Sign up validation schema
 */
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters'),
    acceptTerms: z
      .boolean()
      .refine(val => val === true, 'You must accept the terms and conditions'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/**
 * Sign in validation schema
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

/**
 * Reset password validation schema
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/**
 * Change password validation schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

/**
 * Email verification schema
 */
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

/**
 * Two-factor authentication setup schema
 */
export const twoFactorSetupSchema = z.object({
  secret: z.string().min(1, 'Secret is required'),
  token: z
    .string()
    .length(6, 'Token must be 6 digits')
    .regex(/^\d+$/, 'Token must contain only numbers'),
})

/**
 * Two-factor authentication verification schema
 */
export const twoFactorVerificationSchema = z.object({
  token: z
    .string()
    .length(6, 'Token must be 6 digits')
    .regex(/^\d+$/, 'Token must contain only numbers'),
})

/**
 * Social auth callback schema
 */
export const socialAuthCallbackSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
})

/**
 * Magic link request schema
 */
export const magicLinkSchema = z.object({
  email: emailSchema,
  redirectTo: z.string().url().optional(),
})

/**
 * Account deletion confirmation schema
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required for account deletion'),
  confirmation: z
    .string()
    .refine(val => val === 'DELETE', 'Type DELETE to confirm account deletion'),
})

/**
 * Type inference from schemas
 */
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>
export type TwoFactorSetupInput = z.infer<typeof twoFactorSetupSchema>
export type TwoFactorVerificationInput = z.infer<typeof twoFactorVerificationSchema>
export type SocialAuthCallbackInput = z.infer<typeof socialAuthCallbackSchema>
export type MagicLinkInput = z.infer<typeof magicLinkSchema>
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>

/**
 * Common validation utilities
 */
export const validationUtils = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    return emailSchema.safeParse(email).success
  },

  /**
   * Validate password strength
   */
  isValidPassword: (password: string): boolean => {
    return passwordSchema.safeParse(password).success
  },

  /**
   * Get password strength score (0-4)
   */
  getPasswordStrength: (password: string): number => {
    let score = 0
    
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
    
    return Math.min(score, 4)
  },

  /**
   * Get password strength label
   */
  getPasswordStrengthLabel: (score: number): string => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
    return labels[score] || 'Very Weak'
  },
}