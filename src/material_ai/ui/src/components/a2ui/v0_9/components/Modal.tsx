import { useState } from 'react'
import { ModalApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import { Dialog, DialogContent, Box, IconButton } from '@mui/material'

export const Modal = createComponentImplementation(
  ModalApi,
  ({ props, buildChild }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <>
        {/* Trigger Wrapper */}
        <Box
          onClick={() => setIsOpen(true)}
          sx={{ display: 'inline-block', cursor: 'pointer' }}
        >
          {props.trigger ? buildChild(props.trigger) : null}
        </Box>

        {/* Modal / Dialog */}
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          maxWidth="sm" // Provides a sensible responsive max-width
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2, // Standard MUI 8px border radius
              m: 2, // Margin to ensure it doesn't touch the screen edges on small devices
            },
          }}
        >
          {/* Close Button Header */}
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1, pr: 1 }}
          >
            <IconButton
              onClick={() => setIsOpen(false)}
              aria-label="close modal"
              size="small"
              sx={{ fontSize: '1.5rem', lineHeight: 1 }}
            >
              &times;
            </IconButton>
          </Box>

          {/* Inner Content */}
          <DialogContent sx={{ pt: 0, pb: 3, px: 3 }}>
            {props.content ? buildChild(props.content) : null}
          </DialogContent>
        </Dialog>
      </>
    )
  },
)
