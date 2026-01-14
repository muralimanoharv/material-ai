import React from 'react'
import type {
  AppConfig,
  ChatItem,
  FileAttachment,
  Session,
  User,
} from '../schema'
import { createParts, does_chat_has_func, scroll_to_view } from '../utils'
import { ApiService } from './api.service'
import { HistoryService } from './history.service'
import type { NavigateFunction } from 'react-router'

interface ChatServiceContext {
  getUser: () => User | undefined
  getConfig: () => AppConfig
  setPromptLoading: React.Dispatch<React.SetStateAction<boolean>>
  setFiles: React.Dispatch<React.SetStateAction<FileAttachment[]>>
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>
  navigate: NavigateFunction
  setSnack: (text: string) => void
}
export class ChatService {
  private apiService: ApiService
  private historyService: HistoryService
  private context: ChatServiceContext
  private controller: AbortController | undefined
  private loadingId: string | undefined
  private reader: ReadableStreamDefaultReader<Uint8Array> | undefined
  constructor(
    apiService: ApiService,
    historyService: HistoryService,
    context: ChatServiceContext,
  ) {
    this.apiService = apiService
    this.historyService = historyService
    this.context = context
  }

  call_me() {
    this.context.setPromptLoading(true)
  }

  async send_message(
    prompt: string,
    options: {
      submitted_files?: FileAttachment[]
      setPrompt?: React.Dispatch<React.SetStateAction<string>>
      session_id?: string
      agent: string
    },
  ) {
    if (!prompt) return

    const user = this.context.getUser()
    if (!user) return

    const agent = options.agent

    let session_id = options.session_id
    const is_new_session = !session_id

    const id = `${new Date().getTime()}`
    const files = options?.submitted_files || []
    try {
      this.context.setPromptLoading(true)

      if (is_new_session) {
        session_id = (await this.apiService.create_session(agent)).id
      }

      if (!session_id) return
      const url = `/agents/${agent}/session/${session_id}?is_new_session=${is_new_session}`
      await this.context.navigate(url)
      await this.cancel_api()

      this.controller = new AbortController()

      const [requestParts, chatParts] = createParts({ prompt, files })
      this.historyService.add_history({
        content: {
          role: 'user',
          parts: chatParts,
        },
        prompt,
        id,
        loading: true,
        loading_message: '',
        loading_id: id,
        chat_history: [],
      })
      setTimeout(() => {
        scroll_to_view()
      }, 100)
      this.loadingId = id
      if (options.setPrompt) options.setPrompt('')
      this.context.setFiles([])

      const reader = await this.apiService.send_message({
        session_id,
        parts: requestParts,
        controller: this.controller,
        sub: user.sub,
        app_name: agent,
        on_message: (message: ChatItem) => {
          if (message.error) {
            this.on_send_error(message.error)
            return
          }
          this.update_history(id, message)
          this.historyService.add_history({
            ...message,
            prompt,
            loading_id: id,
            chat_history: [],
          })
        },
        on_finish: () => {
          this.controller = undefined
          this.context.setPromptLoading(false)
          this.historyService.update_history(id, {
            loading_finished: true,
            loading_message: '',
          })
          setTimeout(() => {
            scroll_to_view()
          }, 100)
          if (!is_new_session) return
          this.context.navigate(`/agents/${agent}/session/${session_id}`)
        },
      })
      this.reader = reader
    } catch (e) {
      this.historyService.update_history(id, { loading_finished: true })

      if (e instanceof Error) {
        if (e.name === 'AbortError') return
      }

      if (options.setPrompt) options.setPrompt(prompt)
      this.context.setFiles(files)
      this.on_send_error(e)
    } finally {
      if (is_new_session && session_id) {
        const newSession: Session = {
          id: session_id,
          user_id: user.sub,
          title: prompt,
          app_name: agent,
          last_update_time: new Date().getTime(),
        }
        this.context.setSessions((prevSessions) => {
          return [newSession, ...prevSessions]
        })
      }
    }
  }

  private update_history(id: string, message: ChatItem) {
    const history = this.historyService.get_by_id(id)
    if (!history) return
    const chat_history = history.chat_history || []
    const messsage = this.get_loading_message(message)
    this.historyService.update_history(id, {
      chat_history: [...chat_history, message],
      loading_message: messsage || history.loading_message,
    })
  }

  private get_loading_message(message: ChatItem): string | null {
    if (!does_chat_has_func(message)) return null
    const parts = message.content.parts
    for (const part of parts) {
      if (part.functionCall) {
        return `Calling ${part.functionCall.name}`
      }
      if (part.functionResponse) {
        return `Recieved response from ${part.functionResponse.name}`
      }
    }
    return null
  }

  private on_send_error(e: Error | unknown) {
    console.error(e)
    const id = `${new Date().getTime()}`
    this.historyService.add_history({
      content: {
        role: 'model',
        parts: [{ text: this.context.getConfig().errorMessage }],
      },
      id,
      loading_id: id,
      chat_history: [],
      cancelled: true,
    })
    this.context.setSnack(this.context.getConfig().errorMessage)
  }

  async cancel_api(): Promise<void> {
    return new Promise((resolve) => {
      if (this.controller) {
        this.controller?.abort()
        const id = `${new Date().getTime()}`
        this.historyService.add_history({
          content: {
            role: 'model',
            parts: [{ text: 'You stopped this response' }],
          },
          id,
          loading_id: id,
          chat_history: [],
          cancelled: true,
        })
        this.controller = undefined
        this.context.setPromptLoading(false)
      }
      if (this.reader) {
        this.reader
          .cancel()
          .catch((e) => console.warn('Reader cancel error:', e))
          .finally(() => {
            this.reader = undefined
          })
      }

      if (this.loadingId) {
        this.historyService.update_history(this.loadingId, {
          loading_finished: true,
        })
        this.loadingId = undefined
      }

      resolve()
    })
  }

  find_previous_prompt(idx: number): string | undefined {
    for (let i = idx - 1; i >= 0; i--) {
      const prevChat = this.historyService.get(i)
      if (!prevChat) return
      if (prevChat.content.role == 'model') continue
      for (const part of prevChat.content.parts) {
        if (part.text) return part.text
      }
    }
  }
  async fetch_session(agent: string, session_id: string): Promise<Session> {
    const session = await this.apiService.fetch_session(agent, session_id)
    const events = session.events || []
    const invokation_id_map = new Map<string, ChatItem[]>()
    for (const event of events) {
      const invocationId = event.invocationId
      if (!invocationId) continue
      if (!invokation_id_map.has(invocationId)) {
        invokation_id_map.set(invocationId, [])
      }
      invokation_id_map.get(invocationId)?.push(event)
    }
    this.historyService.clear_history()
    for (const id of invokation_id_map.keys()) {
      const chat_history = invokation_id_map.get(id) || []
      for (const event of chat_history) {
        if (event.content.role == 'user') {
          this.historyService.add_history({ ...event, loading_id: id })
        }
      }
      this.historyService.add_history({
        content: {
          role: 'user',
          parts: [],
        },
        prompt: undefined,
        id,
        loading: true,
        loading_finished: true,
        loading_id: id,
        chat_history,
      })
      for (const event of chat_history) {
        if (event.content.role == 'model') {
          this.historyService.add_history({ ...event, loading_id: id })
        }
      }
    }

    return session
  }
}
