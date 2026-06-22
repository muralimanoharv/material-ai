/* eslint-disable */
import { useCallback, useId, memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import { useA2UIComponent } from '@a2ui/react/v0_8'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from '@mui/material'

/**
 * MultipleChoice component - a selection component using a dropdown.
 *
 * Renders a Material UI Select element with options, matching the Lit renderer's behavior.
 * Supports two-way data binding for the selected value.
 */
export const MultipleChoice = memo(function MultipleChoice({
  node,
  surfaceId,
}: A2UIComponentProps<Types.MultipleChoiceNode>) {
  const { resolveString, setValue } = useA2UIComponent(node, surfaceId)
  const props = node.properties
  const id = useId()
  const labelId = `${id}-label`

  const options =
    (props.options as {
      label: { literalString?: string; path?: string }
      value: string
    }[]) ?? []
  const selectionsPath = props.selections?.path

  // Access description from props (Lit component supports it)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const description =
    resolveString((props as any).description) ?? 'Select an item'

  const handleChange = useCallback(
    (e: SelectChangeEvent<unknown>) => {
      // Two-way binding: update data model with array (matches Lit behavior)
      if (selectionsPath) {
        setValue(selectionsPath, [e.target.value as string])
      }
    },
    [selectionsPath, setValue],
  )

  return (
    <FormControl>
      <InputLabel id={labelId}>{description}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        label={description}
        onChange={handleChange}
      >
        {options.map((option) => {
          const label = resolveString(option.label)
          return (
            <MenuItem key={option.value} value={option.value}>
              {label}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
})

export default MultipleChoice
