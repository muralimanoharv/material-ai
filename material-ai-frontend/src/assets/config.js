export const config = {
    title: 'Gemini',
    greeting: 'What should we do today?',
    errorMessage: 'Some error has occured, Please try again later',
    models: [
        {
            model: '2.5 Flash',
            tagline: 'Fast all-round help'
        },
        {
            model: '2.5 Pro',
            tagline: 'Reasoning, math & code'
        }
    ],
    feedback: {
        positive: {
            value: 'GOOD',
        },
        negative: {
            value: 'BAD',
            categories: [
                "Not / poorly personalized",
                "Problem with saving information",
                "Not factually correct",
                "Didn't follow instructions",
                "Offensive / Unsafe",
                "Wrong language"
            ]
        }
    }
}
