import { useState, useCallback, memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import { ComponentNode } from '@a2ui/react/v0_8'
import { Dialog, Box, IconButton } from '@mui/material'

/**
 * Modal component - displays content in a dialog overlay.
 *
 * Matches Lit's rendering approach:
 * - When closed: renders container with entry point child
 * - When open: renders dialog with content child (entry point is replaced)
 *
 * The dialog uses `disablePortal` to render in place so it stays inside
 * .a2ui-surface and inherited CSS selectors work correctly.
 */
export const Modal = memo(function Modal({
  node,
  surfaceId,
}: A2UIComponentProps<Types.ModalNode>) {
  const props = node.properties

  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  if (!isOpen) {
    return (
      <Box onClick={openModal} style={{ cursor: 'pointer' }}>
        <ComponentNode node={props.entryPointChild} surfaceId={surfaceId} />
      </Box>
    )
  }

  return (
    <Dialog open={isOpen} onClose={closeModal}>
      <Box id="controls">
        <IconButton onClick={closeModal} aria-label="Close modal">
          <span className="g-icon">close</span>
        </IconButton>
      </Box>
      <ComponentNode node={props.contentChild} surfaceId={surfaceId} />
    </Dialog>
  )
})

export default Modal
