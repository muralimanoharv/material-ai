import { test, expect } from '@playwright/test'
import { AutomationService, check_config, REFRESH_TOKEN } from './util'

test('testing micro frontend in vector agent', async ({ page, baseURL }) => {
  if (!REFRESH_TOKEN) {
    throw new Error(
      '⚠️ REFRESH_TOKEN is missing. Check your GitHub Secrets or .env file.',
    )
  }
  await page.context().addCookies([
    {
      name: 'refresh_token',
      value: REFRESH_TOKEN,
      url: baseURL,
    },
  ])
  await page.goto('/')
  await expect(page.getByTestId('agents-page-header')).toBeVisible()

  const config = await check_config(page)
  const automationService = new AutomationService(page, config)

  await automationService.goto_agent('vector_agent')

  await expect(page.getByTestId(`page-title`)).not.toBeVisible()
  await expect(page.getByTestId(`page-subtitle`)).not.toBeVisible()

  await expect(page.getByTestId('vector-input')).toBeVisible()
  await expect(page.getByTestId('vector-connection')).toBeVisible()
  await expect(page.getByTestId('vector-chart')).toBeVisible()

  await expect(page.getByTestId('page-prompt-input')).not.toBeVisible()
})
