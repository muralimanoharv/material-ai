const HOST = import.meta.env.VITE_API_BASE_URL;

export function create_session(context) {

    return async () => {
        const response = await fetch(`${HOST}/apps/${context.selectedAgent}/users/${context.user}/sessions`, {
            method: 'POST',
        })
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
            body: JSON.stringify({
                app_name: context.selectedAgent,
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

export function fetch_sessions(context) {
    return async ({ selectedAgent }) => {
        const response = await fetch(`${HOST}/apps/${selectedAgent}/users/${context.user}/sessions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        let body = await response.json();
        return body
    }
}

export function fetch_session(context) {
    return async ({ session_id, selected_agent }) => {
        const response = await fetch(`${HOST}/apps/${selected_agent ?? context.selectedAgent}/users/${context.user}/sessions/${session_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        let body = await response.json();
        return body
    }
}

export function fetch_agents() {
    return async () => {
        const response = await fetch(`${HOST}/list-apps`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
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
            body: JSON.stringify({
                feedback_category,
                feedback_text,
                id
            })
        })
        let body = await response.text();
        return body
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


export function fetch_artifact(context) {
    return async ({ artifact_name, version }) => {
        const response = await fetch(`${HOST}/apps/${context.selectedAgent}/users/${context.user}/sessions/${context.session}/artifacts/${artifact_name}?version=${version}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        let body = await response.json();
        return body
    }
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