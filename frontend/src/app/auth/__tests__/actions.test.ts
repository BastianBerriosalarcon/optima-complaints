import { signUpAction, signInAction } from '../actions'
import { createClient } from '../../../../supabase/server'
import { encodedRedirect } from '@/utils/utils'
import { headers } from 'next/headers'

// Mock Next.js APIs
jest.mock('next/headers')
jest.mock('next/navigation')
jest.mock('@/utils/utils')
jest.mock('../../../../supabase/server')
jest.mock('../../user/actions')

const mockHeaders = headers as jest.MockedFunction<typeof headers>
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockEncodedRedirect = encodedRedirect as jest.MockedFunction<typeof encodedRedirect>

describe('Auth Actions', () => {
  const mockSupabase = {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase as any)
    mockHeaders.mockReturnValue({
      get: jest.fn().mockReturnValue('http://localhost:3000')
    } as any)
    mockEncodedRedirect.mockImplementation((type, path, message) => ({ type, path, message }))
    
    // Set default return values for supabase methods
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: null
    })
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: null
    })
  })

  describe('signUpAction', () => {
    it('validates required fields', async () => {
      const formData = new FormData()
      formData.append('email', '')
      formData.append('password', '')

      await signUpAction(formData)

      expect(mockEncodedRedirect).toHaveBeenCalledWith(
        'error',
        '/sign-up',
        'El correo electrónico y la contraseña son obligatorios'
      )
    })

    it('handles successful sign up', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('full_name', 'Test User')

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null
      })

      await signUpAction(formData)

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
          data: {
            full_name: 'Test User',
            email: 'test@example.com'
          }
        }
      })

      expect(mockEncodedRedirect).toHaveBeenCalledWith(
        'success',
        '/sign-up',
        '¡Gracias por registrarte! Por favor revisa tu correo electrónico para el enlace de verificación.'
      )
    })

    it('handles sign up errors', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'weak')

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { code: 'weak_password', message: 'Password is too weak' }
      })

      await signUpAction(formData)

      expect(mockEncodedRedirect).toHaveBeenCalledWith(
        'error',
        '/sign-up',
        'Password is too weak'
      )
    })
  })

  describe('signInAction', () => {
    it('calls signInWithPassword with provided credentials', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      await signInAction(formData)

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('handles successful sign in', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null
      })

      await signInAction(formData)

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('handles sign in errors', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'wrongpassword')

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { code: 'invalid_credentials', message: 'Invalid credentials' }
      })

      await signInAction(formData)

      expect(mockEncodedRedirect).toHaveBeenCalledWith(
        'error',
        '/sign-in',
        'Invalid credentials'
      )
    })
  })
})