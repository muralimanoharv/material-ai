import { Typography, useTheme } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Markdown(props) {
  const theme = useTheme()
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
          pre: (props) => (
            <pre
              style={{
                backgroundColor: theme.palette.background.paper,
                padding: '10px',
              }}
            >
              {props.children}
            </pre>
          ),
        }}
      >
        {props.children}
      </ReactMarkdown>
    </div>
  )
}

function TypographyParser(varient) {
  return (props) => <Typography variant={varient}>{props.children}</Typography>
}
