
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
    return async ({ prompt, session_id, user_id }) => {
        try {
            context.setLoading(true)
            const response = await fetch(`${HOST}/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    app_name: APP_NAME,
                    user_id,
                    session_id,
                    new_message: {
                        role: "user",
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    },
                    streaming: false
                })
            })
            let body = await response.json();
            return body
        } finally {
            context.setLoading(false)
        }
    }
}
