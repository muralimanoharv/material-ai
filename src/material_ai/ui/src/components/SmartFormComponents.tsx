import { useFormContext, Controller } from 'react-hook-form'
import {
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Select,
  Switch,
  Slider,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Rating,
} from '@mui/material'

// --- Helper: Get Form Context safely ---
const useSmartContext = (name: string) => {
  const context = useFormContext()
  // If no name or no context (used outside form), return null
  if (!name || !context) return null
  return context
}

// 1. Text Field (Standard)
export const SmartTextField = ({ name, ...props }: any) => {
  const context = useSmartContext(name)
  if (!context) return <TextField {...props} />

  return (
    <Controller
      name={name}
      control={context.control}
      defaultValue=""
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...props}
          {...field}
          error={!!error}
          helperText={error ? error.message : props.helperText}
        />
      )}
    />
  )
}

// 2. Select Box (Handles Label & Error State internally)
export const SmartSelect = ({ name, label, children, ...props }: any) => {
  const context = useSmartContext(name)

  // 1. Generate a unique ID for the label link
  const labelId = `${name}-label`

  const renderSelect = (field: any = {}, error: any = null) => (
    <FormControl
      fullWidth // <--- FIX 1: Forces it to fill space
      variant="outlined"
      error={!!error}
      sx={{ minWidth: 120 }} // <--- FIX 2: Prevents it from being too tiny if empty
    >
      {/* The Label Component */}
      <InputLabel id={labelId}>{label}</InputLabel>

      {/* The Select Component */}
      <Select
        labelId={labelId}
        id={name}
        label={label} // <--- FIX 3: This specific prop creates the "cut-out" in the border!
        {...props}
        {...field}
        value={field.value ?? ''} // Ensure it's never uncontrolled
      >
        {children}
      </Select>

      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  )

  // Handle usage outside of FormProvider
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

// 3. Checkbox (Handles 'checked' prop instead of 'value')
export const SmartCheckbox = ({ name, ...props }: any) => {
  const context = useSmartContext(name)
  if (!context) return <Checkbox {...props} />

  return (
    <Controller
      name={name}
      control={context.control}
      defaultValue={false}
      render={({ field: { value, ...fieldProps } }) => (
        <Checkbox
          {...props}
          {...fieldProps}
          checked={!!value} // Map boolean value to checked
        />
      )}
    />
  )
}

// 4. Switch (Same logic as Checkbox)
export const SmartSwitch = ({ name, ...props }: any) => {
  const context = useSmartContext(name)
  if (!context) return <Switch {...props} />

  return (
    <Controller
      name={name}
      control={context.control}
      defaultValue={false}
      render={({ field: { value, ...fieldProps } }) => (
        <Switch {...props} {...fieldProps} checked={!!value} />
      )}
    />
  )
}

// 5. Radio Group (Your original logic, slightly cleaned)
export const SmartRadioGroup = ({ name, children, ...props }: any) => {
  const context = useSmartContext(name)
  if (!context)
    return (
      <RadioGroup {...props} name={name}>
        {children}
      </RadioGroup>
    )

  return (
    <Controller
      name={name}
      control={context.control}
      defaultValue=""
      render={({ field }) => (
        <RadioGroup {...props} {...field}>
          {children}
        </RadioGroup>
      )}
    />
  )
}

// 6. Slider (Needs value handling)
export const SmartSlider = ({ name, ...props }: any) => {
  const context = useSmartContext(name)
  if (!context) return <Slider {...props} />

  return (
    <Controller
      name={name}
      control={context.control}
      defaultValue={0}
      render={({ field: { onChange, value, ...fieldProps } }) => (
        <Slider
          {...props}
          {...fieldProps}
          value={typeof value === 'number' ? value : 0}
          onChange={(_, val) => onChange(val)} // Adapt MUI event signature to RHF
        />
      )}
    />
  )
}

// 7. Rating (Useful for feedback forms)
export const SmartRating = ({ name, ...props }: any) => {
  const context = useSmartContext(name)
  if (!context) return <Rating {...props} />

  return (
    <Controller
      name={name}
      control={context.control}
      defaultValue={0}
      render={({ field: { onChange, value, ...fieldProps } }) => (
        <Rating
          {...props}
          {...fieldProps}
          value={Number(value)}
          onChange={(_, val) => onChange(val)}
        />
      )}
    />
  )
}

// --- EXPORT MAP ---
export const FormComponents = {
  // Smart Inputs
  TextField: SmartTextField,
  RadioGroup: SmartRadioGroup,
  Select: SmartSelect,
  Checkbox: SmartCheckbox,
  Switch: SmartSwitch,
  Slider: SmartSlider,
  Rating: SmartRating,

  // Dumb / Helper Components (Passed through directly)
  Radio: Radio,
  FormControlLabel: FormControlLabel,
  MenuItem: MenuItem,
  FormControl: FormControl, // Usually handled inside SmartSelect, but exposed just in case
  InputLabel: InputLabel,
}
