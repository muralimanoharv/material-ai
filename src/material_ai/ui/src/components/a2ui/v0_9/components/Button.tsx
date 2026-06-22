import { ButtonApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import { Button as MuiButton } from '@mui/material'

export const Button = createComponentImplementation(
  ButtonApi,
  ({ props, buildChild }) => {
    let varient: 'text' | 'outlined' | 'contained' = 'contained'

    if (props.variant === 'primary') {
      varient = 'contained'
    } else if (props.variant === 'borderless') {
      varient = 'outlined'
    }

    return (
      <MuiButton
        variant={varient}
        onClick={props.action}
        disabled={props.isValid === false}
      >
        {props.child ? buildChild(props.child) : null}
      </MuiButton>
    )
  },
)
