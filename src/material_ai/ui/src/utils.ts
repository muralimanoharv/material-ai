import { type FileAttachment, type RequestPart } from './schema'

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
  } catch (e) {
    console.debug(e)
    return false
  }
  return true
}

export const createParts = ({
  prompt,
  files,
}: {
  prompt: string
  files: FileAttachment[]
}): RequestPart[] => {
  const parts: RequestPart[] = [{ text: prompt }]
  if (!files?.length) return parts

  const fileParts = files.map((file) => ({
    inline_data: {
      ...file.inlineData,
    },
  }))

  const fileNames = files.map((file) => file.name)
  parts.push(...fileParts)
  parts.push({ text: JSON.stringify({ fileNames }) })

  return parts
}

export const formatModelName = (modelId: string) => {
  if (!modelId) return ''

  return modelId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
