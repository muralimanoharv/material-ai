import { Switch, type SwitchProps } from '@mui/material'
import { useSmartContext } from './smart.context'
import { Controller } from 'react-hook-form'

export type SmartSwitchProps = SwitchProps & { name: string }

export const SmartSwitch = ({ name, ...props }: SmartSwitchProps) => {
  const context = useSmartContext(name)
  if (!context) return <Switch name={name} {...props} />

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
