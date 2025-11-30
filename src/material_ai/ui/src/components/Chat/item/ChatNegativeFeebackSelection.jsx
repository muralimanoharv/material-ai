import { useContext, useState } from 'react'
import MaterialList from '../../material/MaterialList'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  IconButton,
  ListItem,
  ListItemButton,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { AppContext, ChatItemContext } from '../../../context'
import CheckIcon from '@mui/icons-material/Check'

export default function ChatNegativeFeebackSelection() {
  const { config } = useContext(AppContext)
  const { feedback, postNegativeFeedback } = useContext(ChatItemContext)
  const [otherBox, setOtherBox] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const theme = useTheme()
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        marginTop: '10px',
        gap: '10px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          fontSize={'22px'}
          color={theme.palette.text.primary}
          variant="p"
        >
          What went wrong?
        </Typography>
        <IconButton
          onClick={() => {
            postNegativeFeedback({ ...feedback })
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Typography variant="h4">
        Your feedback helps make {config.title} better for everyone.
      </Typography>
      <Box>
        <MaterialList>
          {config.feedback.negative.categories.map((category) => {
            return (
              <ListItem disablePadding key={category}>
                <ListItemButton
                  onClick={() => {
                    postNegativeFeedback({
                      ...feedback,
                      feedback_text: category,
                    })
                  }}
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    padding: '12px 16px',
                  }}
                >
                  {category}
                </ListItemButton>
              </ListItem>
            )
          })}
          <ListItem disablePadding key={'Other'}>
            <ListItemButton
              disableRipple
              sx={{
                backgroundColor: `${theme.palette.background.paper} !important`,
                padding: '12px 16px',
                '&:hover, &:active': {
                  backgroundColor: theme.palette.background.paper,
                },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between' }}
                  onClick={() => setOtherBox(!otherBox)}
                >
                  <Box>Other</Box>
                  {otherBox && <CheckIcon fontSize="small" />}
                </Box>
                {otherBox && (
                  <>
                    <Box>
                      <TextField
                        autoComplete="off"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        autoFocus
                        fullWidth
                        id="outlined-basic"
                        label="Feedback"
                        variant="outlined"
                        placeholder="Provide additional feedback"
                      />
                    </Box>
                    <Box>
                      <Button
                        onClick={() => {
                          postNegativeFeedback({
                            ...feedback,
                            feedback_text: feedbackText,
                          })
                        }}
                        sx={{
                          color: theme.palette.background.default,
                          padding: '10px 24px',
                          borderRadius: '100px',
                        }}
                        variant="contained"
                      >
                        Submit
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </ListItemButton>
          </ListItem>
        </MaterialList>
      </Box>
    </Box>
  )
}
