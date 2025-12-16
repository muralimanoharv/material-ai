import { Rating, type RatingProps } from "@mui/material"
import { useSmartContext } from "./smart.context"
import { Controller } from "react-hook-form"



export type SmartRatingProps = RatingProps & { name: string }

export const SmartRating = ({ name, ...props }: SmartRatingProps) => {
  const context = useSmartContext(name)
  if (!context) return <Rating name={name} {...props} />

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