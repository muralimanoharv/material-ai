import { IconApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'

import { SvgIcon } from '@mui/material'
import { ICON_COMPONENTS } from '../../icons'
export const Icon = createComponentImplementation(IconApi, ({ props }) => {
  // Handle custom SVG paths just like before
  const isPath =
    typeof props.name === 'object' &&
    props.name !== null &&
    'svgPath' in props.name

  if (isPath) {
    const path = (props.name as unknown as { svgPath: string }).svgPath
    return (
      <SvgIcon sx={{ color: 'inherit', fontSize: 'inherit' }}>
        <path d={path} />
      </SvgIcon>
    )
  }

  // 3. Render the mapped component dynamically
  if (typeof props.name === 'string') {
    const MappedIcon = ICON_COMPONENTS[props.name]

    if (MappedIcon) {
      return <MappedIcon sx={{ color: 'inherit', fontSize: 'inherit' }} />
    }
  }

  // Fallback if the icon name isn't found in your map
  return <>{props?.name}</>
})

export default Icon
