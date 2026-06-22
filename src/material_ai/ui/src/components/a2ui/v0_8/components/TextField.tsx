/* eslint-disable */
import { useState, useCallback, useEffect, useId, memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import { useA2UIComponent } from '@a2ui/react/v0_8'
import { TextField as MuiTextField } from '@mui/material'

type TextFieldType = 'shortText' | 'longText' | 'number' | 'date'

/**
 * TextField component - an input field for text entry.
 *
 * Supports various input types and two-way data binding. Uses Material UI's TextField.
 */
export const TextField = memo(function TextField({
  node,
  surfaceId,
}: A2UIComponentProps<Types.TextFieldNode>) {
  const { resolveString, setValue, getValue } = useA2UIComponent(
    node,
    surfaceId,
  )
  const props = node.properties
  const id = useId()

  const label = resolveString(props.label)
  const textPath = props.text?.path
  const initialValue = resolveString(props.text) ?? ''
  const propsRecord = props as Record<string, unknown>
  const fieldType = (propsRecord.textFieldType ||
    propsRecord.type) as TextFieldType
  const validationRegexp = props.validationRegexp

  const [value, setLocalValue] = useState(initialValue)
  // Validation state tracked for error styling
  const [_isValid, setIsValid] = useState(true)

  // Sync with external data model changes
  useEffect(() => {
    if (textPath) {
      const externalValue = getValue(textPath)
      if (externalValue !== null && String(externalValue) !== value) {
        setLocalValue(String(externalValue))
      }
    }
  }, [textPath, getValue, value]) // Added value to exhaustive-deps

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)

      // Validate if pattern provided
      if (validationRegexp) {
        setIsValid(new RegExp(validationRegexp).test(newValue))
      }

      // Two-way binding: update data model
      if (textPath) {
        setValue(textPath, newValue)
      }
    },
    [validationRegexp, textPath, setValue],
  )

  const inputType =
    fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text'
  const isTextArea = fieldType === 'longText'

  return (
    <MuiTextField
      id={id}
      label={label}
      type={inputType}
      multiline={isTextArea}
      value={value}
      onChange={handleChange}
      placeholder="Please enter a value"
      error={!_isValid} // Leverage MUI's built-in error styling
    />
  )
})

export default TextField
