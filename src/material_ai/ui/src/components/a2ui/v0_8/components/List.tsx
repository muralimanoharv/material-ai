import { memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import {
  useA2UIComponent,
  classMapToString,
  stylesToObject,
  ComponentNode,
} from '@a2ui/react/v0_8'
import { List as MuiList } from '@mui/material'

/**
 * List component - renders a scrollable list of items.
 *
 * Supports direction (vertical/horizontal) properties.
 * Uses Material UI's List component as the inner container.
 */
export const List = memo(function List({
  node,
  surfaceId,
}: A2UIComponentProps<Types.ListNode>) {
  const { theme } = useA2UIComponent(node, surfaceId)
  const props = node.properties

  // Match Lit's default value
  const direction = props.direction ?? 'vertical'

  const children = Array.isArray(props.children) ? props.children : []

  // Apply --weight CSS variable on root div (:host equivalent) for flex layouts
  const hostStyle: React.CSSProperties =
    node.weight !== undefined
      ? ({ '--weight': node.weight } as React.CSSProperties)
      : {}

  // Structure mirrors Lit's List component using MUI equivalents:
  //   <div class="a2ui-list" data-direction="...">  ← :host equivalent
  //     <MuiList class="...">                       ← theme-receiving container
  //       {children}                                ← mapped ComponentNodes
  //     </MuiList>
  //   </div>
  return (
    <div className="a2ui-list" data-direction={direction} style={hostStyle}>
      <MuiList
        className={classMapToString(theme.components.List)}
        style={stylesToObject(theme.additionalStyles?.List)}
      >
        {children.map((child, index) => {
          const childId =
            typeof child === 'object' && child !== null && 'id' in child
              ? (child as Types.AnyComponentNode).id
              : `child-${index}`
          const childNode =
            typeof child === 'object' && child !== null && 'type' in child
              ? (child as Types.AnyComponentNode)
              : null
          return (
            <ComponentNode
              key={childId}
              node={childNode}
              surfaceId={surfaceId}
            />
          )
        })}
      </MuiList>
    </div>
  )
})

export default List
