import { RadioGroup, type RadioGroupProps } from '@mui/material'
import { useSmartContext } from './smart.context'
import { Controller } from 'react-hook-form'

export type SmartRadioGroupProps = RadioGroupProps & { name: string }

export const SmartRadioGroup = ({
  name,
  children,
  ...props
}: SmartRadioGroupProps) => {
  const context = useSmartContext(name)
  if (!context)
    return (
      <RadioGroup name={name} {...props}>
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
