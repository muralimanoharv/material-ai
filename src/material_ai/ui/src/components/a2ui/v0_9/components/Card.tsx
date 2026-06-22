import { createComponentImplementation } from '@a2ui/react/v0_9'
import { CardApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { Card as MuiCard } from '@mui/material'

export const Card = createComponentImplementation(
  CardApi,
  ({ props, buildChild }) => {
    return (
      <MuiCard sx={{ padding: '8px', margin: '8px' }}>
        {props.child ? buildChild(props.child) : null}
      </MuiCard>
    )
  },
)
