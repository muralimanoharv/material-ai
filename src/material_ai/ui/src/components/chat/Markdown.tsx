import { Typography, type TypographyProps } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { type ReactNode } from 'react'
import { renderDynamicUI } from '../DynamicMuiLoader'

// 1. Define Props Interface
interface MarkdownProps {
  children: string | null | undefined
}

export default function Markdown(props: MarkdownProps) {
  const content = props.children || ''

  return (
    <div className="react-markdown" style={{flexGrow: 1}}>
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

// 3. Custom Code Block Renderer
const CustomCodeRenderer = ({ className, children }: any) => {
  // Check if the language is 'json'
  const match = /language-(\w+)/.exec(className || '')
  const isJson = match && match[1] === 'json'

  if (!isJson) return <>Invalid Response</>

  try {
    const jsonString = String(children).replace(/\n$/, '')
    let data = JSON.parse(jsonString)

    if (data.componentName) {
      return <>{renderDynamicUI(data)}</>
    } else {
      return <>Error: Component Name not found</>
    }
  } catch (error) {
    console.warn('Failed to parse JSON for UI:', error)
  }

  return <>{children}</>
}
