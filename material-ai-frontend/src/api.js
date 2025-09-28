
const APP_NAME = 'material_ai_agent'
const HOST = `http://localhost:8000`
const API = `${HOST}/apps/${APP_NAME}`


export async function create_session({ user_id }) {
    const response = await fetch(`${API}/users/${user_id}/sessions`, {
        method: 'POST',
    })
    let body = await response.json();
    return { user_id: body.user_id, session_id: body.id }
}

export function send_message(context) {
    return async ({ parts, session_id, controller }) => {

        const response = await fetch(`${HOST}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                app_name: APP_NAME,
                user_id: context.user,
                session_id,
                new_message: {
                    role: "user",
                    parts
                },
                streaming: false
            }),
            signal: controller.signal
        })
        let body = await response.json();
        return body
    }
}

export function get_sessions(context) {
    return async () => {
        try {
            const response = await fetch(`${HOST}/apps/${APP_NAME}/users/${context.user}/sessions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            let body = await response.json();
            return body
        } finally {
        }
    }
}

export function fetch_session(context) {
    return async ({ session_id }) => {
        try {
            const response = await fetch(`${HOST}/apps/${APP_NAME}/users/${context.user}/sessions/${session_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            let body = await response.json();
            return body
        } finally {
        }
    }
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