import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('http://localhost:8080')

  await expect(page).toHaveTitle(/Material AI/)
})

test.describe('Agents Dashboard', () => {
  test('should display the list of agents', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'access_token',
        value: '',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.context().addCookies([
      {
        name: 'refresh_token',
        value: '',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.context().addCookies([
      {
        name: 'session',
        value: '',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.context().addCookies([
      {
        name: 'user_details',
        value: '',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('http://localhost:8080')

    await expect(page.getByTestId('agents-page-header')).toBeVisible()

    for (const agent of ['greeting_agent', 'testing_agent']) {
      await expect(
        page.getByTestId(`agents-page-card-${agent}-heading`),
      ).toBeVisible()
      await expect(
        page.getByTestId(`agents-page-card-${agent}-heading`),
      ).toHaveText('Greeting Agent')

      await expect(
        page.getByTestId(`agents-page-card-${agent}-description`),
      ).toBeVisible()
      await expect(
        page.getByTestId(`agents-page-card-${agent}-description`),
      ).toHaveText('An agent that can greet users.')

      await expect(
        page.getByTestId(`agents-page-card-${agent}-model`),
      ).toBeVisible()
      await expect(
        page.getByTestId(`agents-page-card-${agent}-model`),
      ).toHaveText('Gemini 2.0 Flash')

      await expect(
        page.getByTestId(`agents-page-card-${agent}-status`),
      ).toBeVisible()
      await expect(
        page.getByTestId(`agents-page-card-${agent}-status`),
      ).toHaveText('Active')
    }
  })
})
