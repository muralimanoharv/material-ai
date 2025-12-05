import React from 'react'
import type { AppConfig, FileAttachment, Session, User } from '../schema'
import { createParts } from '../utils'
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
      await this.cancel_api()

      this.controller = new AbortController()

      const parts = createParts({ prompt, files })

      this.historyService.add_history({
        content: {
          role: 'user',
          parts,
        },
        prompt,
        id,
        loading: true,
      })
      this.loadingId = id
      if (options.setPrompt) options.setPrompt('')
      this.context.setFiles([])

      const reader = await this.apiService.send_message({
        session_id,
        parts,
        controller: this.controller,
        sub: user.sub,
        app_name: agent,
        on_message: (message: any) => {
          if (message.error) {
            this.on_send_error(message.error)
            return
          }
          this.historyService.add_history({
            ...message,
            prompt,
          })
        },
        on_finish: () => {
          this.controller = undefined
          this.context.setPromptLoading(false)
          this.historyService.update_history(id, { loading: false })
          if (!is_new_session) return
          this.context.navigate(`/agents/${agent}/session/${session_id}`)
        },
      })
      this.reader = reader
    } catch (e) {
      this.historyService.update_history(id, { loading: false })

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

  on_send_error(e: Error | unknown) {
    console.error(e)
    this.historyService.add_history({
      content: {
        role: 'model',
        parts: [{ text: this.context.getConfig().errorMessage }],
      },
      id: `${new Date().getTime()}`,
      cancelled: true,
    })
    this.context.setSnack(this.context.getConfig().errorMessage)
  }

  async cancel_api(): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.controller) {
        this.controller?.abort()
        this.historyService.add_history({
          content: {
            role: 'model',
            parts: [{ text: 'You stopped this response' }],
          },
          id: `${new Date().getTime()}`,
          cancelled: true,
        })
        this.controller = undefined
        this.context.setPromptLoading(false)
      }
      if (this.reader) {
        try {
          await this.reader.cancel()
        } catch (e) {
          console.warn('Reader cancel error:', e)
        } finally {
          this.reader = undefined
        }
      }

      if (this.loadingId) {
        this.historyService.update_history(this.loadingId, {
          loading: false,
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
      for (let part of prevChat.content.parts) {
        if (part.text) return part.text
      }
    }
  }
}
