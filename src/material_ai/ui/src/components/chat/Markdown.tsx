import { Typography, type TypographyProps } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useContext, type ReactNode } from 'react'
import { AppContext, type AppContextType } from '../../context'
import CustomCode from './CustomCode'
import BabelReactRenderer from '../BabelReactRenderer'
import { isValidJson, processA2UIResponse } from '../../utils'
import { A2UIRender } from './item/A2UIRender'
import type { A2uiMessage } from '@a2ui/web_core/v0_9'

export function TypographyParser(variant: TypographyProps['variant']) {
  return ({ children }: { children?: ReactNode }) => (
    <Typography variant={variant}>{children}</Typography>
  )
}

interface MarkdownProps {
  children: string | null | undefined
}

export default function Markdown(props: MarkdownProps) {
  const content = props.children || ''

  if (content.includes('<a2ui-json>')) {
    const processedContent = processA2UIResponse(content)
    return (
      <div className="react-markdown" style={{ flexGrow: 1 }}>
        {processedContent.map((item, idx) => {
          if (typeof item === 'string') {
            return (
              <ReactMarkdown
                key={idx}
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CustomCodeRenderer,
                }}
              >
                {item}
              </ReactMarkdown>
            )
          }
          return <A2UIRender messages={item as A2uiMessage[]} />
        })}
      </div>
    )
  }

  return (
    <div className="react-markdown" style={{ flexGrow: 1 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CustomCodeRenderer,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

const CustomCodeRenderer = ({
  children,
}: React.HTMLAttributes<HTMLElement>) => {
  const { setSnack } = useContext(AppContext) as AppContextType

  const rawString = String(children).replace(/\n$/, '')

  if (rawString.includes('export default') || rawString.includes('React')) {
    return <BabelReactRenderer code={rawString} />
  }

  if (isValidJson(rawString)) {
    const content = JSON.stringify(JSON.parse(rawString), null, 2)
    return (
      <CustomCode
        content={content}
        title="JSON"
        onCopy={async () => {
          await navigator.clipboard.writeText(content)
          setSnack('Copied to clipboard')
        }}
      />
    )
  }

  return children
}
