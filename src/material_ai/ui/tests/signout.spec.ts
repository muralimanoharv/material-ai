import { test, expect } from '@playwright/test'
import { check_health } from './util'

test('has title', async ({ page, request }) => {
  const response = await request.get('/config')
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  expect(response.status()).toBe(200)
  await page.goto('/')
  await expect(page).toHaveTitle(body.title)
})

test('backend health check returns 200', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  expect(body.status).toBe('ok')
  expect(body.appName).toBe('material_ai')
  expect(body.version).toBe('1.4.2') // x-release-please-version
  expect(response.status()).toBe(200)
})

test('backend config check returns 200', async ({ page, request }) => {
  const response = await request.get('/config')
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  expect(response.status()).toBe(200)
  await page.goto('/')
  await expect(page.getByTestId(`page-header`)).toHaveText(body.title)
  await expect(page.getByTestId(`page-title`)).toHaveText(`Meet ${body.title},`)
  await expect(page.getByTestId(`page-subtitle`)).toHaveText(
    'your personal AI assistant,',
  )
})

test('should open the navigation drawer when the menu button is clicked', async ({
  page,
}) => {
  await page.goto('/')
  const menuButton = page.getByTestId('page-menu-button').first()

  await expect(menuButton).toBeVisible()

  await menuButton.click()

  await expect(page.getByTestId('drawer-signin-button')).toBeVisible()

  const settingsButton = page.getByTestId('page-settings-button')
  await expect(settingsButton).toBeVisible()

  await settingsButton.click()

  const themeButton = page.getByTestId('page-theme-button')
  await expect(themeButton).toBeVisible()

  await themeButton.click()

  const lightThemeButton = page.getByTestId('page-theme-light-button')
  const darkThemeButton = page.getByTestId('page-theme-dark-button')
  const systemThemeButton = page.getByTestId('page-theme-system-button')

  await expect(lightThemeButton).toBeVisible()
  await expect(darkThemeButton).toBeVisible()
  await expect(systemThemeButton).toBeVisible()

  await expect(page.getByTestId('page-theme-system-selected')).toBeVisible()
  await expect(page.getByTestId('page-theme-light-selected')).not.toBeVisible()
  await expect(page.getByTestId('page-theme-dark-selected')).not.toBeVisible()

  const targetElement = page.locator('body')

  await lightThemeButton.click()

  await expect(page.getByTestId('page-theme-light-selected')).toBeVisible()
  await expect(targetElement).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  )

  await darkThemeButton.click()

  await expect(page.getByTestId('page-theme-dark-selected')).toBeVisible()
  await expect(targetElement).toHaveCSS('background-color', 'rgb(27, 28, 29)')
})

test('should check health dashboard', async ({ page }) => {
  const health = await check_health(page)
  const menuButton = page.getByTestId('page-menu-button').first()

  await expect(menuButton).toBeVisible()

  await menuButton.click()

  await expect(page.getByTestId('drawer-signin-button')).toBeVisible()

  const settingsButton = page.getByTestId('page-settings-button')
  await expect(settingsButton).toBeVisible()

  await settingsButton.click()

  const healthButton = page.getByTestId('page-health-button')
  await expect(healthButton).toBeVisible()

  await healthButton.click()

  const healthDashboard = page.getByTestId('health-dashboard')
  const systemCard = healthDashboard.getByTestId('system-card')
  const cpuCard = healthDashboard.getByTestId('cpu-card')
  const memoryCard = healthDashboard.getByTestId('memory-card')
  const storageCard = healthDashboard.getByTestId('storage-card')

  await expect(healthDashboard).toBeVisible()
  await expect(systemCard).toBeVisible()
  await expect(memoryCard).toBeVisible()
  await expect(cpuCard).toBeVisible()
  await expect(storageCard).toBeVisible()

  await expect(systemCard.getByTestId('app-name')).toBeVisible()
  await expect(systemCard.getByTestId('app-name')).toHaveText(health.appName)
  await expect(systemCard.getByTestId('app-version')).toBeVisible()
  await expect(systemCard.getByTestId('app-version')).toHaveText(health.version)
  await expect(systemCard.getByTestId('app-uptime')).toBeVisible()

  await expect(cpuCard.getByTestId('cpu-usage')).toBeVisible()
  await expect(cpuCard.getByTestId('cpu-chart')).toBeVisible()

  await expect(memoryCard.getByTestId('memory-chart')).toBeVisible()
  await expect(memoryCard.getByTestId('memory-percent')).toBeVisible()
  await expect(memoryCard.getByTestId('memory-usage')).toBeVisible()

  await expect(storageCard.getByTestId('storage-chart')).toBeVisible()
  await expect(storageCard.getByTestId('storage-usage')).toBeVisible()
})
