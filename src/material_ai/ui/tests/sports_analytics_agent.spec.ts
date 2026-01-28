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

  const SECHMA_RESULT = `get_schema -> {
  "result": [
    {
      "table_name": "sports_analytics",
      "columns": [
        {
          "name": "uid",
          "type": "INTEGER",
          "nullable": true
        },
        {
          "name": "first_name",
          "type": "TEXT",
          "nullable": false
        },
        {
          "name": "last_name",
          "type": "TEXT",
          "nullable": false
        },
        {
          "name": "age",
          "type": "INTEGER",
          "nullable": true
        },
        {
          "name": "gender",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "favourite_sport",
          "type": "TEXT",
          "nullable": true
        },
        {
          "name": "country",
          "type": "TEXT",
          "nullable": true
        }
      ],
      "join_hints": []
    }
  ]
}`

  const prompts = [
    {
      prompt:
        'What is the total number of users ? can you make sure you call the column "total_players"',
      query: {
        args: 'query(sql_query=SELECT COUNT(*) AS total_players FROM sports_analytics LIMIT 1000)',
        result: `query -> {
          "result": [
            {
              "total_players": 100
            }
          ]
        }`,
      },
    },
    {
      prompt: `How many people are below the age of 50, give me with column name "age_below_50"`,
      query: {
        args: 'query(sql_query=SELECT COUNT(*) AS age_below_50 FROM sports_analytics WHERE age < 50 LIMIT 1000)',
        result: `query -> {
          "result": [
            {
              "age_below_50": 71
            }
          ]
        }`,
      },
    },
    {
      prompt: `How many people are above the age of 50, give me with column name "age_above_50"`,
      query: {
        args: 'query(sql_query=SELECT COUNT(*) AS age_above_50 FROM sports_analytics WHERE age > 50 LIMIT 1000)',
        result: `query -> {
          "result": [
            {
              "age_above_50": 28
            }
          ]
        }`,
      },
    },
    {
      prompt: `How many people are with age equal to 50, give me with column name "age_equal_50"`,
      query: {
        args: 'query(sql_query=SELECT COUNT(*) AS age_equal_50 FROM sports_analytics WHERE age = 50 LIMIT 1000)',
        result: `query -> {
          "result": [
            {
              "age_equal_50": 1
            }
          ]
        }`,
      },
    },
    {
      prompt: `How many people are with age equal to 50, give me with column name "age_equal_50"`,
      query: {
        args: 'query(sql_query=SELECT COUNT(*) AS age_equal_50 FROM sports_analytics WHERE age = 50 LIMIT 1000)',
        result: `query -> {
          "result": [
            {
              "age_equal_50": 1
            }
          ]
        }`,
      },
    },
    {
      prompt: `Give me uid as "player_id" of user whose first name is "Yuki" and last name "Zhang"`,
      query: {
        args: `query(sql_query=SELECT uid AS player_id FROM sports_analytics WHERE first_name = 'Yuki' AND last_name = 'Zhang' LIMIT 1000)`,
        result: `query -> {
          "result": [
            {
              "player_id": 23
            }
          ]
        }`,
      },
    },
  ]

  for (const { prompt, query } of prompts) {
    let cum_index = 0
    await automationService.new_chat()
    await automationService.prompt(prompt)
    await automationService.check_chat_item_box(cum_index++, 0, { prompt })
    await automationService.check_tool_call(cum_index++, [
      {
        name: 'transfer_to_agent',
        args: 'transfer_to_agent(agent_name=sports_analytics_pipeline)',
        result: `transfer_to_agent -> {
          "result": null
        }`,
      },
      {
        name: 'get_tables',
        args: 'get_tables()',
        result: `get_tables -> {
          "result": [
            "sports_analytics"
          ]
        }`,
      },
      {
        name: 'get_schema',
        args: 'get_schema(tables=sports_analytics)',
        result: SECHMA_RESULT,
      },
      {
        name: 'query',
        args: query.args,
        result: query.result,
      },
    ])
    await automationService.check_chat_item_box(cum_index++, 0)
    await automationService.check_chat_item_box(cum_index++, 0, {
      timeout: 50000,
    })
  }
})
