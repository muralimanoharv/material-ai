import { RowApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import { Stack } from '@mui/material'
import { mapAlign, mapJustify } from './util'
import { ChildList } from './ChildList'

// --- COMPONENT IMPLEMENTATION ---

export const Row = createComponentImplementation(
  RowApi,
  ({ props, buildChild, context }) => {
    return (
      <Stack
        direction="row"
        justifyContent={mapJustify(props.justify)}
        alignItems={mapAlign(props.align)}
        spacing={2} // Fully replaces the var(--a2ui-row-gap) with MUI's standard 16px theme spacing
        sx={{
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
