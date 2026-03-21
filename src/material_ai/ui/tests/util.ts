import { expect, type Page } from '@playwright/test'
import { User, type Agent, type AppConfig, type Health } from '../src/schema'

// @ts-expect-error this error is due to node type not avaiable in playwright
export const REFRESH_TOKEN = process.env.REFRESH_TOKEN || ''

export class AutomationService {
  constructor(
    private page: Page,
    private config: AppConfig,
  ) {}

  async check_agent(agent: Agent) {
    const page = this.page
    await expect(page.getByTestId('agents-grid-view')).toBeVisible()
    await page.getByTestId('agents-grid-view').click()
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
    ).toHaveText(agent.model)
    await expect(
      page.getByTestId(`agents-page-card-${agent.id}-status`),
    ).toBeVisible()
    await expect(
      page.getByTestId(`agents-page-card-${agent.id}-status`),
    ).toHaveText(agent.status, { ignoreCase: true })
  }

  async goto_agent(id: string) {
    const page = this.page
    await page.goto('/')
    await expect(page.getByTestId('agents-page-header')).toBeVisible()
    const agent_card = page.getByTestId(`agents-page-row-${id}-heading`)
    await expect(agent_card).toBeVisible()
    await agent_card.click()
    await expect(
      page.getByTestId(`agents-page-info-${id}-heading`),
    ).toBeVisible()
    await expect(
      page.getByTestId(`agents-page-info-${id}-chat-button`),
    ).toBeVisible()
    await page.getByTestId(`agents-page-info-${id}-chat-button`).click()
  }

  async check_title(title: string) {
    const page = this.page
    await expect(page.getByTestId(`page-title`)).toHaveText(title, {
      timeout: 10000,
    })
  }
  async check_subtitle(subtitle: string) {
    const page = this.page
    await expect(page.getByTestId(`page-subtitle`)).toHaveText(subtitle)
  }

  async prompt(prompt: string) {
    const page = this.page
    this.clear_prompt()
    const promptInput = page.getByTestId('page-prompt-input')
    await promptInput.fill(prompt)
    const submit = page.getByTestId('page-prompt-input-submit')
    await submit.click({ timeout: 10000 })
    await expect(page.getByTestId('page-chat-section')).toBeVisible()
    await expect(page.getByTestId(`page-title`)).not.toBeVisible()
  }

  async clear_prompt() {
    const page = this.page
    const promptInput = page.getByTestId('page-prompt-input')
    await promptInput.fill('')
  }

  async check_chat_item_box(
    chat: number,
    part: number,
    options?: {
      timeout?: number
      prompt?: string
    },
  ) {
    const page = this.page
    const id = `page-chat-${chat}-part-${part}`
    const prompt = options?.prompt || ''
    await expect(page.getByTestId('page-chat-section')).toBeVisible()
    await expect(page.getByTestId(`page-title`)).not.toBeVisible()
    await expect(page.getByTestId(id)).toBeVisible({
      timeout: options?.timeout || 30000,
    })
    expect(page.getByTestId(id).getByTestId('chat-text')).toBeVisible({
      timeout: options?.timeout || 30000,
    })
    if (!prompt) return
    const truncatedPrompt =
      prompt.length >= 116 ? `${prompt.substring(0, 116)}...` : prompt
    await expect(page.getByTestId(id).getByTestId('chat-text')).toHaveText(
      truncatedPrompt,
    )
  }
  async check_chat_item_copy_prompt(chat: number, part: number) {
    const page = this.page
    const id = `page-chat-${chat}-part-${part}`
    await page.getByTestId(id).getByTestId('copy-prompt-button').click()
  }

  async click_session_history(index: number) {
    const page = this.page
    const menuButton = page.getByTestId('page-menu-button').first()
    await expect(menuButton).toBeVisible()

    await menuButton.click()

    await expect(page.getByTestId(`session-history-${index}`)).toBeVisible()
    await page.getByTestId(`session-history-${index}`).click()
  }

  async check_prompt_input_agent_menu(agents: Agent[]) {
    const page = this.page
    for (const agent of agents) {
      await page.getByTestId('prompt-input-agent-menu').click()
      await page.getByTestId(`prompt-input-agent-${agent.id}`).click()
      await expect(page.getByTestId(`page-agent-name`)).toBeVisible()
      await expect(page.getByTestId(`page-agent-name`)).toHaveText(agent.name)
    }
  }

  async select_prompt_input_agent_menu(agent: string) {
    const page = this.page
    await expect(page.getByTestId('prompt-input-agent-menu')).toBeVisible({
      timeout: 30000,
    })
    await page.getByTestId('prompt-input-agent-menu').click({ timeout: 10000 })
    await page.getByTestId(`prompt-input-agent-${agent}`).click()
  }

  async upload_prompt_input_file(fileName: string) {
    const page = this.page
    await expect(page.getByTestId('prompt-input-file-menu')).toBeVisible()
    await page.getByTestId('prompt-input-file-menu').click()
    await expect(page.getByTestId('prompt-input-upload-files')).toBeVisible()
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
  }

  async delete_session_history(index: number) {
    const page = this.page
    await this.click_session_history(index)

    await page
      .getByTestId(`session-history-${index}`)
      .getByTestId('session-delete-button')
      .click()
  }

  async check_chat_item_edit_prompt(chat: number, part: number) {
    const page = this.page
    const id = `page-chat-${chat}-part-${part}`
    await page.getByTestId(id).getByTestId('user-text-toggle-button').click()
    const prompt = (await page
      .getByTestId(id)
      .getByTestId('chat-text')
      .textContent()) as string
    await page.getByTestId(id).getByTestId('edit-prompt-button').click()
    await expect(page.getByTestId('page-prompt-input')).toHaveValue(prompt)
    await page.getByTestId(id).getByTestId('user-text-toggle-button').click()
  }

  async check_chat_item_prompt_toggle(
    chat: number,
    part: number,
    prompt: string,
  ) {
    const page = this.page
    const id = `page-chat-${chat}-part-${part}`
    const truncatedPrompt =
      prompt.length >= 116 ? `${prompt.substring(0, 116)}...` : prompt
    await this.check_chat_item_box(chat, part, { prompt: truncatedPrompt })
    await page.getByTestId(id).getByTestId('user-text-toggle-button').click()
    await expect(page.getByTestId(id).getByTestId('chat-text')).toHaveText(
      prompt,
    )
    await page.getByTestId(id).getByTestId('user-text-toggle-button').click()
    await expect(page.getByTestId(id).getByTestId('chat-text')).toHaveText(
      truncatedPrompt,
    )
  }

  async check_chat_item_positive_feedback(
    chat: number,
    part: number,
    agent: string,
  ) {
    const page = this.page
    const id = `page-chat-${chat}-part-${part}`
    await expect(
      page.getByTestId(id).getByTestId('thumbs-up-button'),
    ).toBeVisible()

    await page.getByTestId(id).getByTestId('thumbs-up-button').click()

    await expect(page.getByTestId('snack-bar-message')).toHaveText(
      `Thank you! Your feedback helps make ${this.config.agents[agent].title} better for everyone`,
    )
  }

  async check_chat_item_negative_feedback(
    chat: number,
    part: number,
    agent: string,
  ) {
    const page = this.page
    const config = this.config
    const id = `page-chat-${chat}-part-${part}`
    await page.getByTestId(id).getByTestId('thumbs-down-button').click()

    for (const category of config.agents[agent].feedback.negative.categories) {
      await expect(
        page.getByTestId(id).getByTestId(`feedback-category-${category}`),
      ).toBeVisible()
    }

    await page
      .getByTestId(id)
      .getByTestId(
        `feedback-category-${config.agents[agent].feedback.negative.categories[0]}`,
      )
      .click()

    await expect(page.getByTestId('snack-bar-message')).toHaveText(
      `Thank you for helping improve ${config.agents[agent].title}`,
    )
    await page.getByTestId(id).getByTestId('thumbs-down-button').click()
    await page.getByTestId(id).getByTestId('thumbs-down-button').click()
    await expect(
      page.getByTestId(id).getByTestId(`feedback-category-other`),
    ).toBeVisible()
    await page.getByTestId(id).getByTestId(`feedback-category-other`).click()
    await page
      .getByTestId(id)
      .getByTestId(`feedback-category-other-input`)
      .fill('Not good enough')
    await page
      .getByTestId(id)
      .getByTestId('feedback-category-other-submit')
      .click()

    await expect(page.getByTestId('snack-bar-message')).toHaveText(
      `Thank you for helping improve ${config.agents[agent].title}`,
    )
  }

  async check_chat_item_copy_response(chat: number, part: number) {
    const page = this.page
    const id = `page-chat-${chat}-part-${part}`
    await page.getByTestId(id).getByTestId('copy-button').click()
    const handle2 = await page.evaluateHandle(() =>
      navigator.clipboard.readText(),
    )
    const clipboardContent2 = await handle2.jsonValue()
    const responseContent = await page
      .getByTestId(id)
      .getByTestId('chat-text')
      .innerText()
    expect(responseContent).toEqual(clipboardContent2?.trim())
  }

  async check_chat_item_redo(chat: number, part: number) {
    const page = this.page
    const id = `page-chat-${chat}-part-${part}`
    await page.getByTestId(id).getByTestId('redo-button').click()
  }

  async new_chat() {
    const page = this.page
    const newChatButton = page.getByTestId('page-newchat-button').first()
    await expect(newChatButton).toBeVisible()
    await newChatButton.click()
  }

  async check_artifacts(chat: number, fileName: string) {
    const page = this.page
    const id = `page-chat-${chat}-part-artifacts`
    await expect(page.getByTestId(id)).toBeVisible()
    await expect(
      page.getByTestId(id).getByTestId(`chat-file-${fileName}`),
    ).toBeVisible()
    await expect(
      page
        .getByTestId(id)
        .getByTestId(`chat-file-${fileName}`)
        .getByTestId('file-name'),
    ).toHaveText(fileName.split('.')[0])
  }

  async check_tool_call(
    chat: number,
    tools: { name: string; args?: string; result?: string }[] = [],
  ) {
    const page = this.page
    const id = `page-chat-${chat}-part-loading`
    await expect(page.getByTestId(id)).toBeVisible()
    await expect(
      page.getByTestId(id).getByTestId('loading-indicator'),
    ).toBeVisible()

    await expect(
      page.getByTestId(id).getByTestId('chat-loading-toggle'),
    ).toBeVisible()

    await page.getByTestId(id).getByTestId('chat-loading-toggle').click()

    let part = 0

    for (let i = 0; i < tools.length; i++) {
      let toolId = `page-chat-${chat}-part-${part}`
      await expect(page.getByTestId(id).getByTestId(toolId)).toBeVisible()
      await expect(
        page
          .getByTestId(id)
          .getByTestId(toolId)
          .getByTestId('chat-function-call-name'),
      ).toContainText(tools[i].name, { ignoreCase: true })

      await expect(
        page
          .getByTestId(id)
          .getByTestId(toolId)
          .getByTestId('chat-function-call-toggle'),
      ).toBeVisible()

      await page
        .getByTestId(id)
        .getByTestId(toolId)
        .getByTestId('chat-function-call-toggle')
        .click()
      if (tools[i].args) {
        const args = tools[i].args as string
        await expect(
          page
            .getByTestId(id)
            .getByTestId(toolId)
            .getByTestId('chat-function-call-args'),
        ).toContainText(args, { ignoreCase: true })
      }
      part = part + 1
      toolId = `page-chat-${chat}-part-${part}`

      await expect(page.getByTestId(id).getByTestId(toolId)).toBeVisible()

      await expect(
        page
          .getByTestId(id)
          .getByTestId(toolId)
          .getByTestId('chat-function-response-name'),
      ).toContainText(tools[i].name, { ignoreCase: true })

      await expect(
        page
          .getByTestId(id)
          .getByTestId(toolId)
          .getByTestId('chat-function-response-toggle'),
      ).toBeVisible()

      await page
        .getByTestId(id)
        .getByTestId(toolId)
        .getByTestId('chat-function-response-toggle')
        .click()

      await expect(
        page
          .getByTestId(id)
          .getByTestId(toolId)
          .getByTestId('chat-function-response-result'),
      ).toBeVisible()

      if (tools[i].result) {
        const result = tools[i].result as string
        await expect(
          page
            .getByTestId(id)
            .getByTestId(toolId)
            .getByTestId('chat-function-response-result'),
        ).toContainText(result, { ignoreCase: true })
      }
      part = part + 1
    }
    await page.getByTestId(id).getByTestId('chat-loading-toggle').click()
  }
}

export async function check_config(page: Page): Promise<AppConfig> {
  await page.goto('/')
  await expect(page.getByTestId('agents-page-header')).toBeVisible()
  const response = await page.context().request.get('/config')
  expect(response.ok()).toBeTruthy()
  expect(response.status()).toBe(200)
  const config = await response.json()
  return config
}

export async function check_health(page: Page): Promise<Health> {
  await page.goto('/')
  const response = await page.context().request.get('/health')
  expect(response.ok()).toBeTruthy()
  expect(response.status()).toBe(200)
  const health = await response.json()
  return health
}

export async function check_agents(page: Page): Promise<Agent[]> {
  await page.goto('/')
  await expect(page.getByTestId('agents-page-header')).toBeVisible()
  const response = await page.context().request.get('/agents')
  expect(response.ok()).toBeTruthy()
  expect(response.status()).toBe(200)
  const { agents } = await response.json()
  return agents
}

export async function check_user(page: Page): Promise<User> {
  await page.goto('/')
  await expect(page.getByTestId('agents-page-header')).toBeVisible()
  const response = await page.context().request.get('/user')
  expect(response.ok()).toBeTruthy()
  expect(response.status()).toBe(200)
  const { user_response: user } = await response.json()
  return user
}
