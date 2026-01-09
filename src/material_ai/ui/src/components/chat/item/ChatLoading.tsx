import { Box, Button, Collapse, useTheme } from '@mui/material'
import LoadingIndicator from './LoadingIndicator'
import { useContext, useState } from 'react'
import { ChatItemContext, type ChatItemContextType } from '../../../context'
import ChatItemWrapper from './ChatItemWrapper'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import type { ChatPart } from '../../../schema'
import { does_chat_has_func } from '../../../utils'
import ChatFunctionResponse from './ChatFunctionResponse'
import ChatFunctionCall from './ChatFunctionCall'
import ChatTextRenderer from './ChatTextRenderer'
import { DARK_BORDER, LIGHT_BORDER } from '../../../assets/themes'

function ChatLoading(): React.JSX.Element | null {
  const { chat } = useContext(ChatItemContext) as ChatItemContextType
  const [showThinking, setShowThinking] = useState(
    chat.loading_finished || !!chat.chat_history?.length,
  )
  const theme = useTheme()

  if (!chat.loading) return null

  let border = `1px solid ${LIGHT_BORDER}`
  if (theme.palette.mode === 'dark') {
    border = `1px solid ${DARK_BORDER}`
  }
  const loadingText = chat.loading_finished
    ? 'Show thinking'
    : chat.loading_message
      ? chat.loading_message
      : 'Loading...'

  return (
    <ChatItemWrapper partIdx="loading" role="model">
      <Box
        className="gemini-loader-container"
        sx={{
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Box display="flex" flexDirection="column">
          <Box
            display="flex"
            flexDirection="row"
            gap={chat.loading_finished ? '4px' : '8px'}
          >
            <Box display="flex">
              {chat.loading_finished ? (
                <img src="/gemini.svg" alt="Gemini" style={{ width: '30px' }} />
              ) : (
                <LoadingIndicator />
              )}
            </Box>
            <Box display="flex">
              <Button
                sx={{
                  borderRadius: '50px',
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                }}
                onClick={() => setShowThinking(!showThinking)}
                endIcon={
                  showThinking ? (
                    <KeyboardArrowUpIcon fontSize="small" />
                  ) : (
                    <KeyboardArrowDownIcon fontSize="small" />
                  )
                }
              >
                <span
                  className="animate-loading-text"
                  key={loadingText.toString()}
                >
                  {loadingText}
                </span>
              </Button>
            </Box>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            paddingLeft="4px"
            marginLeft="15px"
            borderLeft={border}
          >
            <Box>
              <Collapse in={showThinking} timeout="auto">
                <Box
                  display="flex"
                  flexDirection="column"
                  gap="10px"
                  fontStyle="italic"
                  fontSize="14px"
                >
                  {chat.chat_history
                    ?.filter((chat) => {
                      if (does_chat_has_func(chat)) return true
                      return false
                    })
                    .map((chat) => {
                      return (
                        <>
                          {chat.content.parts.map((part, idx) => {
                            return (
                              <ChatLoadingSection part={part} partIdx={idx} />
                            )
                          })}
                        </>
                      )
                    })}
                </Box>
              </Collapse>
            </Box>
          </Box>
        </Box>
      </Box>
    </ChatItemWrapper>
  )
}

function ChatLoadingSection({
  part,
  partIdx,
}: {
  part: ChatPart
  partIdx: number
}) {
  if (part.inlineData) return null

  if (part.functionCall)
    return <ChatFunctionCall part={part} partIdx={partIdx} isThinkingSection />

  if (part.functionResponse)
    return (
      <ChatFunctionResponse part={part} partIdx={partIdx} isThinkingSection />
    )

  return (
    <ChatItemWrapper partIdx={`${partIdx}`} role="model" isThinkingSection>
      <ChatTextRenderer
        textExpand={false}
        isUser={false}
        isLargeText={() => false}
        part={part}
      />
    </ChatItemWrapper>
  )
}

export default ChatLoading
