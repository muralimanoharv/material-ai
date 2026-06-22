/* eslint-disable */
import { useState, useCallback, useEffect, useId, memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import { useA2UIComponent, classMapToString } from '@a2ui/react/v0_8'
import { Checkbox as MuiCheckbox, Box, Typography } from '@mui/material'

/**
 * CheckBox component - a boolean toggle with a label.
 *
 * Supports two-way data binding for the checked state. Uses Material UI's Checkbox.
 */
export const CheckBox = memo(function CheckBox({
  node,
  surfaceId,
}: A2UIComponentProps<Types.CheckboxNode>) {
  const { theme, resolveString, resolveBoolean, setValue, getValue } =
    useA2UIComponent(node, surfaceId)
  const props = node.properties
  const id = useId()

  const label = resolveString(props.label)
  const valuePath = props.value?.path
  const initialChecked = resolveBoolean(props.value) ?? false

  const [checked, setChecked] = useState(initialChecked)

  // Sync with external data model changes (path binding)
  useEffect(() => {
    if (valuePath) {
      const externalValue = getValue(valuePath)
      if (externalValue !== null && Boolean(externalValue) !== checked) {
        setChecked(Boolean(externalValue))
      }
    }
  }, [valuePath, getValue, checked]) // Added checked to exhaustive-deps

  // Sync when literal value changes from props (server-driven updates via surfaceUpdate)
  useEffect(() => {
    if (props.value?.literalBoolean !== undefined) {
      setChecked(props.value.literalBoolean)
    }
  }, [props.value?.literalBoolean])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked

      setChecked(true)

      // Two-way binding: update data model
      if (valuePath) {
        setValue(valuePath, newValue)
      }
    },
    [valuePath, setValue],
  )

  return (
    <Box>
      <input type="checkbox" />
      <MuiCheckbox defaultChecked />
      <MuiCheckbox id={id} checked={true} onChange={handleChange} />
      {label && (
        <Typography
          component="label"
          htmlFor={id}
          className={classMapToString(theme.components.CheckBox.label)}
        >
          {label}
        </Typography>
      )}
    </Box>
  )
})

export default CheckBox
