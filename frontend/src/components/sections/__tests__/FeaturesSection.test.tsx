import { render, screen } from '@testing-library/react'
import FeaturesSection from '../FeaturesSection'

describe('FeaturesSection Component', () => {
  it('renders the main section heading', () => {
    render(<FeaturesSection />)
    
    const heading = screen.getByRole('heading', { 
      name: /transforme la experiencia de sus clientes/i 
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders all feature cards', () => {
    render(<FeaturesSection />)
    
    // Verify all key features are present
    expect(screen.getByText('Análisis NPS')).toBeInTheDocument()
    expect(screen.getByText('Gestión de Reclamos')).toBeInTheDocument()
    expect(screen.getByText('Encuestas Inteligentes')).toBeInTheDocument()
    expect(screen.getByText('Seguridad Enterprise')).toBeInTheDocument()
    expect(screen.getByText('Dashboard Ejecutivo')).toBeInTheDocument()
  })

  it('displays feature descriptions', () => {
    render(<FeaturesSection />)
    
    expect(screen.getByText(/mida y mejore su net promoter score/i)).toBeInTheDocument()
    expect(screen.getByText(/centralice y resuelva reclamos/i)).toBeInTheDocument()
    expect(screen.getByText(/capture feedback valioso/i)).toBeInTheDocument()
  })

  it('renders feature icons', () => {
    render(<FeaturesSection />)
    
    // Check for SVG icons (they should have appropriate ARIA labels or test IDs)
    const icons = screen.getAllByTestId('feature-icon')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('has proper semantic structure', () => {
    render(<FeaturesSection />)
    
    // Check for proper section structure
    const section = screen.getByRole('region', { name: /transforme la experiencia de sus clientes/i });
    expect(section).toBeInTheDocument();
    const heading = screen.getByRole('heading', { name: /transforme la experiencia de sus clientes/i });
    expect(section).toContainElement(heading);
  })
})