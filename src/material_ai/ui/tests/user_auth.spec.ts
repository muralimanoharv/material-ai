import { test, expect } from '@playwright/test'
import {
  AutomationService,
  check_agents,
  check_config,
  check_user,
  REFRESH_TOKEN,
} from './util'

test.describe('User Authentication', () => {
  test('should display logged in user details', async ({ page, baseURL }) => {
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
    const config = await check_config(page)
    const agents = await check_agents(page)

    const automationService = new AutomationService(page, config)

    for (const agent of agents) {
      await automationService.check_agent(agent)
    }
    const user = await check_user(page)
    const userProfileButton = page.getByTestId('user-profile-button')
    const userProfileMenu = page.getByTestId('user-profile-menu')
    const signOutButton = page.getByTestId('signout-button')
    const signInButton = page.getByTestId('signin-button')
    const closeButton = userProfileMenu.getByTestId('user-profile-close')
    await expect(userProfileMenu).not.toBeVisible()
    await expect(signInButton).not.toBeVisible()
    await expect(userProfileButton).toBeVisible()
    await userProfileButton.click()
    await expect(userProfileMenu).toBeVisible()
    await expect(userProfileMenu.getByTestId('user-name')).toContainText(
      user.given_name,
    )
    await expect(userProfileMenu.getByTestId('user-email')).toContainText(
      user.email,
    )
    await expect(closeButton).toBeVisible()

    await closeButton.click()
    await expect(userProfileMenu).not.toBeVisible()
    await expect(userProfileButton).toBeVisible()
    await userProfileButton.click()
    await expect(signOutButton).toBeVisible()
  })
})
