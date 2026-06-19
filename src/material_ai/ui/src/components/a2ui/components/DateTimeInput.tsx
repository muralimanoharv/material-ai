import React from 'react'
import { DateTimeInputApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import { TextField } from '@mui/material'

function normalizeDateTimeValue(
  value: string | null | undefined,
  type: string,
): string {
  if (!value) return ''

  const hasT = value.includes('T')
  const split = value.split('T')

  const datePart = (hasT ? split[0] : value)?.substring(0, 10) ?? ''
  const timePart = (hasT ? split[1] : value)?.substring(0, 5) ?? ''

  switch (type) {
    case 'date':
      return datePart
    case 'time':
      return timePart
    case 'datetime-local':
      return `${datePart}T${timePart}`
  }
  return ''
}

export const DateTimeInput = createComponentImplementation(
  DateTimeInputApi,
  ({ props }) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      props.setValue(e.target.value)
    }

    // If neither date or time are enabled, render nothing.
    if (!(props.enableDate || props.enableTime)) return null

    // Map enableDate/enableTime to input type
    let type = 'datetime-local'
    if (props.enableDate && !props.enableTime) type = 'date'
    if (!props.enableDate && props.enableTime) type = 'time'

    const normalizedValue = normalizeDateTimeValue(props.value, type)

    return (
      <TextField
        label={props.label}
        type={type}
        value={normalizedValue}
        onChange={onChange}
        variant="outlined"
        fullWidth
        InputLabelProps={{
          shrink: true, // Prevents MUI label from overlapping the native date placeholder
        }}
        inputProps={{
          min: typeof props.min === 'string' ? props.min : undefined,
          max: typeof props.max === 'string' ? props.max : undefined,
        }}
      />
    )
  },
)
