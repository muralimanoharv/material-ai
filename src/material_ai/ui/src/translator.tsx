import React from 'react'
import DynamicMuiLoader from './components/DynamicMuiLoader'

// 1. Define the shape of your component object
// This handles the recursive nature (children can contain more objects or strings)
export interface ComponentDefinition {
  componentName: string
  props?: Record<string, any> // using 'any' for props is common in dynamic builders
  children?: (ComponentDefinition | string)[]
}

export const INPUT_JSON: ComponentDefinition = {
  componentName: 'Box',
  children: [
    {
      componentName: 'Button',
      props: {
        variant: 'contained',
        style: {
          width: '1000px',
        },
      },
      children: ['Submit'],
    },
  ],
}

// 2. Type the argument as the Interface OR string, and return ReactNode
export function translate(
  component: ComponentDefinition | string,
): React.ReactNode {
  // Base case: Text node
  if (typeof component === 'string') {
    return <>{component}</>
  }

  // Recursive step
  const children = component.children || []
  const translated_children: React.ReactNode[] = []

  for (const child of children) {
    translated_children.push(translate(child))
  }

  // Note: Using componentName as a key is risky if you have siblings
  // with the same name. Consider using a unique ID in your JSON.
  const key = component.componentName

  return (
    <DynamicMuiLoader
      key={key}
      componentName={key}
      {...component.props}
      children={translated_children}
    />
  )
}
