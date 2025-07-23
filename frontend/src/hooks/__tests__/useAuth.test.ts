import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { AuthService } from '@/services/AuthService'

// Mock AuthService
jest.mock('@/services/AuthService')
const MockedAuthService = AuthService as jest.MockedClass<typeof AuthService>

describe('useAuth Hook', () => {
  const mockGetCurrentUser = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    MockedAuthService.mockImplementation(() => ({
      getCurrentUser: mockGetCurrentUser,
    } as any))
  })

  it('starts with loading state', () => {
    mockGetCurrentUser.mockImplementation(() => new Promise(() => {})) // Never resolves

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets user when authentication succeeds', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      role: 'admin_concesionario',
      tenant_id: 'test-tenant'
    }

    mockGetCurrentUser.mockResolvedValue({
      success: true,
      data: mockUser
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('handles authentication failure', async () => {
    mockGetCurrentUser.mockResolvedValue({
      success: false,
      error: 'Authentication failed'
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe('Authentication failed')
  })

  it('handles service errors', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('Service unavailable'))

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe('Service unavailable')
  })

  it('handles unknown errors', async () => {
    mockGetCurrentUser.mockRejectedValue('Unknown error')

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBe('Unknown error')
  })
})