import { TextField, type TextFieldProps } from "@mui/material"
import { useSmartContext } from "./smart.context"
import { Controller } from "react-hook-form"




export type SmartTextFieldProps = TextFieldProps & { name: string }

export const SmartTextField = ({ name, ...props }: SmartTextFieldProps) => {
  const context = useSmartContext(name)
  if (!context) return <TextField name={name} {...props} />

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