import { ListApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { ChildList } from './ChildList'
import { mapAlign } from './util'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import { Stack } from '@mui/material'

export const List = createComponentImplementation(
  ListApi,
  ({ props, buildChild, context }) => {
    const isHorizontal = props.direction === 'horizontal'

    return (
      <Stack
        direction={isHorizontal ? 'row' : 'column'}
        alignItems={mapAlign(props.align)}
        spacing={1} // Replaces var(--a2ui-list-gap) with standard MUI 8px spacing
        sx={{
          overflowX: isHorizontal ? 'auto' : 'hidden',
          overflowY: isHorizontal ? 'hidden' : 'auto',
          p: 0, // Replaces var(--a2ui-list-padding)
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
