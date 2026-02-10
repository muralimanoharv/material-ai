import { Typography, type TypographyProps } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useContext, type ReactNode } from 'react'
import { AppContext, type AppContextType } from '../../context'
import CustomCode from './CustomCode'
import BabelReactRenderer from '../BabelReactRenderer'
import { isValidJson } from '../../utils'

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

  ;<CustomCode
    content={rawString}
    title="TEXT"
    onCopy={async () => {
      await navigator.clipboard.writeText(rawString)
      setSnack('Copied to clipboard')
    }}
  />
}
