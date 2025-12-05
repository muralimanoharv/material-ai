import { Suspense } from 'react'
import { LazyMuiComponents } from './LazyMuiComponents'

// 1. Define Props Interface
interface DynamicMuiLoaderProps {
  // We use 'string' here to match the JSON input, though you could use
  // keyof typeof LazyMuiComponents if you wanted strict compile-time checks.
  componentName: string

  // Allow any other props to pass through to the underlying MUI component
  [key: string]: any
}

export default function DynamicMuiLoader({
  componentName,
  ...rest
}: DynamicMuiLoaderProps) {
  // Access the map. Since LazyMuiComponents was typed as Record<string, ...>
  // in the previous step, this access is type-safe.
  const LazyComponent = LazyMuiComponents[componentName]

  if (!LazyComponent) {
    // Fallback if the requested component name is not in the map
    return <div>Component "{componentName}" not found.</div>
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent {...rest} />
    </Suspense>
  )
}
