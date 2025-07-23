import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has correct title and meta description', async ({ page }) => {
    await expect(page).toHaveTitle(/Óptima-CX - Plataforma de Experiencia del Cliente Automotriz/)
    
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /Plataforma SaaS para concesionarios automotrices/)
  })

  test('displays main navigation correctly', async ({ page }) => {
    const navbar = page.locator('nav')
    await expect(navbar).toBeVisible()
    
    const logo = page.locator('img[alt*="Óptima-CX Logo"]')
    await expect(logo).toBeVisible()
    
    const brandName = page.locator('text=Óptima-CX').first()
    await expect(brandName).toBeVisible()
  })

  test('hero section renders correctly', async ({ page }) => {
    const heroTitle = page.locator('h1').filter({ hasText: /Transforme la Experiencia/ })
    await expect(heroTitle).toBeVisible()
    
    const heroDescription = page.locator('text=La plataforma que permite a concesionarios')
    await expect(heroDescription).toBeVisible()
    
    const ctaButton = page.locator('text=Comenzar Prueba Gratuita').first()
    await expect(ctaButton).toBeVisible()
  })

  test('features section displays all key features', async ({ page }) => {
    await expect(page.locator('text=Análisis NPS')).toBeVisible()
    await expect(page.locator('text=Gestión de Reclamos')).toBeVisible()
    await expect(page.locator('text=Encuestas Inteligentes')).toBeVisible()
    await expect(page.locator('text=Seguridad Enterprise')).toBeVisible()
    await expect(page.locator('text=Dashboard Ejecutivo')).toBeVisible()
  })

  test('stats section shows key metrics', async ({ page }) => {
    await expect(page.locator('text=+25%')).toBeVisible()
    await expect(page.locator('text=Mejora en NPS')).toBeVisible()
    await expect(page.locator('text=-60%')).toBeVisible()
    await expect(page.locator('text=Tiempo de Resolución')).toBeVisible()
    await expect(page.locator('text=99.9%')).toBeVisible()
    await expect(page.locator('text=Disponibilidad')).toBeVisible()
  })

  test('footer contains all necessary links', async ({ page }) => {
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    
    await expect(footer.locator('text=Características')).toBeVisible()
    await expect(footer.locator('text=Precios')).toBeVisible()
    await expect(footer.locator('text=Panel de Control')).toBeVisible()
    await expect(footer.locator('text=Privacidad')).toBeVisible()
    await expect(footer.locator('text=Términos')).toBeVisible()
  })

  test('CTA buttons navigate to sign-up page', async ({ page }) => {
    const ctaButton = page.locator('text=Comenzar Prueba Gratuita').first()
    await expect(ctaButton).toHaveAttribute('href', '/sign-up')
  })

  test('demo button navigates to dashboard', async ({ page }) => {
    const demoButton = page.locator('text=Ver Demo')
    await expect(demoButton).toHaveAttribute('href', '/dashboard')
  })
})

test.describe('Landing Page Responsive', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ]

  viewports.forEach(({ name, width, height }) => {
    test(`renders correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      
      // Key elements should be visible on all viewports
      await expect(page.locator('h1').filter({ hasText: /Transforme la Experiencia/ })).toBeVisible()
      await expect(page.locator('nav')).toBeVisible()
      await expect(page.locator('text=Comenzar Prueba Gratuita').first()).toBeVisible()
      
      // Take screenshot for visual regression testing
      await page.screenshot({ 
        path: `test-results/screenshots/${name.toLowerCase()}-landing.png`,
        fullPage: true 
      })
    })
  })
})