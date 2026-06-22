/* eslint-disable */
import { useState, useCallback, useEffect, useId, memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import { useA2UIComponent } from '@a2ui/react/v0_8'
import { TextField } from '@mui/material'

/**
 * DateTimeInput component - a date and/or time picker.
 *
 * Supports enabling date, time, or both. Uses Material UI's TextField
 * configured to render native HTML5 date/time inputs.
 */
export const DateTimeInput = memo(function DateTimeInput({
  node,
  surfaceId,
}: A2UIComponentProps<Types.DateTimeInputNode>) {
  const { resolveString, setValue, getValue } = useA2UIComponent(
    node,
    surfaceId,
  )
  const props = node.properties
  const id = useId()

  const valuePath = props.value?.path
  const initialValue = resolveString(props.value) ?? ''
  const enableDate = props.enableDate ?? true
  const enableTime = props.enableTime ?? false

  const [value, setLocalValue] = useState(initialValue)

  // Sync with external data model changes
  useEffect(() => {
    if (valuePath) {
      const externalValue = getValue(valuePath)
      if (externalValue !== null && String(externalValue) !== value) {
        setLocalValue(String(externalValue))
      }
    }
  }, [valuePath, getValue, value]) // Added value to exhaustive-deps

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)

      // Two-way binding: update data model
      if (valuePath) {
        setValue(valuePath, newValue)
      }
    },
    [valuePath, setValue],
  )

  // Determine input type based on enableDate and enableTime
  let inputType: 'date' | 'time' | 'datetime-local' = 'date'
  if (enableDate && enableTime) {
    inputType = 'datetime-local'
  } else if (enableTime && !enableDate) {
    inputType = 'time'
  }

  // Get placeholder text to match Lit renderer
  const getPlaceholderText = () => {
    if (enableDate && enableTime) {
      return 'Date & Time'
    } else if (enableTime) {
      return 'Time'
    }
    return 'Date'
  }

  return (
    <TextField
      id={id}
      type={inputType}
      value={value}
      onChange={handleChange}
      label={getPlaceholderText()}
    />
  )
})

export default DateTimeInput
