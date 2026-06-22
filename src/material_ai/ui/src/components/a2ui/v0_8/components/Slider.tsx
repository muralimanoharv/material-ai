/* eslint-disable */
import { useState, useCallback, useEffect, useId, memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import {
  useA2UIComponent,
  classMapToString,
  stylesToObject,
} from '@a2ui/react/v0_8'
import { Slider as MuiSlider, Box, Typography } from '@mui/material'

/**
 * Slider component - a numeric value selector with a range.
 *
 * Supports two-way data binding for the value. Uses Material UI's Slider component.
 */
export const Slider = memo(function Slider({
  node,
  surfaceId,
}: A2UIComponentProps<Types.SliderNode>) {
  const { theme, resolveNumber, resolveString, setValue, getValue } =
    useA2UIComponent(node, surfaceId)
  const props = node.properties
  const id = useId()

  const valuePath = props.value?.path
  const initialValue = resolveNumber(props.value) ?? 0
  // Match Lit's default values (minValue=0, maxValue=0)
  const minValue = props.minValue ?? 0
  const maxValue = props.maxValue ?? 0

  const [value, setLocalValue] = useState(initialValue)

  // Sync with external data model changes (path binding)
  useEffect(() => {
    if (valuePath) {
      const externalValue = getValue(valuePath)
      if (externalValue !== null && Number(externalValue) !== value) {
        setLocalValue(Number(externalValue))
      }
    }
  }, [valuePath, getValue, value]) // Added value to exhaustive-deps

  // Sync when literal value changes from props (server-driven updates via surfaceUpdate)
  useEffect(() => {
    if (props.value?.literalNumber !== undefined) {
      setLocalValue(props.value.literalNumber)
    }
  }, [props.value?.literalNumber])

  const handleChange = useCallback(
    (_: Event, newValue: number | number[]) => {
      // MUI Slider passes the new value as the second argument
      const val = newValue as number
      setLocalValue(val)

      // Two-way binding: update data model
      if (valuePath) {
        setValue(valuePath, val)
      }
    },
    [valuePath, setValue],
  )

  // Access label from props if it exists (Lit component supports it but type doesn't define it)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labelValue = (props as any).label
  const label = labelValue ? resolveString(labelValue) : ''

  // Structure mirrors Lit's Slider component using MUI equivalents:
  //   <div class="a2ui-slider">      ← :host equivalent
  //     <Box class="...">            ← internal element container
  //       <Typography component="label">...</Typography>
  //       <MuiSlider>...</MuiSlider>
  //       <Typography component="span">value</Typography>
  //     </Box>
  //   </div>

  // Apply --weight CSS variable on root div (:host equivalent) for flex layouts
  const hostStyle: React.CSSProperties =
    node.weight !== undefined
      ? ({ '--weight': node.weight } as React.CSSProperties)
      : {}

  return (
    <div className="a2ui-slider" style={hostStyle}>
      <Box className={classMapToString(theme.components.Slider.container)}>
        {label && (
          <Typography
            component="label"
            htmlFor={id}
            className={classMapToString(theme.components.Slider.label)}
          >
            {label}
          </Typography>
        )}
        <MuiSlider
          id={id}
          name="data"
          value={value}
          min={minValue}
          max={maxValue}
          onChange={handleChange}
          className={classMapToString(theme.components.Slider.element)}
          style={stylesToObject(theme.additionalStyles?.Slider)}
        />
        <Typography
          component="span"
          className={classMapToString(theme.components.Slider.label)}
        >
          {value}
        </Typography>
      </Box>
    </div>
  )
})

export default Slider
