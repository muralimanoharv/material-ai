import { HOST } from './assets/config'

export function create_session(context) {
  return async () => {
    const response = await fetch(
      `${HOST}/apps/${context.selectedAgent}/users/${context.user.email}/sessions`,
      {
        method: 'POST',
        credentials: 'include',
      },
    )
    handle_response(response, context)
    let body = await response.json()
    return { user_id: body.user_id, session_id: body.id }
  }
}

export function send_message(context) {
  return async ({ parts, session_id, controller }) => {
    const response = await fetch(`${HOST}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        app_name: context.selectedAgent,
        user_id: context.user.email,
        session_id,
        new_message: {
          role: 'user',
          parts,
        },
        streaming: false,
      }),
      signal: controller.signal,
    })
    handle_response(response, context)
    let body = await response.json()
    return body
  }
}

export function fetch_sessions(context) {
  return async ({ selectedAgent }) => {
    const response = await fetch(
      `${HOST}/apps/${selectedAgent}/users/${context.user.email}/sessions`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    )
    handle_response(response, context)
    let body = await response.json()
    return body
  }
}

export function fetch_session(context) {
  return async ({ session_id, selected_agent, user }) => {
    const response = await fetch(
      `${HOST}/apps/${selected_agent ?? context.selectedAgent}/users/${user ?? context.user.email}/sessions/${session_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    )
    handle_response(response, context)
    if (response.status == 404) {
      throw new NotFound()
    }
    let body = await response.json()
    return body
  }
}

export function fetch_agents(context) {
  return async () => {
    const response = await fetch(`${HOST}/list-apps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    handle_response(response, context)
    let body = await response.json()
    return body
  }
}

export function fetch_user(context) {
  return async () => {
    const response = await fetch(`${HOST}/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    handle_response(response, context)
    let body = await response.json()
    return body
  }
}

export function send_feedback(context) {
  return async ({ feedback_category, feedback_text, id }) => {
    const response = await fetch(`${HOST}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        feedback_category,
        feedback_text,
        id,
      }),
    })
    handle_response(response, context)
    let body = await response.text()
    return body
  }
}

export function fetch_artifact(context) {
  return async ({ artifact_name, version }) => {
    const response = await fetch(
      `${HOST}/apps/${context.selectedAgent}/users/${context.user.email}/sessions/${context.session}/artifacts/${artifact_name}?version=${version}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    )
    handle_response(response, context)
    let body = await response.json()
    return body
  }
}

export async function sign_out(context) {
  const response = await fetch(`${HOST}/logout`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  return handle_response(response, context)
}

export function handle_response(respone, context) {
  if (respone.status == 200) return
  if (respone.status == 401) {
    context.setUser()
    throw new Unauthorized()
  }
  throw new HttpError(respone.status)
}

export const UNAUTHORIZED = 'Unauthorized'
export const NOTFOUND = 'NotFound'
export const HTTPERROR = 'HttpError'

class HttpError extends Error {
  constructor(status) {
    super(`Weird error has occured with status code ${status}`)
    this.name = HTTPERROR
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError)
    }
  }
}

class Unauthorized extends Error {
  constructor() {
    super('Unauthorized to access API')
    this.name = UNAUTHORIZED
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Unauthorized)
    }
  }
}

class NotFound extends Error {
  constructor() {
    super('Unauthorized to access API')
    this.name = NOTFOUND
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Unauthorized)
    }
  }
}
