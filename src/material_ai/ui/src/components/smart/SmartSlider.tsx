import { Slider, type SliderProps } from '@mui/material'
import { useSmartContext } from './smart.context'
import { Controller } from 'react-hook-form'

export type SmartSliderProps = SliderProps & { name: string }

export const SmartSlider = ({ name, ...props }: SmartSliderProps) => {
  const context = useSmartContext(name)
  if (!context) return <Slider name={name} {...props} />

  return (
    <Controller
      name={name}
      control={context.control}
      defaultValue={0}
      render={({ field: { onChange, value, ...fieldProps } }) => (
        <Slider
          {...props}
          {...fieldProps}
          value={typeof value === 'number' || Array.isArray(value) ? value : 0}
          onChange={(_, val) => onChange(val)}
        />
      )}
    />
  )
}
