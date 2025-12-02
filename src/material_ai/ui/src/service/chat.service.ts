import React from 'react'
import type { AppConfig, FileAttachment, Session, User } from '../schema'
import { createParts } from '../utils'
import { ApiService } from './api.service'
import { HistoryService } from './history.service'
import type { NavigateFunction } from 'react-router'

interface ChatServiceContext {
  getUser: () => User | undefined
  getSession: () => string | undefined
  getConfig: () => AppConfig
  getSelectedAgent: () => string
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

  async send_message(
    prompt: string,
    options?: {
      submittedFiles: FileAttachment[]
      setPrompt: React.Dispatch<React.SetStateAction<string>>
    },
  ) {
    if (!prompt) return

    const user = this.context.getUser()
    if (!user) return

    let sessionId = this.context.getSession()
    const isNewSession = !sessionId

    const id = `${new Date().getTime()}`
    const files = options?.submittedFiles || []
    try {
      this.context.setPromptLoading(true)

      if (isNewSession) {
        sessionId = (await this.apiService.create_session()).id
      }
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
      options?.setPrompt('')
      this.context.setFiles([])

      const reader = await this.apiService.send_message({
        session_id: sessionId!,
        parts,
        controller: this.controller,
        sub: user.sub,
        app_name: this.context.getSelectedAgent(),
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
          if (!isNewSession) return
          this.context.navigate(
            `/agents/${this.context.getSelectedAgent()}/session/${sessionId}`,
          )
        },
      })
      this.reader = reader
    } catch (e) {
      this.historyService.update_history(id, { loading: false })

      if (e instanceof Error) {
        if (e.name === 'AbortError') return
      }

      options?.setPrompt(prompt)
      this.context.setFiles(files)
      this.on_send_error(e)
    } finally {
      if (isNewSession && sessionId) {
        const newSession = {
          id: sessionId!,
          user_id: user.sub,
          session_id: sessionId!,
          title: prompt,
          app_name: this.context.getSelectedAgent(),
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
    return new Promise((resolve) => {
      if (this.controller || this.reader) {
        this.controller?.abort()
        this.reader
          ?.cancel()
          .catch((err) => console.warn('Reader cancel error:', err))
        this.historyService.add_history({
          content: {
            role: 'model',
            parts: [{ text: 'You stopped this response' }],
          },
          id: `${new Date().getTime()}`,
          cancelled: true,
        })
      }

      if (this.loadingId) {
        this.historyService.update_history(this.loadingId, {
          loading: false,
        })
      }

      this.context.setPromptLoading(false)
      resolve()
    })
  }
}
