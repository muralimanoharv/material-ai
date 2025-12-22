import { test, expect } from '@playwright/test'

// @ts-expect-error this error is due to node type not avaiable in playwright
const REFRESH_TOKEN = process.env.REFRESH_TOKEN || ''

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

    await page.goto('/')

    await expect(page.getByTestId('agents-page-header')).toBeVisible()
    let response = await page.context().request.get('/config')
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    response = await page.context().request.get('/agents')
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    const { agents } = await response.json()
    const formatModelName = (modelId: string) => {
      if (!modelId) return ''

      return modelId
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    for (const agent of agents) {
      await expect(
        page.getByTestId(`agents-page-card-${agent.id}-heading`),
      ).toBeVisible()
      await expect(
        page.getByTestId(`agents-page-card-${agent.id}-heading`),
      ).toHaveText(agent.name)
      await expect(
        page.getByTestId(`agents-page-card-${agent.id}-description`),
      ).toBeVisible()
      await expect(
        page.getByTestId(`agents-page-card-${agent.id}-description`),
      ).toHaveText(agent.description)
      await expect(
        page.getByTestId(`agents-page-card-${agent.id}-model`),
      ).toBeVisible()
      await expect(
        page.getByTestId(`agents-page-card-${agent.id}-model`),
      ).toHaveText(formatModelName(agent.model))
      await expect(
        page.getByTestId(`agents-page-card-${agent.id}-status`),
      ).toBeVisible()
      await expect(
        page.getByTestId(`agents-page-card-${agent.id}-status`),
      ).toHaveText(agent.status, { ignoreCase: true })
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

    const greeting_agent_card = page.getByTestId(
      `agents-page-card-greeting_agent-heading`,
    )

    await expect(greeting_agent_card).toBeVisible()

    await greeting_agent_card.click()

    let response = await page.context().request.get('/config')
    expect(response.ok()).toBeTruthy()
    const config = await response.json()
    expect(response.status()).toBe(200)

    response = await page.context().request.get('/agents')
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    const { agents } = await response.json()

    response = await page.context().request.get('/user')
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    const { user_response: user } = await response.json()

    await expect(page.getByTestId(`page-title`)).toHaveText(
      `Hello, ${user.given_name}`,
    )
    await expect(page.getByTestId(`page-subtitle`)).toHaveText(config.greeting)

    const prompt = `
        Hello, What can you do today, Are you a bot or a robot, what is you 
        specialty what all abilities do 
        you possess and what Is the best thing that you can do ?
        call say_hello tool
    `
    const truncatedPrompt = `${prompt.substring(0, 116)}...`

    const promptInput = page.getByTestId('page-prompt-input')
    await promptInput.fill(prompt)
    const submit = page.getByTestId('page-prompt-input-submit')

    await submit.click()

    await expect(page.getByTestId('page-chat-section')).toBeVisible()
    await expect(page.getByTestId(`page-title`)).not.toBeVisible()
    await expect(page.getByTestId('page-chat-0-part-loading')).toBeVisible()

    await expect(page.getByTestId('page-chat-0-part-0')).toBeVisible()

    await expect(
      page.getByTestId('page-chat-0-part-0').getByTestId('chat-text'),
    ).toHaveText(truncatedPrompt)

    await expect(page.getByTestId('page-chat-1-part-0')).toBeVisible()
    await expect(
      page.getByTestId('page-chat-1-part-0').getByTestId('chat-function-call'),
    ).toHaveText('say_hello')

    await expect(page.getByTestId('page-chat-2-part-0')).toBeVisible()
    await expect(
      page
        .getByTestId('page-chat-2-part-0')
        .getByTestId('chat-function-response'),
    ).toHaveText('say_hello')

    await expect(page.getByTestId('page-chat-3-part-0')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByTestId('page-chat-0-part-loading')).not.toBeVisible()
    await expect(
      page.getByTestId('page-chat-3-part-0').getByTestId('chat-text'),
    ).toBeVisible()

    // Copy Prompt Test
    await page
      .getByTestId('page-chat-0-part-0')
      .getByTestId('copy-prompt-button')
      .click()
    const handle = await page.evaluateHandle(() =>
      navigator.clipboard.readText(),
    )
    const clipboardContent = await handle.jsonValue()
    expect(clipboardContent).toBe(prompt)

    //Edit Prompt Test
    await page
      .getByTestId('page-chat-0-part-0')
      .getByTestId('edit-prompt-button')
      .click()
    await expect(page.getByTestId('page-prompt-input')).toHaveValue(prompt)
    await promptInput.fill('')

    //Prompt Toggle Test
    await page
      .getByTestId('page-chat-0-part-0')
      .getByTestId('user-text-toggle-button')
      .click()
    await expect(
      page.getByTestId('page-chat-0-part-0').getByTestId('chat-text'),
    ).toHaveText(prompt)
    await page
      .getByTestId('page-chat-0-part-0')
      .getByTestId('user-text-toggle-button')
      .click()
    await expect(
      page.getByTestId('page-chat-0-part-0').getByTestId('chat-text'),
    ).toHaveText(truncatedPrompt)

    //Positive Feedback Test
    await expect(
      page.getByTestId('page-chat-3-part-0').getByTestId('thumbs-up-button'),
    ).toBeVisible()

    await page
      .getByTestId('page-chat-3-part-0')
      .getByTestId('thumbs-up-button')
      .click()

    await expect(page.getByTestId('snack-bar-message')).toHaveText(
      `Thank you! Your feedback helps make ${config.title} better for everyone`,
    )

    //Negative Feedback test
    await page
      .getByTestId('page-chat-3-part-0')
      .getByTestId('thumbs-down-button')
      .click()

    for (const category of config.feedback.negative.categories) {
      await expect(
        page.getByTestId(`feedback-category-${category}`),
      ).toBeVisible()
    }

    await page
      .getByTestId(
        `feedback-category-${config.feedback.negative.categories[0]}`,
      )
      .click()

    await expect(page.getByTestId('snack-bar-message')).toHaveText(
      `Thank you for helping improve ${config.title}`,
    )

    //Negative Feedback other test
    await page
      .getByTestId('page-chat-3-part-0')
      .getByTestId('thumbs-down-button')
      .click()
    await page
      .getByTestId('page-chat-3-part-0')
      .getByTestId('thumbs-down-button')
      .click()
    await expect(page.getByTestId(`feedback-category-other`)).toBeVisible()
    await page.getByTestId(`feedback-category-other`).click()
    await page
      .getByTestId(`feedback-category-other-input`)
      .fill('Not good enough')
    await page.getByTestId('feedback-category-other-submit').click()

    await expect(page.getByTestId('snack-bar-message')).toHaveText(
      `Thank you for helping improve ${config.title}`,
    )

    //Copy Response test
    await page
      .getByTestId('page-chat-3-part-0')
      .getByTestId('copy-button')
      .click()
    const handle2 = await page.evaluateHandle(() =>
      navigator.clipboard.readText(),
    )
    const clipboardContent2 = await handle2.jsonValue()
    const responseContent = await page
      .getByTestId('page-chat-3-part-0')
      .getByTestId('chat-text')
      .innerText()
    expect(responseContent).toEqual(clipboardContent2?.trim())

    //Redo Button test
    await page
      .getByTestId('page-chat-3-part-0')
      .getByTestId('redo-button')
      .click()
    await expect(
      page.getByTestId('page-chat-7-part-0').getByTestId('chat-text'),
    ).toBeVisible({ timeout: 10000 })

    // New Chat Button
    const newChatButton = page.getByTestId('page-newchat-button').first()
    await expect(newChatButton).toBeVisible()
    await newChatButton.click()
    await expect(page.getByTestId(`page-title`)).toHaveText(
      `Hello, ${user.given_name}`,
      {
        timeout: 10000,
      },
    )
    await expect(page.getByTestId(`page-subtitle`)).toHaveText(config.greeting)
    const prompt_2 = `
        Hey what shall we do today
    `
    await promptInput.fill(prompt_2)
    await submit.click()
    await expect(page.getByTestId('page-chat-section')).toBeVisible()
    await expect(page.getByTestId(`page-title`)).not.toBeVisible()
    await expect(page.getByTestId('page-chat-0-part-loading')).toBeVisible()
    await expect(page.getByTestId('page-chat-3-part-0')).toBeVisible()
    await expect(submit).toBeVisible()

    //Session History Test
    const menuButton = page.getByTestId('page-menu-button').first()

    await expect(menuButton).toBeVisible()

    await menuButton.click()

    await expect(page.getByTestId(`session-history-0`)).toBeVisible()
    await expect(page.getByTestId(`session-history-1`)).toBeVisible()
    await page.getByTestId(`session-history-1`).click()

    await expect(
      page.getByTestId('page-chat-7-part-0').getByTestId('chat-text'),
    ).toBeVisible({ timeout: 10000 })

    //Delete Session History Test
    await page.getByTestId(`session-history-0`).click()
    await page
      .getByTestId(`session-history-0`)
      .getByTestId('session-delete-button')
      .click()
    await expect(page.getByTestId(`page-title`)).toHaveText(
      `Hello, ${user.given_name}`,
    )
    await expect(page.getByTestId(`page-subtitle`)).toHaveText(config.greeting)

    //Prompt input Agent selection test

    for (const agent of agents) {
      await page.getByTestId('prompt-input-agent-menu').click()
      await page.getByTestId(`prompt-input-agent-${agent.id}`).click()
      await expect(page.getByTestId(`page-agent-name`)).toBeVisible()
      await expect(page.getByTestId(`page-agent-name`)).toHaveText(agent.name)
    }

    //Prompt input upload files test
    await page.getByTestId('prompt-input-agent-menu').click()
    await page.getByTestId(`prompt-input-agent-greeting_agent`).click()
    await newChatButton.click()
    await expect(page.getByTestId(`page-title`)).toHaveText(
      `Hello, ${user.given_name}`,
      {
        timeout: 10000,
      },
    )
    await expect(page.getByTestId('prompt-input-file-menu')).toBeVisible()
    await page.getByTestId('prompt-input-file-menu').click()
    await expect(page.getByTestId('prompt-input-upload-files')).toBeVisible()
    const fileName = 'temp-test-file.txt'
    // @ts-expect-error this error is due to node type not avaiable in playwright
    const buffer = Buffer.from('This is the test content of the file')
    await page.locator('input[type="file"]').setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer,
    })
    const fileBox = page.getByTestId(`prompt-input-file-${fileName}`)
    await expect(fileBox).toBeVisible()
    await expect(fileBox.getByTestId('clear-file')).toBeVisible()
    fileBox.getByTestId('clear-file').click()
    await expect(fileBox).not.toBeVisible()
    await page.locator('input[type="file"]').setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer,
    })
    await expect(fileBox).toBeVisible()
    await expect(fileBox.getByTestId('clear-file')).toBeVisible()

    const prompt_3 = 'Tell me about this file'

    await promptInput.fill(prompt_3)
    await submit.click()
    await expect(page.getByTestId('page-chat-section')).toBeVisible()
    await expect(page.getByTestId(`page-title`)).not.toBeVisible()
    await expect(page.getByTestId('page-chat-0-part-loading')).toBeVisible()
    await expect(page.getByTestId('page-chat-1-part-0')).toBeVisible()
    await expect(submit).toBeVisible()
    await expect(page.getByTestId('chat-file-temp-test-file.txt')).toBeVisible()
    await expect(
      page.getByTestId('chat-file-temp-test-file.txt').getByTestId('file-name'),
    ).toHaveText(fileName.split('.')[0])

    //CSV from agent test
    await newChatButton.click()
    await expect(page.getByTestId(`page-title`)).toHaveText(
      `Hello, ${user.given_name}`,
      {
        timeout: 10000,
      },
    )
    const prompt_4 = 'Give me CSV'

    await promptInput.fill(prompt_4)
    await submit.click()
    await expect(page.getByTestId('page-chat-section')).toBeVisible()
    await expect(page.getByTestId(`page-title`)).not.toBeVisible()
    await expect(page.getByTestId('page-chat-0-part-loading')).toBeVisible()
    await expect(page.getByTestId('page-chat-2-part-artifacts')).toBeVisible()
    await expect(page.getByTestId('page-chat-3-part-0')).toBeVisible()
    await expect(page.getByTestId('chat-file-my-csv.csv')).toBeVisible()
    await expect(
      page.getByTestId('chat-file-my-csv.csv').getByTestId('file-name'),
    ).toHaveText('my-csv')

    //Stop Response Test
    await newChatButton.click()
    await expect(page.getByTestId(`page-title`)).toHaveText(
      `Hello, ${user.given_name}`,
      {
        timeout: 10000,
      },
    )
    const prompt_5 = 'say_10'
    await promptInput.fill(prompt_5)
    await submit.click({ timeout: 10000 })
    await expect(page.getByTestId('page-prompt-input-cancel')).toBeVisible()

    await expect(page.getByTestId('page-chat-0-part-0')).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByTestId('page-chat-0-part-loading')).toBeVisible()
    await page.getByTestId('page-prompt-input-cancel').click()
    await expect(page.getByTestId('page-chat-1-part-0')).toBeVisible({
      timeout: 10000,
    })
    await expect(
      page.getByTestId('page-chat-1-part-0').getByTestId('chat-text'),
    ).toHaveText('You stopped this response')

    //Error Response Test
    await newChatButton.click()
    await expect(page.getByTestId(`page-title`)).toHaveText(
      `Hello, ${user.given_name}`,
      {
        timeout: 10000,
      },
    )
    const prompt_6 = 'error'
    await promptInput.fill(prompt_6)
    await submit.click({ timeout: 10000 })
    await expect(page.getByTestId('page-chat-0-part-0')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByTestId('page-chat-0-part-loading')).toBeVisible()
    await expect(page.getByTestId('page-chat-2-part-0')).toBeVisible({
      timeout: 30000,
    })
    await expect(
      page.getByTestId('page-chat-2-part-0').getByTestId('chat-text'),
    ).toHaveText('Some error has occured, Please try again later')
  })
})
