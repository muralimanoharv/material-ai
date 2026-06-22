import { memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import {
  useA2UIComponent,
  classMapToString,
  stylesToObject,
  ComponentNode,
} from '@a2ui/react/v0_8'
import { Card as MuiCard } from '@mui/material'

export const Card = memo(function Card({
  node,
  surfaceId,
}: A2UIComponentProps<Types.CardNode>) {
  const { theme } = useA2UIComponent(node, surfaceId)
  const props = node.properties

  // Card can have either a single child or multiple children
  const rawChildren = props.children ?? (props.child ? [props.child] : [])
  const children = Array.isArray(rawChildren) ? rawChildren : []

  return (
    <MuiCard
      className={classMapToString(theme.components.Card)}
      style={stylesToObject(theme.additionalStyles?.Card)}
      sx={{ m: 1 }}
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
          <ComponentNode key={childId} node={childNode} surfaceId={surfaceId} />
        )
      })}
    </MuiCard>
  )
})

export default Card
