# Plan de Testing Automatizado - Optima-CX (Módulo de Reclamos)

## Configuración Identificada
- **Framework**: Next.js 14 con TypeScript
- **Arquitectura**: Frontend + Supabase Backend (para el módulo de reclamos)
- **Componentes**: Radix UI + Tailwind CSS
- **Autenticación**: Supabase Auth con RLS

## 1. Tests de Componentes (Unit Testing)

### A. Componentes de UI Core (Ejemplo)
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
})
```

### B. Componentes del Módulo de Reclamos
```typescript
// tests/components/reclamos/ComplaintStatusBadge.test.tsx
import { render, screen } from '@testing-library/react'
import { ComplaintStatusBadge } from '@/components/reclamos/ComplaintStatusBadge'

describe('ComplaintStatusBadge Component', () => {
  it('renders 'nuevo' status correctly', () => {
    render(<ComplaintStatusBadge status="nuevo" />)
    expect(screen.getByText('Nuevo')).toBeInTheDocument()
    expect(screen.getByTestId('status-badge')).toHaveClass('bg-blue-100')
  })

  it('renders 'resuelto' status correctly', () => {
    render(<ComplaintStatusBadge status="resuelto" />)
    expect(screen.getByText('Resuelto')).toBeInTheDocument()
    expect(screen.getByTestId('status-badge')).toHaveClass('bg-green-100')
  })
})
```

### C. Componentes de Autenticación
```typescript
// tests/components/auth/RoleGuard.test.tsx
import { render, screen } from '@testing-library/react'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { useAuth } from '@/hooks/useAuth'

jest.mock('@/hooks/useAuth')

describe('RoleGuard Component', () => {
  it('renders children when user has required role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', role: 'jefe_servicio' },
      loading: false
    })

    render(
      <RoleGuard allowedRoles={['jefe_servicio', 'admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
```

## 2. Tests de Integración (Integration Testing)

### A. Flujo de Creación de Reclamo
```typescript
// tests/integration/complaint-creation.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ComplaintForm from '@/components/reclamos/ComplaintForm'

describe('Complaint Creation Integration', () => {
  it('submits the form and creates a new complaint', async () => {
    render(<ComplaintForm />)

    // Llenar campos del formulario
    fireEvent.change(screen.getByLabelText(/nombre del cliente/i), {
      target: { value: 'Juan Pérez' }
    })
    fireEvent.change(screen.getByLabelText(/teléfono/i), {
      target: { value: '+56912345678' }
    })
    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: 'El vehículo presenta un ruido en el motor.' }
    })

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /registrar reclamo/i }))

    // Esperar la respuesta (mock de la API)
    await waitFor(() => {
      expect(screen.getByText(/reclamo creado exitosamente/i)).toBeInTheDocument()
    })
  })
})
```

### B. Control de Acceso al Dashboard de Reclamos
```typescript
// tests/integration/dashboard-access.test.tsx
import { render, screen } from '@testing-library/react'
import DashboardReclamosPage from '@/app/dashboard/reclamos/page'
import { useAuth } from '@/hooks/useAuth'

jest.mock('@/hooks/useAuth')

describe('Complaints Dashboard Access Control', () => {
  it('shows dashboard for authenticated users with correct role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', role: 'asesor_servicio', concesionario_id: '1' },
      loading: false
    })

    render(<DashboardReclamosPage />)
    expect(screen.getByText(/gestión de reclamos/i)).toBeInTheDocument()
  })
})
```

## 3. Tests End-to-End (E2E Testing)

### A. Flujo Completo de Gestión de un Reclamo
```typescript
// tests/e2e/complaint-journey.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Complete Complaint Management Journey', () => {
  test('user can create, view, and resolve a complaint', async ({ page }) => {
    // 1. Iniciar sesión
    await page.goto('http://localhost:3000/sign-in')
    await page.fill('[data-testid="email"]', 'asesor@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="submit-signin"]')
    await expect(page).toHaveURL(/.*dashboard/)

    // 2. Ir a crear reclamo
    await page.click('a[href="/dashboard/reclamos/nuevo"]')
    await expect(page.locator('h1')).toHaveText('Nuevo Reclamo')

    // 3. Llenar y enviar formulario
    await page.fill('[data-testid="cliente-nombre"]', 'Ana Gómez')
    await page.fill('[data-testid="descripcion"]', 'Falla en el sistema de frenos.')
    await page.click('[data-testid="submit-complaint"]')

    // 4. Verificar que el reclamo aparece en la tabla
    await expect(page.locator('table')).toContainText('Ana Gómez')
    await expect(page.locator('table')).toContainText('Falla en el sistema de frenos')

    // 5. Abrir y resolver el reclamo
    await page.click('text=Ver')
    await page.selectOption('[data-testid="estado-select"]', 'resuelto')
    await page.click('button:has-text("Guardar")')

    // 6. Verificar cambio de estado en la tabla
    await expect(page.locator('table')).toContainText('Resuelto')
  })
})
```

## 4. Tests de API (API Testing)

### A. Endpoints del Módulo de Reclamos
```typescript
// tests/api/complaints.test.ts
describe('/api/reclamos endpoint', () => {
  it('POST /api/reclamos/crear should create a complaint', async () => {
    const response = await fetch('/api/reclamos/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cliente_nombre: 'Test Client', descripcion: 'Test desc' })
    });
    expect(response.status).toBe(201)
    const data = await response.json();
    expect(data.id).toBeDefined();
  })

  it('GET /api/reclamos should return a list of complaints', async () => {
    const response = await fetch('/api/reclamos');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  })
})
```

## 5. Tests de Performance y Seguridad

(Las secciones de Performance y Seguridad se mantienen igual, ya que son aplicables a toda la plataforma).

## Configuración de Testing

(La configuración de Jest y Playwright se mantiene sin cambios).

## Scripts de Package.json

(Los scripts de `package.json` se mantienen sin cambios).

## Métricas de Calidad

1.  **Cobertura de Código**: Mínimo 80% para el módulo de reclamos.
2.  **Tests de Componentes**: 100% de componentes críticos del flujo de reclamos.
3.  **Tests E2E**: Flujo completo de creación, asignación y resolución de reclamos.
4.  **Performance**: Core Web Vitals dentro de límites aceptables para el dashboard de reclamos.
5.  **Seguridad**: Tests automatizados para vulnerabilidades comunes en los formularios de reclamos.

Este plan proporciona cobertura completa para el módulo de reclamos de Óptima-CX, asegurando su calidad, seguridad y performance.