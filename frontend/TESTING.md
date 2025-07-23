# Testing en Óptima-CX

## Configuración Completa de Testing Automatizado

Este proyecto incluye una suite completa de testing automatizado que cubre:
- **Tests Unitarios** con Jest y React Testing Library
- **Tests de Integración** para flujos completos
- **Tests End-to-End** con Playwright
- **Tests de Performance** y Core Web Vitals
- **Tests de Seguridad** básicos

## Instalación y Configuración

### Setup Inicial
```bash
# Ejecutar script de configuración
./setup-testing.sh

# O manualmente:
npm install
npx playwright install

# Para E2E tests, instalar dependencias de sistema:
sudo ./install-playwright-deps.sh
# O manualmente:
sudo npx playwright install-deps
```

### Estructura de Tests
```
frontend/
├── src/
│   └── components/
│       └── __tests__/           # Tests unitarios de componentes
├── tests/
│   └── e2e/                     # Tests End-to-End con Playwright
├── test-results/                # Resultados y screenshots
├── jest.config.js               # Configuración Jest
├── jest.setup.js                # Setup Jest con mocks
└── playwright.config.ts         # Configuración Playwright
```

## Comandos de Testing

### Tests Unitarios (Jest)
```bash
# Ejecutar todos los tests unitarios
npm run test

# Modo watch (re-ejecuta al cambiar archivos)
npm run test:watch

# Tests con reporte de cobertura
npm run test:coverage

# Ejecutar test específico
npm run test -- hero.test.tsx
```

### Tests End-to-End (Playwright)
```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Tests E2E con interfaz visual
npm run test:e2e:ui

# Tests E2E con navegador visible
npm run test:e2e:headed

# Test específico
npm run test:e2e -- landing-page.spec.ts
```

### Todos los Tests
```bash
# Ejecutar unitarios + E2E
npm run test:all
```

## Tests Implementados

### 1. Tests Unitarios

#### Componentes Core
- ✅ `hero.test.tsx` - Componente Hero de landing page
- ✅ `FeaturesSection.test.tsx` - Sección de características
- ✅ `button.test.tsx` - Componente Button UI

#### Coverage Objetivo
- **Líneas**: 70%+
- **Funciones**: 70%+
- **Branches**: 70%+
- **Statements**: 70%+

### 2. Tests End-to-End

#### Landing Page (`landing-page.spec.ts`)
- ✅ Navegación principal
- ✅ Hero section
- ✅ Sección de características
- ✅ Stats y métricas
- ✅ Footer y enlaces
- ✅ Responsive design

#### Autenticación (`auth-flow.spec.ts`)
- ✅ Páginas de sign-up/sign-in
- ✅ Validación de formularios
- ✅ Navegación entre páginas auth
- ✅ Protección de rutas

### 3. Tests de Performance

#### Core Web Vitals
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1

## Mocks y Setup

### Mocks Configurados
```javascript
// Next.js Router
jest.mock('next/navigation')

// Supabase Client  
jest.mock('@/utils/supabase/client')

// Globals
- ResizeObserver
- IntersectionObserver
- window.matchMedia
```

### Variables de Entorno de Test
```bash
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
```

## Mejores Prácticas

### Tests Unitarios
1. **Arrange, Act, Assert** - Estructura clara
2. **Test behavior, not implementation** - Enfócate en qué hace, no cómo
3. **Descriptive test names** - Nombres que explican el escenario
4. **One assertion per test** - Tests focused y claros

### Tests E2E
1. **Page Object Pattern** - Reutilizar selectores
2. **Wait for elements** - Usar `waitFor` y `expect`
3. **Independent tests** - Cada test debe poder ejecutarse solo
4. **Clean up** - Limpiar datos entre tests

### Performance
1. **Parallel execution** - Tests en paralelo cuando sea posible
2. **Mock external APIs** - No depender de servicios externos
3. **Optimize selectors** - Usar `data-testid` para elementos críticos

## Debugging Tests

### Jest Debug
```bash
# Debug test específico
npm run test -- --debug hero.test.tsx

# Verbose output
npm run test -- --verbose
```

### Playwright Debug
```bash
# Debug mode con navegador visible
npm run test:e2e:headed

# Playwright Inspector
npm run test:e2e -- --debug
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    npm run test:coverage
    npm run test:e2e
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

### Coverage Reports
- Generados en `coverage/lcov-report/index.html`
- Integración con Codecov para tracking
- Threshold de 70% para pasar CI

## Arquitectura Multitenant

### Testing con RLS
```javascript
// Mock tenant context
const mockTenant = {
  id: 'concesionario_001',
  name: 'Test Concesionario'
}

// Tests aislados por tenant
describe('Dashboard with tenant isolation', () => {
  beforeEach(() => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      user: { concesionario_id: 'concesionario_001' }
    })
  })
})
```

### Data Isolation Tests
- Verificar que queries incluyan filtros de tenant
- Confirmar aislamiento de datos entre concesionarios
- Tests de seguridad para prevenir data leaks

## Reportes y Métricas

### Jest Coverage Report
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Playwright Test Report
```bash
npm run test:e2e
npx playwright show-report
```

### Visual Regression Testing
- Screenshots automáticos en diferentes viewports
- Comparación visual entre builds
- Stored en `test-results/screenshots/`

## Próximos Pasos

### Tests Pendientes
- [ ] Tests de componentes de Dashboard
- [ ] Tests de formularios de encuestas
- [ ] Tests de integración con Supabase
- [ ] Tests de componentes de reclamos
- [ ] Tests de roles y permisos

### Mejoras Futuras
- [ ] Visual regression testing
- [ ] Tests de accessibility (a11y)
- [ ] Tests de internacionalización
- [ ] Tests de PWA capabilities
- [ ] Performance benchmarking

---

Para más información sobre testing en Next.js: https://nextjs.org/docs/app/building-your-application/testing