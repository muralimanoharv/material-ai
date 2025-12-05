import { Typography, useTheme, type TypographyProps } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { type ReactNode } from 'react'

// 1. Define Props Interface
interface MarkdownProps {
  children: string | null | undefined
}

export default function Markdown(props: MarkdownProps) {
  const theme = useTheme()

  const content = props.children || ''

  return (
    <div className="react-markdown">
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
          pre: (preProps) => (
            <pre
              style={{
                backgroundColor: theme.palette.background.paper,
                padding: '10px',
                borderRadius: '4px',
                overflowX: 'auto',
              }}
            >
              {preProps.children}
            </pre>
          ),
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
