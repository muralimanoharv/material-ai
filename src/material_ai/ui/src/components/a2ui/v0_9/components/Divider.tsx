import { DividerApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import { Divider as MuiDivider } from '@mui/material'

export const Divider = createComponentImplementation(
  DividerApi,
  ({ props }) => {
    const isVertical = props.axis === 'vertical'

    return (
      <MuiDivider
        orientation={isVertical ? 'vertical' : 'horizontal'}
        flexItem={isVertical} // Highly recommended by MUI so vertical dividers stretch correctly in flex containers
        sx={{
          // Replaces the custom var(--a2ui-divider-spacing) margin logic
          // with standard MUI theme spacing (2 = 16px).
          ...(isVertical ? { mx: 2 } : { my: 2 }),
        }}
      />
    )
  },
)
