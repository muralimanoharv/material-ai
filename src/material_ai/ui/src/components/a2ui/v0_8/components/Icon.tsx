import { memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import {
  useA2UIComponent,
  classMapToString,
  stylesToObject,
} from '@a2ui/react/v0_8'

import { Box, SvgIcon } from '@mui/material'
import { ICON_COMPONENTS } from '../../icons'

/**
 * Icon component - renders an icon using Material UI SVG Icons.
 * * Supports mapping string names to explicit MUI icon imports, or supplying
 * a custom `svgPath` on the node property.
 */
export const Icon = memo(function Icon({
  node,
  surfaceId,
}: A2UIComponentProps<Types.IconNode>) {
  const { theme, resolveString } = useA2UIComponent(node, surfaceId)
  const props = node.properties

  // 1. Check if the property is passing a direct SVG path
  const isPath =
    typeof props.name === 'object' &&
    props.name !== null &&
    'svgPath' in props.name

  // 2. Otherwise, attempt to resolve it as a standard string name
  const iconName = !isPath ? resolveString(props.name) : null

  // Apply --weight CSS variable on root div (:host equivalent) for flex layouts
  const hostStyle: React.CSSProperties =
    node.weight !== undefined
      ? ({ '--weight': node.weight } as React.CSSProperties)
      : {}

  // 3. Determine which Icon Element to render
  let IconElement = null

  if (isPath) {
    const path = (props.name as unknown as { svgPath: string }).svgPath
    IconElement = (
      <SvgIcon sx={{ color: 'inherit', fontSize: 'inherit' }}>
        <path d={path} />
      </SvgIcon>
    )
  } else if (iconName) {
    const MappedIcon = ICON_COMPONENTS[iconName]
    if (MappedIcon) {
      IconElement = (
        <MappedIcon sx={{ color: 'inherit', fontSize: 'inherit' }} />
      )
    } else {
      // Fallback if the icon name isn't found in your map
      IconElement = <>{iconName}</>
    }
  } else {
    // If neither a path nor a resolved string exists
    return null
  }

  // 4. Render within the v8 wrapper structure
  return (
    <div className="a2ui-icon" style={hostStyle}>
      <Box
        className={classMapToString(theme.components.Icon)}
        style={stylesToObject(theme.additionalStyles?.Icon)}
      >
        {IconElement}
      </Box>
    </div>
  )
})

export default Icon
