export const HOST = import.meta.env.VITE_API_BASE_URL
export const config = {
  /** The main title of the application */
  title: 'Gemini',

  /** The initial greeting message displayed to the user on an empty chat. */
  greeting: 'What should we do today?',

  /** A generic error message for unexpected issues. */
  errorMessage: 'Some error has occured, Please try again later',

  /** An array of available AI models for the user to select. */
  models: [
    {
      /** The display name of the model. */
      model: '2.5 Flash',
      /** A brief, user-friendly description of the model's strengths. */
      tagline: 'Fast all-round help',
    },
    {
      model: '2.5 Pro',
      tagline: 'Reasoning, math & code',
    },
  ],

  /** Configuration for the user feedback system. */
  feedback: {
    /** Defines the structure for positive feedback. */
    positive: {
      /** The value sent to the backend for a positive rating. */
      value: 'GOOD',
    },
    /** Defines the structure for negative feedback. */
    negative: {
      /** The value sent to the backend for a negative rating. */
      value: 'BAD',
      /** A list of reasons why a response was unhelpful. */
      categories: [
        'Not / poorly personalized',
        'Problem with saving information',
        'Not factually correct',
        "Didn't follow instructions",
        'Offensive / Unsafe',
        'Wrong language',
      ],
    },
  },
}
