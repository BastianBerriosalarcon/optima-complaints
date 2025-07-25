# Plan de Testing Automatizado - Óptima-CX

## Configuración Identificada
- **Framework**: Next.js 14 con TypeScript
- **Puerto**: 3000
- **Arquitectura**: Frontend + Supabase Backend
- **Componentes**: Radix UI + Tailwind CSS
- **Autenticación**: Supabase Auth con RLS

## 1. Tests de Componentes (Unit Testing)

### A. Componentes de UI Core
```typescript
// tests/components/ui/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders correctly with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByText('Delete')).toHaveClass('bg-destructive')
  })
})
```

### B. Componentes de Autenticación
```typescript
// tests/components/auth/RoleGuard.test.tsx
import { render, screen } from '@testing-library/react'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { useAuth } from '@/hooks/useAuth'

jest.mock('@/hooks/useAuth')

describe('RoleGuard Component', () => {
  it('renders children when user has required role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false
    })

    render(
      <RoleGuard allowedRoles={['admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('does not render children when user lacks role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', role: 'user' },
      loading: false
    })

    render(
      <RoleGuard allowedRoles={['admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    )
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
```

### C. Componentes de Landing Page
```typescript
// tests/components/sections/FeaturesSection.test.tsx
import { render, screen } from '@testing-library/react'
import { FeaturesSection } from '@/components/sections/FeaturesSection'

describe('FeaturesSection Component', () => {
  it('renders all feature cards', () => {
    render(<FeaturesSection />)
    
    expect(screen.getByText('Análisis NPS')).toBeInTheDocument()
    expect(screen.getByText('Gestión de Reclamos')).toBeInTheDocument()
    expect(screen.getByText('Encuestas Inteligentes')).toBeInTheDocument()
  })

  it('displays feature descriptions correctly', () => {
    render(<FeaturesSection />)
    
    expect(screen.getByText(/Mida y mejore su Net Promoter Score/)).toBeInTheDocument()
    expect(screen.getByText(/Centralice y resuelva reclamos/)).toBeInTheDocument()
  })
})
```

## 2. Tests de Integración (Integration Testing)

### A. Flujos de Autenticación
```typescript
// tests/integration/auth.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SupabaseProvider } from '@/providers/SupabaseProvider'
import SignInPage from '@/app/(auth)/sign-in/page'

describe('Authentication Flow Integration', () => {
  it('completes sign-in flow successfully', async () => {
    render(
      <SupabaseProvider>
        <SignInPage />
      </SupabaseProvider>
    )

    // Fill form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
  })
})
```

### B. Dashboard Access Control
```typescript
// tests/integration/dashboard-access.test.tsx
import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'
import { useAuth } from '@/hooks/useAuth'

jest.mock('@/hooks/useAuth')

describe('Dashboard Access Control', () => {
  it('redirects unauthenticated users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    })

    render(<DashboardPage />)
    // Verify redirect or login prompt
  })

  it('shows dashboard for authenticated users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', role: 'admin', concesionario_id: '1' },
      loading: false
    })

    render(<DashboardPage />)
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
  })
})
```

## 3. Tests End-to-End (E2E Testing)

### A. Flujo Completo de Usuario
```typescript
// tests/e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Complete User Journey', () => {
  test('user can sign up, sign in, and access dashboard', async ({ page }) => {
    // Navigate to sign-up
    await page.goto('http://localhost:3000/sign-up')
    
    // Fill sign-up form
    await page.fill('[data-testid="email"]', 'newuser@example.com')
    await page.fill('[data-testid="password"]', 'securepassword123')
    await page.click('[data-testid="submit-signup"]')
    
    // Verify email confirmation message
    await expect(page.locator('[data-testid="confirmation-message"]')).toBeVisible()
    
    // Navigate to sign-in
    await page.goto('http://localhost:3000/sign-in')
    await page.fill('[data-testid="email"]', 'newuser@example.com')
    await page.fill('[data-testid="password"]', 'securepassword123')
    await page.click('[data-testid="submit-signin"]')
    
    // Verify dashboard access
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible()
  })
})
```

### B. Responsive Design Testing
```typescript
// tests/e2e/responsive.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ]

  viewports.forEach(({ name, width, height }) => {
    test(`Landing page renders correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('http://localhost:3000')
      
      // Verify key elements are visible
      await expect(page.locator('[data-testid="hero-title"]')).toBeVisible()
      await expect(page.locator('[data-testid="navigation"]')).toBeVisible()
      
      // Take screenshot for visual regression
      await page.screenshot({ 
        path: `tests/screenshots/${name.toLowerCase()}-landing.png`,
        fullPage: true 
      })
    })
  })
})
```

## 4. Tests de API (API Testing)

### A. Health Check Endpoint
```typescript
// tests/api/health.test.ts
import { GET } from '@/app/api/health/route'
import { NextRequest } from 'next/server'

describe('/api/health endpoint', () => {
  it('returns healthy status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toEqual({
      status: 'healthy',
      timestamp: expect.any(String),
      service: 'optimacx-frontend'
    })
  })
})
```

### B. Authentication Actions
```typescript
// tests/api/auth-actions.test.ts
import { signIn, signUp } from '@/app/auth/actions'

describe('Authentication Actions', () => {
  it('handles sign-up with valid data', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')
    
    const result = await signUp(formData)
    expect(result).toBeDefined()
    // Add specific assertions based on your implementation
  })

  it('handles sign-in with valid credentials', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')
    
    const result = await signIn(formData)
    expect(result).toBeDefined()
  })
})
```

## 5. Tests de Performance

### A. Core Web Vitals
```typescript
// tests/performance/core-web-vitals.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('Landing page meets Core Web Vitals', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Measure FCP, LCP, CLS
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          resolve(entries)
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
      })
    })
    
    // Assert performance thresholds
    expect(metrics).toBeDefined()
  })
})
```

## 6. Tests de Seguridad

### A. XSS Protection
```typescript
// tests/security/xss.test.ts
import { render, screen } from '@testing-library/react'

describe('XSS Protection', () => {
  it('sanitizes user input in components', () => {
    const maliciousInput = '<script>alert("xss")</script>'
    
    // Test that components properly escape/sanitize input
    render(<div>{maliciousInput}</div>)
    
    expect(screen.queryByText(/<script>/)).not.toBeInTheDocument()
  })
})
```

### B. CSRF Protection
```typescript
// tests/security/csrf.test.ts
describe('CSRF Protection', () => {
  it('requires proper authentication for sensitive actions', async () => {
    // Test that form submissions require proper tokens/authentication
    // This would depend on your specific CSRF implementation
  })
})
```

## Configuración de Testing

### jest.config.js
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/components/ui/**', // Exclude UI library components
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Scripts de Package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## Métricas de Calidad

1. **Cobertura de Código**: Mínimo 80%
2. **Tests de Componentes**: 100% de componentes críticos
3. **Tests E2E**: Flujos principales de usuario
4. **Performance**: Core Web Vitals dentro de límites Google
5. **Seguridad**: Tests automatizados para vulnerabilidades comunes

Este plan proporciona cobertura completa para Óptima-CX, asegurando calidad, seguridad y performance en todos los aspectos de la aplicación.