import { memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import {
  useA2UIComponent,
  classMapToString,
  stylesToObject,
} from '@a2ui/react/v0_8'
import { Divider as MuiDivider } from '@mui/material'

/**
 * Divider component - renders a visual separator line.
 *
 * Structure mirrors Lit's Divider component using MUI:
 * <div class="a2ui-divider">  ← :host equivalent
 * <MuiDivider class="...">  ← internal element
 * </div>
 */
export const Divider = memo(function Divider({
  node,
  surfaceId,
}: A2UIComponentProps<Types.DividerNode>) {
  const { theme } = useA2UIComponent(node, surfaceId)

  // Apply --weight CSS variable on root div (:host equivalent) for flex layouts
  const hostStyle: React.CSSProperties =
    node.weight !== undefined
      ? ({ '--weight': node.weight } as React.CSSProperties)
      : {}

  return (
    <div className="a2ui-divider" style={hostStyle}>
      <MuiDivider
        className={classMapToString(theme.components.Divider)}
        style={stylesToObject(theme.additionalStyles?.Divider)}
      />
    </div>
  )
})

export default Divider
