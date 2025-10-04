import { HOST } from "./assets/config";


export function create_session(context) {

    return async () => {
        const response = await fetch(`${HOST}/apps/${context.selectedAgent}/users/${context.user.email}/sessions`, {
            method: 'POST',
            credentials: 'include',
        })
        handle_response(response, context)
        let body = await response.json();
        return { user_id: body.user_id, session_id: body.id }
    }

}

export function send_message(context) {
    return async ({ parts, session_id, controller }) => {

        const response = await fetch(`${HOST}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                app_name: context.selectedAgent,
                user_id: context.user.email,
                session_id,
                new_message: {
                    role: "user",
                    parts
                },
                streaming: false
            }),
            signal: controller.signal
        })
        handle_response(response, context)
        let body = await response.json();
        return body
    }
}

export function fetch_sessions(context) {
    return async ({ selectedAgent }) => {
        const response = await fetch(`${HOST}/apps/${selectedAgent}/users/${context.user.email}/sessions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        })
        handle_response(response, context)
        let body = await response.json();
        return body
    }
}

export function fetch_session(context) {
    return async ({ session_id, selected_agent, user }) => {
        const response = await fetch(`${HOST}/apps/${selected_agent ?? context.selectedAgent}/users/${user ?? context.user.email}/sessions/${session_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        })
        handle_response(response, context)
        if(response.status == 404) {
            throw new NotFound()
        }
        let body = await response.json();
        return body
    }
}

export function fetch_agents(context) {
    return async () => {
        const response = await fetch(`${HOST}/list-apps`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        })
        handle_response(response, context)
        let body = await response.json();
        return body
    }
}

export function fetch_user(context) {
    return async () => {
        const response = await fetch(`${HOST}/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        })
        handle_response(response, context)
        let body = await response.json();
        return body
    }
}




export function send_feedback() {

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
                id
            })
        })
        handle_response(response, context)
        let body = await response.text();
        return body
    }
}





export function fetch_artifact(context) {
    return async ({ artifact_name, version }) => {
        const response = await fetch(`${HOST}/apps/${context.selectedAgent}/users/${context.user.email}/sessions/${context.session}/artifacts/${artifact_name}?version=${version}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        handle_response(response, context)
        let body = await response.json();
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

/**
 * Converts a File object to a base64 encoded string.
 * @param {File} file The file to convert.
 * @returns {Promise<string>} A promise that resolves with the base64 string.
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Get just the base64 content
            const encoded = reader.result.toString().split(',')[1];

            // Resolve with an object containing both data and type
            resolve({ data: encoded, type: file.type, name: file.name });
        };
        reader.onerror = error => reject(error);
    });
}

export function formatBase64Data(data, mimeType) {
    return `data:${mimeType};base64,${fixBase64String(data)}`;
}

export function fixBase64String(base64) {
    // Replace URL-safe characters if they exist
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

    // Fix base64 padding
    while (base64.length % 4 !== 0) {
        base64 += '=';
    }

    return base64;
}


/**
 * Checks if a string is a valid JSON string.
 * @param {string} str The string to check.
 * @returns {boolean} True if the string is valid JSON, otherwise false.
 */
export function isValidJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function handle_response(respone, context) {
    if(respone.status == 200) return
    if(respone.status == 401) {
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
    super(`Weird error has occured with status code ${status}`);
    this.name = HTTPERROR;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
}

class Unauthorized extends Error {
  constructor() {
    super('Unauthorized to access API');
    this.name = UNAUTHORIZED;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Unauthorized);
    }
  }
}

class NotFound extends Error {
  constructor() {
    super('Unauthorized to access API');
    this.name = NOTFOUND;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Unauthorized);
    }
  }
}