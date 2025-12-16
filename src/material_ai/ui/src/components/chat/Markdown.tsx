import { Typography, type TypographyProps } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { type ReactNode } from 'react'
import { renderDynamicUI, type UINode } from '../DynamicMuiLoader'

// 1. Define Props Interface
interface MarkdownProps {
  children: string | null | undefined
}

export default function Markdown(props: MarkdownProps) {
  const content = props.children || ''

  return (
    <div className="react-markdown" style={{ flexGrow: 1 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: TypographyParser('p'),
          h1: TypographyParser('h1'),
          h2: TypographyParser('h2'),
          h3: TypographyParser('h3'),
          h4: TypographyParser('h4'),
          h5: TypographyParser('h5'),
          h6: TypographyParser('h6'),
          code: CustomCodeRenderer,
          // pre: (preProps) => (
          //   <pre
          //     style={{
          //       backgroundColor: theme.palette.background.paper,
          //       padding: '10px',
          //       borderRadius: '4px',
          //       overflowX: 'auto',
          //     }}
          //   >
          //     {preProps.children}
          //   </pre>
          // ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function TypographyParser(variant: TypographyProps['variant']) {
  return ({ children }: { children?: ReactNode }) => (
    <Typography variant={variant}>{children}</Typography>
  )
}

const CustomCodeRenderer = ({
  className,
  children,
}: React.HTMLAttributes<HTMLElement>) => {
  const match = /language-(\w+)/.exec(className || '')
  const isJson = match && match[1] === 'json'

  if (!isJson) return <>Invalid Response</>

  let parsedData: UINode | null = null
  let isParsedSuccessfully = false

  try {
    const jsonString = String(children).replace(/\n$/, '')
    parsedData = JSON.parse(jsonString)
    isParsedSuccessfully = true
  } catch (error) {
    console.warn('Failed to parse JSON for UI:', error)
  }

  if (!isParsedSuccessfully) {
    return <>{children}</>
  }

  if (!parsedData?.componentName) {
    return <>Error: Component Name not found</>
  }

  // Success
  return <>{renderDynamicUI(parsedData)}</>
}
