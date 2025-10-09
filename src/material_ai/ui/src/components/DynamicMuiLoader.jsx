import { Suspense } from 'react'
import { LazyMuiComponents } from './LazyMuiComponents'

export default function DynamicMuiLoader({ componentName, ...rest }) {
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
