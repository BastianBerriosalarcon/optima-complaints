import { render, screen } from '@testing-library/react'
import Hero from '../hero'

describe('Hero Component', () => {
  it('renders the main heading', () => {
    render(<Hero />)
    
    const heading = screen.getByRole('heading', { 
      name: /transforme la experiencia de sus clientes automotrices/i 
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<Hero />)
    
    const description = screen.getByText(/la plataforma que permite a concesionarios/i)
    expect(description).toBeInTheDocument()
  })

  it('renders the CTA button', () => {
    render(<Hero />)
    
    const ctaButton = screen.getByRole('link', { 
      name: /comenzar prueba gratuita/i 
    })
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton).toHaveAttribute('href', '/sign-up')
  })

  it('renders feature highlights', () => {
    render(<Hero />)
    
    expect(screen.getByText(/30 días gratis/i)).toBeInTheDocument()
    expect(screen.getByText(/configuración incluida/i)).toBeInTheDocument()
    expect(screen.getByText(/soporte 24\/7/i)).toBeInTheDocument()
  })

  it('displays the Óptima-CX brand correctly', () => {
    render(<Hero />)
    
    const brandName = screen.getByText('Óptima-CX')
    expect(brandName).toBeInTheDocument()
  })
})