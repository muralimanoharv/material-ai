import {
  type ChatItem,
  type ChatPart,
  type FileAttachment,
  type RequestPart,
} from './schema'

export interface Base64FileResult {
  data: string
  type: string
  name: string
}

export function fileToBase64(file: File): Promise<Base64FileResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = () => {
      // FileReader.result can be string | ArrayBuffer | null.
      // Since we used readAsDataURL, we assert it is a string.
      const result = reader.result as string

      // Get just the base64 content
      const encoded = result.split(',')[1]

      // Resolve with an object containing data, type, and name
      resolve({ data: encoded, type: file.type, name: file.name })
    }

    reader.onerror = (error) => reject(error)
  })
}

export function formatBase64Data(data: string, mimeType: string): string {
  return `data:${mimeType};base64,${fixBase64String(data)}`
}

export function fixBase64String(base64: string): string {
  // Create a mutable copy to avoid reassigning the parameter
  let fixedString = base64.replace(/-/g, '+').replace(/_/g, '/')

  // Fix base64 padding
  while (fixedString.length % 4 !== 0) {
    fixedString += '='
  }

  return fixedString
}

export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
  } catch {
    return false
  }
  return true
}

export const createParts = ({
  prompt,
  files = [],
}: {
  prompt: string
  files?: FileAttachment[]
}): [RequestPart[], ChatPart[]] => {
  const promptPart = { text: prompt }

  // 1. Early return if no files (cleaner guard clause)
  if (files.length === 0) {
    return [[promptPart], [promptPart]]
  }

  // 2. Prepare the shared metadata part
  const metaPart = {
    text: JSON.stringify({ fileNames: files.map((f) => f.name) }),
  }

  const getMimeType = (mimeType: string): string => {
    if (!mimeType) return 'text/plain'

    const normalizedMime = mimeType.toLowerCase().trim()

    // Unsupported structured data / code types that should be sent as plain text
    const textFallbacks = [
      'application/json',
      'application/jsonl',
      'text/javascript',
      'text/html',
      'text/css',
      'text/xml',
      'text/csv',
      'text/rtf',
    ]

    if (textFallbacks.includes(normalizedMime)) {
      return 'text/plain'
    }

    return mimeType
  }

  const getInlineData = (file: FileAttachment): RequestPart => {
    const { inlineData } = file
    return {
      inline_data: {
        data: inlineData.data,
        mime_type: getMimeType(inlineData.mimeType),
      },
    }
  }

  // 3. Construct Request Parts (snake_case for API)
  const requestParts: RequestPart[] = [
    promptPart,
    ...files.map((file) => getInlineData(file)),
    metaPart,
  ]

  // 4. Construct Chat Parts (camelCase for Internal/UI)
  const chatParts: ChatPart[] = [
    promptPart,
    ...files.map((file) => ({ inlineData: file.inlineData })),
    metaPart,
  ]

  return [requestParts, chatParts]
}

export const formatModelName = (modelId: string) => {
  if (!modelId) return ''

  return modelId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function does_chat_has_func(chat: ChatItem, needArtifaces = false) {
  if (needArtifaces) {
    if (Object.keys(chat.actions?.artifactDelta || {}).length) return false
  }
  const parts = chat?.content?.parts
  if (!parts) return false
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].functionCall) return true
    if (parts[i].functionResponse) return true
  }
  return false
}

export function scroll_to_view() {
  const parent = document.querySelector('.chat-items')
  if (parent) {
    const children = parent.children
    let lastUserMessage: Element | null = null

    for (let i = children.length - 1; i >= 0; i--) {
      if (children[i].classList.contains('chat-item-box-user')) {
        lastUserMessage = children[i]
        break
      }
    }

    if (!lastUserMessage) return

    lastUserMessage.scrollIntoView({
      behavior: 'smooth',
      inline: 'start',
      block: 'start',
    })
  }
}

export const getInitials = (name: string) => {
  if (!name) return ''
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export const getI18n = () => {
  return localStorage.getItem('i18n') || 'en'
}

export const setI18n = (lang: string) => {
  localStorage.setItem('i18n', lang)
  const event = new CustomEvent('i18n', {
    detail: { value: lang },
  })
  window.dispatchEvent(event)
}
