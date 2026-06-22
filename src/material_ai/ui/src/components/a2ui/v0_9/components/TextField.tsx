import React from 'react'
import { TextFieldApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import { TextField as MuiTextField } from '@mui/material'

export const TextField = createComponentImplementation(
  TextFieldApi,
  ({ props }) => {
    const onChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      props.setValue(e.target.value)
    }

    const isLong = props.variant === 'longText'
    const type =
      props.variant === 'number'
        ? 'number'
        : props.variant === 'obscured'
          ? 'password'
          : 'text'

    const hasError = props.validationErrors && props.validationErrors.length > 0
    const errorMessage = hasError ? props.validationErrors![0] : undefined

    return (
      <MuiTextField
        sx={{ margin: '10px 0px' }}
        label={props.label}
        value={props.value || ''}
        onChange={onChange}
        type={isLong ? undefined : type}
        multiline={isLong}
        minRows={isLong ? 3 : undefined} // Provides a text-area feel for longText
        error={hasError}
        helperText={errorMessage}
        variant="outlined"
        fullWidth
      />
    )
  },
)
