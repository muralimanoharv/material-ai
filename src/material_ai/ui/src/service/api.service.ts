export const HOST = import.meta.env.VITE_API_BASE_URL
import {
  type Session,
  type AppConfig,
  type FeedbackDto,
  type UserResponse,
  type RequestPart,
  type ChatItem,
  type User,
  type ArtifactResponse,
  type DeleteSessionResponse,
  type Agent,
  type AgentResponse,
  type Health,
} from '../schema'

interface ApiServiceContext {
  getUser: () => User | undefined
  on401: () => void
  on404: () => void
  getConfig: () => AppConfig
}

export class ApiService {
  private context: ApiServiceContext
  constructor(context: ApiServiceContext) {
    this.context = context
  }

  async send_message(
    dto: SendMessageArgs,
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const {
      app_name,
      sub,
      session_id,
      parts,
      controller,
      on_message,
      on_finish,
    } = dto
    const response = await fetch(`${HOST}/run_sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        app_name,
        user_id: sub,
        session_id,
        new_message: {
          role: 'user',
          parts,
        },
        streaming: false,
      }),
      signal: controller.signal,
    })

    this.handle_response(response)

    // TypeScript requires checking if body exists
    if (!response.body) {
      throw new Error('Response body is null')
    }

    const reader = response.body.getReader()

    // We don't await this; it runs in the background handling the stream
    on_message_sse({ reader, on_message, on_finish })

    return reader
  }

  async create_session(agent: string): Promise<Session> {
    const response = await fetch(
      `${HOST}/apps/${agent}/users/${this.context.getUser()?.sub}/sessions`,
      {
        method: 'POST',
        credentials: 'include',
      },
    )

    this.handle_response(response)

    const body = (await response.json()) as Session

    return body
  }

  async fetch_sessions(app: string): Promise<Session[]> {
    const response = await fetch(`${HOST}/apps/${app}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    this.handle_response(response)

    // Cast the JSON result to our expected type
    const body = (await response.json()) as { history: Session[] }

    return body.history
  }

  async fetch_session(agent: string, session_id: string): Promise<Session> {
    const response = await fetch(
      `${HOST}/apps/${agent}/users/${this.context.getUser()?.sub}/sessions/${session_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    )

    this.handle_response(response)

    const body = (await response.json()) as Session

    return body
  }

  async fetch_agents(): Promise<Agent[]> {
    const response = await fetch(`${HOST}/agents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    this.handle_response(response)

    const body = (await response.json()) as AgentResponse

    return body.agents
  }

  async fetch_user(): Promise<User> {
    const response = await fetch(`${HOST}/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    this.handle_response(response)

    const body = (await response.json()) as UserResponse

    return body.user_response
  }

  async fetch_health(): Promise<Health> {
    const response = await fetch(`${HOST}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    this.handle_response(response)

    const body = (await response.json()) as Health

    return body
  }

  async send_feedback(dto: FeedbackDto): Promise<string> {
    const response = await fetch(`${HOST}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        feedback_category: dto.feedback_category,
        feedback_text: dto.feedback_text,
        id: dto.id,
      }),
    })

    this.handle_response(response)

    const body = await response.text()

    return body
  }

  async fetch_artifact(
    agent: string,
    dto: {
      artifact_name: string
      version: string | number
      session: string
    },
  ): Promise<ArtifactResponse> {
    const response = await fetch(
      `${HOST}/apps/${agent}/users/${this.context.getUser()?.sub}/sessions/${dto.session}/artifacts/${dto.artifact_name}?version=${dto.version}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    )

    this.handle_response(response)

    const body = (await response.json()) as ArtifactResponse

    return body
  }

  async delete_session(
    agent: string,
    session_id: string,
  ): Promise<DeleteSessionResponse> {
    const response = await fetch(
      `${HOST}/apps/${agent}/users/${this.context.getUser()?.sub}/sessions/${session_id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    )

    this.handle_response(response)

    const body = (await response.json()) as DeleteSessionResponse

    return body
  }

  async sign_out(): Promise<void> {
    const response = await fetch(`${HOST}/logout`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    this.handle_response(response)
  }

  handle_response(response: Response) {
    if (response.status === 200) return

    if (response.status === 401) {
      this.context.on401()
      throw new Unauthorized()
    }

    if (response.status === 404) {
      this.context.on404()
      throw new NotFound()
    }

    throw new HttpError(response.status)
  }
}

declare global {
  interface ErrorConstructor {
    captureStackTrace(
      targetObject: object,
      constructorOpt?: typeof HttpError,
    ): void
  }
}

export const UNAUTHORIZED = 'Unauthorized'
export const NOTFOUND = 'NotFound'
export const HTTPERROR = 'HttpError'

export class HttpError extends Error {
  constructor(status: number) {
    super(`Weird error has occurred with status code ${status}`)
    this.name = HTTPERROR
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError)
    }
  }
}

export class Unauthorized extends Error {
  constructor() {
    super('Unauthorized to access API')
    this.name = UNAUTHORIZED
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Unauthorized)
    }
  }
}

export class NotFound extends Error {
  constructor() {
    super('Resource not found')
    this.name = NOTFOUND

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFound)
    }
  }
}
interface SendMessageArgs {
  parts: RequestPart[]
  session_id: string
  controller: AbortController
  sub: string
  app_name: string
  on_message: (data: ChatItem) => void
  on_finish: () => void
  on_abort?: () => void
}

interface SseHandlerArgs {
  reader: ReadableStreamDefaultReader<Uint8Array>
  on_message: (data: ChatItem) => void
  on_finish: () => void
}

const on_message_sse = async ({
  reader,
  on_message,
  on_finish,
}: SseHandlerArgs): Promise<void> => {
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        on_finish()
        break
      }

      // 'value' is Uint8Array. decode() handles it correctly.
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      const parts = buffer.split('\n\n')
      // pop() can be undefined if array is empty, fallback to empty string
      buffer = parts.pop() || ''

      for (const part of parts) {
        const lines = part.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '')
            try {
              const data = JSON.parse(jsonStr) as ChatItem
              on_message(data)
            } catch (e) {
              const error = `Received non-JSON data: ${jsonStr}`
              console.error(error, e)
              on_message({ error } as ChatItem)
            }
          }
        }
      }
    }
  } catch (error) {
    // If the error is an AbortError (user cancelled), we might not want to log it as an error
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Stream aborted')
    } else {
      console.error('Stream reading error:', error)
      throw error
    }
  } finally {
    try {
      reader.releaseLock()
    } catch (e) {
      console.error(e)
      // Ignore errors during release
    }
  }
}
