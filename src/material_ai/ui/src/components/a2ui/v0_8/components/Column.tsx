import { memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import {
  useA2UIComponent,
  classMapToString,
  stylesToObject,
  ComponentNode,
} from '@a2ui/react/v0_8'
import { Box as MuiBox } from '@mui/material'

/**
 * Column component - arranges children vertically using flexbox.
 *
 * Supports distribution (justify-content) and alignment (align-items) properties.
 */
export const Column = memo(function Column({
  node,
  surfaceId,
}: A2UIComponentProps<Types.ColumnNode>) {
  const { theme } = useA2UIComponent(node, surfaceId)
  const props = node.properties

  // Match Lit's default values
  const alignment = props.alignment ?? 'stretch'
  const distribution = props.distribution ?? 'start'

  const children = Array.isArray(props.children) ? props.children : []

  // Apply --weight CSS variable on root div (:host equivalent) for flex layouts
  const hostStyle: React.CSSProperties =
    node.weight !== undefined
      ? ({ '--weight': node.weight } as React.CSSProperties)
      : {}

  return (
    <div
      className="a2ui-column"
      data-alignment={alignment}
      data-distribution={distribution}
      style={hostStyle}
    >
      <MuiBox
        className={classMapToString(theme.components.Column)}
        style={stylesToObject(theme.additionalStyles?.Column)}
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
      </MuiBox>
    </div>
  )
})

export default Column
