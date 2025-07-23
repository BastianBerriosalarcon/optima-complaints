import { renderHook } from '@testing-library/react'
import { useRole } from '../useRole'
import { useAuth } from '../useAuth'

jest.mock('../useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('useRole Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null values when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false
    })

    const { result } = renderHook(() => useRole())

    expect(result.current.role).toBeNull()
    expect(result.current.concesionarioId).toBeNull()
    expect(result.current.isRole('admin_concesionario')).toBe(false)
    expect(result.current.hasPermission('leads:view')).toBe(false)
  })

  it('correctly identifies user role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'admin_concesionario', tenant_id: 'test-tenant' },
      loading: false,
      error: null,
      isAuthenticated: true
    })

    const { result } = renderHook(() => useRole())

    expect(result.current.role).toBe('admin_concesionario')
    expect(result.current.concesionarioId).toBe('test-tenant')
    expect(result.current.isRole('admin_concesionario')).toBe(true)
    expect(result.current.isRole('super_admin')).toBe(false)
  })

  it('checks multiple roles correctly', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'admin_concesionario', tenant_id: 'test-tenant' },
      loading: false,
      error: null,
      isAuthenticated: true
    })

    const { result } = renderHook(() => useRole())

    expect(result.current.isRole(['admin_concesionario', 'super_admin'])).toBe(true)
    expect(result.current.isRole(['gerente_ventas', 'asesor_ventas'])).toBe(false)
  })

  it('validates permissions for admin_concesionario', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'admin_concesionario', tenant_id: 'test-tenant' },
      loading: false,
      error: null,
      isAuthenticated: true
    })

    const { result } = renderHook(() => useRole())

    expect(result.current.hasPermission('leads:view')).toBe(true)
    expect(result.current.hasPermission('config:edit')).toBe(true)
    expect(result.current.hasPermission('users:create')).toBe(false) // This permission doesn't exist
  })

  it('validates permissions for asesor_ventas', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'asesor_ventas', tenant_id: 'test-tenant' },
      loading: false,
      error: null,
      isAuthenticated: true
    })

    const { result } = renderHook(() => useRole())

    expect(result.current.hasPermission('leads:view')).toBe(true)
    expect(result.current.hasPermission('leads:assign')).toBe(false)
    expect(result.current.hasPermission('config:edit')).toBe(false)
  })

  it('checks module access correctly for gerente_ventas', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'gerente_ventas', tenant_id: 'test-tenant' },
      loading: false,
      error: null,
      isAuthenticated: true
    })

    const { result } = renderHook(() => useRole())

    expect(result.current.canAccessModule('ventas')).toBe(true)
    expect(result.current.canAccessModule('post_venta')).toBe(false)
    expect(result.current.canAccessModule('config')).toBe(true) // Corregido: gerente_ventas tiene usuarios:view y productos:view
    expect(result.current.canAccessModule('metrics')).toBe(true)
  })

  it('checks module access correctly for asesor_ventas', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'asesor_ventas', tenant_id: 'test-tenant' },
      loading: false,
      error: null,
      isAuthenticated: true
    })

    const { result } = renderHook(() => useRole())

    expect(result.current.canAccessModule('ventas')).toBe(true)
    expect(result.current.canAccessModule('post_venta')).toBe(false)
    expect(result.current.canAccessModule('config')).toBe(true) // asesor_ventas tiene productos:view
    expect(result.current.canAccessModule('metrics')).toBe(true)
  })

  it('validates hasAnyPermission correctly', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'asesor_ventas', tenant_id: 'test-tenant' },
      loading: false,
      error: null,
      isAuthenticated: true
    })

    const { result } = renderHook(() => useRole())

    expect(result.current.hasAnyPermission(['leads:view', 'config:edit'])).toBe(true)
    expect(result.current.hasAnyPermission(['config:edit', 'reclamos:assign'])).toBe(false)
  })

  it('validates hasAllPermissions correctly', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', role: 'admin_concesionario', tenant_id: 'test-tenant' },
      loading: false,
      error: null,
      isAuthenticated: true
    })

    const { result } = renderHook(() => useRole())

    expect(result.current.hasAllPermissions(['leads:view', 'leads:edit'])).toBe(true)
    expect(result.current.hasAllPermissions(['leads:view', 'nonexistent:permission'])).toBe(false)
  })
})