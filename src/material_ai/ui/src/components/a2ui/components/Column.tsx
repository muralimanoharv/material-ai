import { ColumnApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import { Stack } from '@mui/material'
import { mapAlign, mapJustify } from './util'
import { ChildList } from './ChildList'

// Assuming mapJustify, mapAlign, and ChildList are defined in or imported into this file
// (they use the exact same logic as the Row component).

export const Column = createComponentImplementation(
  ColumnApi,
  ({ props, buildChild, context }) => {
    return (
      <Stack
        direction="column"
        justifyContent={mapJustify(props.justify)}
        alignItems={mapAlign(props.align)}
        spacing={2} // Replaces var(--a2ui-column-gap) with standard MUI 16px spacing
        sx={{
          // Replaces getWeightStyle directly within MUI's styling engine
          ...(typeof props.weight === 'number' && {
            flex: props.weight,
            minWidth: 0,
            minHeight: 0,
          }),
        }}
      >
        <ChildList
          childList={props.children}
          buildChild={buildChild}
          context={context}
        />
      </Stack>
    )
  },
)
