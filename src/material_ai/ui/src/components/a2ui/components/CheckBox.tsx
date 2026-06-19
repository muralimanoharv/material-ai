import React from 'react'
import { CheckBoxApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import {
  FormControl,
  FormControlLabel,
  Checkbox as MuiCheckbox,
  FormHelperText,
} from '@mui/material'

export const CheckBox = createComponentImplementation(
  CheckBoxApi,
  ({ props }) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      props.setValue(e.target.checked)
    }

    const hasError = props.validationErrors && props.validationErrors.length > 0
    const errorMessage = hasError ? props.validationErrors![0] : undefined

    return (
      <FormControl error={hasError} sx={{ m: 1 }}>
        <FormControlLabel
          control={
            <MuiCheckbox
              checked={!!props.value}
              onChange={onChange}
              color={hasError ? 'error' : 'primary'}
            />
          }
          label={props.label || ''}
          sx={{
            ...(hasError && { color: 'error.main' }),
            '& .MuiFormControlLabel-label': {
              fontWeight: 'bold', // Matches your original label styling
            },
          }}
        />
        {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
      </FormControl>
    )
  },
)
