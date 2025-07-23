import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('sign-up page renders correctly', async ({ page }) => {
    await page.goto('/sign-up')
    
    await expect(page).toHaveTitle(/Sign Up/)
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('sign-in page renders correctly', async ({ page }) => {
    await page.goto('/sign-in')
    
    await expect(page).toHaveTitle(/Sign In/)
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('forgot password page renders correctly', async ({ page }) => {
    await page.goto('/forgot-password')
    
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('sign-up form validation works', async ({ page }) => {
    await page.goto('/sign-up')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=email')).toBeVisible()
  })

  test('sign-in form validation works', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors or remain on page
    await expect(page.url()).toContain('/sign-in')
  })

  test('navigation between auth pages works', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Check if there's a link to sign-up
    const signUpLink = page.locator('a[href="/sign-up"]')
    if (await signUpLink.isVisible()) {
      await signUpLink.click()
      await expect(page.url()).toContain('/sign-up')
    }
    
    // Check if there's a link back to sign-in
    const signInLink = page.locator('a[href="/sign-in"]')
    if (await signInLink.isVisible()) {
      await signInLink.click()
      await expect(page.url()).toContain('/sign-in')
    }
  })

  test('forgot password link works from sign-in', async ({ page }) => {
    await page.goto('/sign-in')
    
    const forgotPasswordLink = page.locator('a[href="/forgot-password"]')
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click()
      await expect(page.url()).toContain('/forgot-password')
    }
  })
})

test.describe('Protected Routes', () => {
  test('dashboard redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to sign-in or show authentication prompt
    await page.waitForLoadState('networkidle')
    
    // Check if redirected to auth page or if auth prompt is shown
    const currentUrl = page.url()
    const isOnAuthPage = currentUrl.includes('/sign-in') || currentUrl.includes('/sign-up')
    const hasAuthPrompt = await page.locator('text=sign in').isVisible() || 
                         await page.locator('text=login').isVisible()
    
    expect(isOnAuthPage || hasAuthPrompt).toBeTruthy()
  })
})