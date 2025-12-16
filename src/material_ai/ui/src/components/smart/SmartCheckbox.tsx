import { Checkbox, type CheckboxProps } from "@mui/material"
import { useSmartContext } from "./smart.context"
import { Controller } from "react-hook-form"



export type SmartCheckboxProps = CheckboxProps & { name: string }

export const SmartCheckbox = ({ name, ...props }: SmartCheckboxProps) => {
  const context = useSmartContext(name)
  if (!context) return <Checkbox name={name} {...props} />

  return (
    <Controller
      name={name}
      control={context.control}
      defaultValue={false}
      render={({ field: { value, ...fieldProps } }) => (
        <Checkbox
          {...props}
          {...fieldProps}
          checked={!!value}
        />
      )}
    />
  )
}