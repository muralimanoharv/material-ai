import {
  useFormContext,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form'

export const useSmartContext = (
  name: string,
): UseFormReturn<FieldValues> | null => {
  const context = useFormContext<FieldValues>()
  if (!name || !context) return null
  return context
}
