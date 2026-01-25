import { test, expect } from '@playwright/test'
import { AutomationService, check_config, check_user } from './util'

// @ts-expect-error this error is due to node type not avaiable in playwright
const REFRESH_TOKEN = process.env.REFRESH_TOKEN || ''

test('should query some charts to analyze sports data', async ({
  page,
  baseURL,
}) => {
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
  const user = await check_user(page)

  const automationService = new AutomationService(page, config)

  await automationService.goto_agent('sports_analytics_agent')

  await automationService.check_title(`Hello, ${user.given_name}`)
  await automationService.check_subtitle(config.greeting)

  const prompts = [
    'Give me a bar chart of what users gender vs their age',
    // 'Count of users grouped by fav_sport or gender as pie chart',
    // 'Give me count of user per city as bar chart',
    // 'Give me users per city  stacked by subscription_tier',
    // 'Give me grouped bar chart of stamina_score vs strength_score per gender',
    // 'Give me a line chart of steps_count over time',
    // 'Give me a steps_count and calories_burned as multi axis line chart',
    // "Give me a radar chart of one user's row from user_stats (Stamina, Strength, Speed, etc.).",
    // 'Give me scatter chart of age vs stamina_score',
    // 'Give me a bubble chart of age (X) vs active_minutes (Y) vs calories_burned (Size).',
    // 'Give me polar chart of Distribution of fav_sport frequency.',
    // 'Give me gradient chart of Use active_minutes over time with a color scale based on intensity.'
  ]

  for (const prompt of prompts) {
    let cum_index = 0
    await automationService.new_chat()
    await automationService.prompt(prompt)
    await automationService.check_chat_item_box(cum_index++, 0, { prompt })
    await automationService.check_tool_call(cum_index++, [
      {
        name: 'transfer_to_agent',
        args: 'transfer_to_agent(agent_name=sports_analytics_pipeline)',
      },
      {
        name: 'get_tables',
        args: 'get_tables()',
      },
      {
        name: 'get_schema',
      },
      {
        name: 'query',
      },
    ])
    await automationService.check_chat_item_box(cum_index++, 0)
    await automationService.check_chat_item_box(cum_index++, 0, {
      timeout: 50000,
    })
  }
})
