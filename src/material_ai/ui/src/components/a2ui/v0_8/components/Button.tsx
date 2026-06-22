import { useCallback, memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import { useA2UIComponent } from '@a2ui/react/v0_8'
import { classMapToString, stylesToObject } from '@a2ui/react/v0_8'
import { ComponentNode } from '@a2ui/react/v0_8'
import { Button as MuiButton } from '@mui/material'

export const Button = memo(function Button({
  node,
  surfaceId,
}: A2UIComponentProps<Types.ButtonNode>) {
  const { theme, sendAction } = useA2UIComponent(node, surfaceId)
  const props = node.properties

  const handleClick = useCallback(() => {
    if (props.action) {
      sendAction(props.action)
    }
  }, [props.action, sendAction])

  return (
    <MuiButton
      className={classMapToString(theme.components.Button)}
      style={stylesToObject(theme.additionalStyles?.Button)}
      onClick={handleClick}
    >
      <ComponentNode node={props.child} surfaceId={surfaceId} />
    </MuiButton>
  )
})

export default Button
