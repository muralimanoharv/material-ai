import {
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  type SelectProps,
} from '@mui/material'
import { useSmartContext } from './smart.context'
import {
  Controller,
  type ControllerRenderProps,
  type FieldError,
  type FieldValues,
} from 'react-hook-form'
import type { ReactNode } from 'react'

export type SmartSelectProps = SelectProps & {
  name: string
  label?: string
  children?: ReactNode
}

export const SmartSelect = ({
  name,
  label,
  children,
  ...props
}: SmartSelectProps) => {
  const context = useSmartContext(name)
  const labelId = `${name}-label`

  const renderSelect = (
    field: Partial<ControllerRenderProps<FieldValues, string>> = {},
    error?: FieldError,
  ) => (
    <FormControl
      fullWidth
      variant="outlined"
      error={!!error}
      sx={{ minWidth: 120 }}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={name}
        label={label}
        {...props}
        {...field}
        value={field.value ?? ''}
      >
        {children}
      </Select>
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  )

  if (!context) return renderSelect()

  return (
    <Controller
      name={name}
      control={context.control}
      defaultValue=""
      render={({ field, fieldState: { error } }) => renderSelect(field, error)}
    />
  )
}
