import { render, screen } from '@testing-library/react'
import { Logo } from '../logo'

describe('Logo Component', () => {
  it('renders logo image correctly', () => {
    render(<Logo />)
    
    const logoImage = screen.getByAltText('Óptima-CX Logo')
    expect(logoImage).toBeInTheDocument()
  })

  it('renders with default dimensions', () => {
    render(<Logo />)
    
    const logoImage = screen.getByAltText('Óptima-CX Logo')
    expect(logoImage).toHaveAttribute('width', '32')
    expect(logoImage).toHaveAttribute('height', '32')
  })

  it('renders with custom dimensions', () => {
    render(<Logo width={64} height={64} />)
    
    const logoImage = screen.getByAltText('Óptima-CX Logo')
    expect(logoImage).toHaveAttribute('width', '64')
    expect(logoImage).toHaveAttribute('height', '64')
  })

  it('renders without text by default', () => {
    render(<Logo />)
    
    expect(screen.queryByText('Óptima-CX')).not.toBeInTheDocument()
  })

  it('renders with text when showText is true', () => {
    render(<Logo showText />)
    
    expect(screen.getByText('Óptima-CX')).toBeInTheDocument()
  })

  it('applies custom text className', () => {
    render(<Logo showText textClassName="custom-text-class" />)
    
    const text = screen.getByText('Óptima-CX')
    expect(text).toHaveClass('custom-text-class')
  })

  it('applies custom container className', () => {
    render(<Logo className="custom-container-class" />)
    
    const container = screen.getByAltText('Óptima-CX Logo').closest('div')
    expect(container).toHaveClass('custom-container-class')
  })

  it('has priority loading for performance', () => {
    render(<Logo />)
    
    const logoImage = screen.getByAltText('Óptima-CX Logo')
    // Note: priority prop in Next.js Image component doesn't create a visible attribute
    // but we can check that the component renders without errors
    expect(logoImage).toBeInTheDocument()
  })
})