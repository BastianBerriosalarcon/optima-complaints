import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import NavbarClient from '../NavbarClient'
import { useAuth } from '@/hooks/useAuth'

jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('NavbarClient Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sign in and sign up buttons when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false
    })

    render(<NavbarClient />)

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByText('Registrarse')).toBeInTheDocument()
  })

  it('renders user menu when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        id: '1', 
        email: 'test@example.com',
        role: 'admin_concesionario',
        tenant_id: 'test-tenant'
      },
      loading: false,
      error: null,
      isAuthenticated: true
    })

    render(<NavbarClient />)

    expect(screen.getByText('Panel de Control')).toBeInTheDocument()
    expect(screen.queryByText('Iniciar Sesión')).not.toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false
    })

    render(<NavbarClient />)

    // Should show loading skeleton
    expect(screen.getByText(/Óptima-CX/)).toBeInTheDocument() // Logo still shows
    expect(screen.queryByText('Iniciar Sesión')).not.toBeInTheDocument() // Auth buttons hidden
    expect(screen.queryByText('Registrarse')).not.toBeInTheDocument()
  })

  it('renders correct navigation links when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        id: '1', 
        email: 'test@example.com',
        role: 'admin_concesionario',
        tenant_id: 'test-tenant'
      },
      loading: false,
      error: null,
      isAuthenticated: true
    })

    render(<NavbarClient />)

    const dashboardLink = screen.getByRole('link', { name: /panel de control/i })
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
  })
})