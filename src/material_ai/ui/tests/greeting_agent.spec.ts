import { test, expect } from '@playwright/test'
import {
  AutomationService,
  check_agents,
  check_config,
  check_user,
  REFRESH_TOKEN,
} from './util'

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

test.describe('Agents Dashboard', () => {
  test('should display the list of agents', async ({ page, baseURL }) => {
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
  })
})

test.describe('Greeting Agent Chat Page', () => {
  test('Test Unauthorized user access', async ({ page, baseURL }) => {
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

    let response = await page
      .context()
      .request.post('/apps/greeting_agent/users/1234/sessions')
    expect(response.ok).toBeTruthy()
    expect(response.status()).toBe(401)

    const payload = {
      app_name: 'greeting_agent',
      user_id: '1234',
      session_id: '873ba2ff-55ad-4c61-b240-f0879bc1f134',
      new_message: {
        role: 'user',
        parts: [
          {
            text: 'Hi',
          },
        ],
      },
      streaming: false,
    }

    response = await page.context().request.post('/run', {
      data: payload,
    })

    expect(response.ok).toBeTruthy()

    expect(response.status()).toBe(401)
  })
  test('We want to try different chat functions', async ({ page, baseURL }) => {
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
    const agents = await check_agents(page)
    const user = await check_user(page)

    const automationService = new AutomationService(page, config)

    await automationService.goto_agent('greeting_agent')

    await automationService.check_title(`Hello, ${user.given_name}`)
    await automationService.check_subtitle(
      config.agents['greeting_agent'].greeting,
    )

    const prompt = `
        Hello, What can you do today, Are you a bot or a robot, what is you 
        specialty what all abilities do 
        you possess and what Is the best thing that you can do ?
        call say_hello tool
    `
    await automationService.prompt(prompt)

    await automationService.check_chat_item_box(0, 0, { prompt })

    await automationService.check_tool_call(1, [
      {
        name: 'say_hello',
        args: 'say_hello()',
      },
    ])

    await automationService.check_chat_item_box(2, 0)

    // Copy Prompt Test
    await automationService.check_chat_item_copy_prompt(0, 0)
    const handle = await page.evaluateHandle(() =>
      navigator.clipboard.readText(),
    )
    const clipboardContent = await handle.jsonValue()
    expect(clipboardContent).toBe(prompt)

    //Edit Prompt Test
    await automationService.check_chat_item_edit_prompt(0, 0)

    await automationService.clear_prompt()

    //Prompt Toggle Test
    await automationService.check_chat_item_prompt_toggle(0, 0, prompt)

    //Positive Feedback Test
    await automationService.check_chat_item_positive_feedback(
      2,
      0,
      'greeting_agent',
    )

    //Negative Feedback test
    await automationService.check_chat_item_negative_feedback(
      2,
      0,
      'greeting_agent',
    )

    //Copy Response test
    await automationService.check_chat_item_copy_response(2, 0)

    //Redo Button test
    await automationService.check_chat_item_redo(2, 0)
    await automationService.check_chat_item_box(5, 0)

    // New Chat Button
    await automationService.new_chat()
    await automationService.check_title(`Hello, ${user.given_name}`)
    await automationService.check_subtitle(
      config.agents['greeting_agent'].greeting,
    )

    const prompt_2 = `Hey what shall we do today`
    await automationService.prompt(prompt_2)

    await automationService.check_chat_item_box(0, 0, { prompt: prompt_2 })

    await automationService.check_tool_call(1, [
      {
        name: 'say_hello',
        args: 'say_hello()',
      },
    ])

    await automationService.check_chat_item_box(2, 0)

    //Session History Test
    await automationService.click_session_history(1)

    await automationService.check_chat_item_box(5, 0)

    //Delete Session History Test
    await automationService.delete_session_history(0)
    await automationService.check_title(`Hello, ${user.given_name}`)
    await automationService.check_subtitle(
      config.agents['greeting_agent'].greeting,
    )

    //Prompt input Agent selection test
    await automationService.check_prompt_input_agent_menu(agents)
    await page.goto('/')
    await automationService.goto_agent('greeting_agent')

    //Prompt input upload files test
    await automationService.select_prompt_input_agent_menu('greeting_agent')
    await automationService.new_chat()
    await automationService.check_title(`Hello, ${user.given_name}`)

    const fileName = 'temp-test-file.txt'
    await automationService.upload_prompt_input_file(fileName)
    await automationService.prompt('Tell me about this file')

    await automationService.check_chat_item_box(2, 0)
    await automationService.check_artifacts(0, fileName)

    //CSV from agent test
    await automationService.new_chat()
    await automationService.check_title(`Hello, ${user.given_name}`)

    await automationService.prompt('Give me CSV')

    await automationService.check_tool_call(1)
    await automationService.check_artifacts(2, 'my-csv.csv')
    await automationService.check_chat_item_box(3, 0)

    //Stop Response Test
    await automationService.new_chat()
    await automationService.check_title(`Hello, ${user.given_name}`)
    await automationService.prompt('say_10')

    await expect(page.getByTestId('page-prompt-input-cancel')).toBeVisible()

    await automationService.check_chat_item_box(0, 0)
    await automationService.check_tool_call(1)

    await page.getByTestId('page-prompt-input-cancel').click()
    await automationService.check_chat_item_box(2, 0, {
      prompt: 'You stopped this response',
    })

    //Error Response Test
    await automationService.new_chat()
    await automationService.check_title(`Hello, ${user.given_name}`)

    await automationService.prompt('error')
    await automationService.check_chat_item_box(0, 0)
    await automationService.check_tool_call(1)
    await automationService.check_chat_item_box(2, 0, {
      prompt: 'Error: Error: Tool execution timed out or failed',
    })
  })
})
