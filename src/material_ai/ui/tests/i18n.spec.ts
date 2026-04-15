import { test, expect } from '@playwright/test'
import { check_config, REFRESH_TOKEN } from './util'
import { AppConfig } from '../src/schema'

test('testing i18n configuration', async ({ page, baseURL }) => {
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

  await expect(page.getByTestId('language-selector-button')).toBeVisible()
  await page.getByTestId('language-selector-button').click()
  await expect(page.getByTestId('language-selector-menu')).toBeVisible()
  for (const language of config.languages) {
    await expect(
      page.getByTestId(`language-selector-menu-item-${language.code}`),
    ).toBeVisible()
  }
  await expect(page.getByTestId('agents-page-header')).toBeVisible()
  await expect(page.getByTestId('agents-page-header')).toHaveText(
    'Agent Catalog',
  )
  await expect(page.getByTestId('agents-page-sub-header')).toBeVisible()
  await expect(page.getByTestId('agents-page-sub-header')).toHaveText(
    'Agent Registry Dashboard',
  )

  await expect(page.getByTestId(`language-selector-menu-item-ja`)).toBeVisible()
  await page.getByTestId(`language-selector-menu-item-ja`).click()

  await expect(page.getByTestId('agents-page-header')).toBeVisible()
  await expect(page.getByTestId('agents-page-header')).toHaveText(
    'エージェントカタログ',
  )
  await expect(page.getByTestId('agents-page-sub-header')).toBeVisible()
  await expect(page.getByTestId('agents-page-sub-header')).toHaveText(
    'エージェント登録ダッシュボード',
  )

  for (const language of config.languages) {
    await expect(page.getByTestId('language-selector-button')).toBeVisible()
    await page.getByTestId('language-selector-button').click()
    await expect(page.getByTestId('language-selector-menu')).toBeVisible()
    await expect(
      page.getByTestId(`language-selector-menu-item-${language.code}`),
    ).toBeVisible()
    await page
      .getByTestId(`language-selector-menu-item-${language.code}`)
      .click()
    const response = await page.context().request.get('/config', {
      headers: {
        'Accept-Language': language.code,
      },
    })
    expect(response.ok()).toBeTruthy()
    const newConfig = (await response.json()) as AppConfig
    await expect(page.getByTestId('agents-page-header')).toHaveText(
      newConfig.pages.agentsPage.title,
    )
    await expect(page.getByTestId('agents-page-sub-header')).toHaveText(
      newConfig.pages.agentsPage.subTitle,
    )
  }
})
