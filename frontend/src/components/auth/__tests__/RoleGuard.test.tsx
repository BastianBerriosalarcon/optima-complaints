import React from 'react'
import { render, screen } from '@testing-library/react'
import { RoleGuard, AdminOnly, SalesOnly } from '../RoleGuard'
import { useRole } from '@/hooks/useRole'

jest.mock('@/hooks/useRole')
const mockUseRole = useRole as jest.MockedFunction<typeof useRole>

describe('RoleGuard Component', () => {
  const defaultMockRoleHook = {
    role: null,
    concesionarioId: null,
    isRole: jest.fn().mockReturnValue(false),
    hasPermission: jest.fn().mockReturnValue(false),
    hasAnyPermission: jest.fn().mockReturnValue(false),
    hasAllPermissions: jest.fn().mockReturnValue(false),
    canAccessModule: jest.fn().mockReturnValue(false)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRole.mockReturnValue(defaultMockRoleHook)
  })

  it('renders children when user has required role', () => {
    mockUseRole.mockReturnValue({
      ...defaultMockRoleHook,
      isRole: jest.fn().mockReturnValue(true)
    })

    render(
      <RoleGuard requiredRole="admin_concesionario">
        <div>Protected Content</div>
      </RoleGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('shows fallback when user lacks required role', () => {
    render(
      <RoleGuard requiredRole="admin_concesionario">
        <div>Protected Content</div>
      </RoleGuard>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText('No tienes permisos para ver este contenido')).toBeInTheDocument()
  })

  it('renders children when user has required permission', () => {
    mockUseRole.mockReturnValue({
      ...defaultMockRoleHook,
      hasPermission: jest.fn().mockReturnValue(true)
    })

    render(
      <RoleGuard requiredPermission="leads:view">
        <div>Protected Content</div>
      </RoleGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('hides content when hideOnNoAccess is true', () => {
    render(
      <RoleGuard requiredRole="admin_concesionario" hideOnNoAccess={true}>
        <div>Protected Content</div>
      </RoleGuard>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('No tienes permisos para ver este contenido')).not.toBeInTheDocument()
  })
})

describe('Specialized Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRole.mockReturnValue({
      role: null,
      concesionarioId: null,
      isRole: jest.fn().mockReturnValue(false),
      hasPermission: jest.fn().mockReturnValue(false),
      hasAnyPermission: jest.fn().mockReturnValue(false),
      hasAllPermissions: jest.fn().mockReturnValue(false),
      canAccessModule: jest.fn().mockReturnValue(false)
    })
  })

  it('AdminOnly works for admin roles', () => {
    mockUseRole.mockReturnValue({
      role: 'super_admin',
      concesionarioId: 'test',
      isRole: jest.fn().mockImplementation((roles) => 
        Array.isArray(roles) ? roles.includes('super_admin') : roles === 'super_admin'
      ),
      hasPermission: jest.fn(),
      hasAnyPermission: jest.fn(),
      hasAllPermissions: jest.fn(),
      canAccessModule: jest.fn()
    })

    render(
      <AdminOnly>
        <div>Admin Content</div>
      </AdminOnly>
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('SalesOnly works for ventas module', () => {
    mockUseRole.mockReturnValue({
      role: 'gerente_ventas',
      concesionarioId: 'test',
      isRole: jest.fn(),
      hasPermission: jest.fn(),
      hasAnyPermission: jest.fn(),
      hasAllPermissions: jest.fn(),
      canAccessModule: jest.fn().mockImplementation((module) => module === 'ventas')
    })

    render(
      <SalesOnly>
        <div>Sales Content</div>
      </SalesOnly>
    )

    expect(screen.getByText('Sales Content')).toBeInTheDocument()
  })
})