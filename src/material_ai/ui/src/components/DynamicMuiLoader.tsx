import React, { Suspense } from 'react'
import { LazyMuiComponents } from './LazyMuiComponents'
import { CircularProgress } from '@mui/material' // Optional: for loading state

// 1. Enhanced Interface
export interface UINode {
  componentName: string
  // Children can be an array, a single node (common LLM quirk), or a string
  children?: UINode[] | UINode | string
  style?: React.CSSProperties
  [key: string]: any
}

// --- Dependency: ensure you have the prop resolver from previous steps ---
const resolveProps = (props: Record<string, any>): Record<string, any> => {
  const processed: Record<string, any> = {}

  // Helper to detect UI Nodes
  const isUINode = (value: any) =>
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value.componentName

  Object.entries(props).forEach(([key, value]) => {
    if (isUINode(value)) {
      processed[key] = renderDynamicUI(value)
    } else {
      processed[key] = value
    }
  })

  return processed
}

// Helper to check if a component is React.lazy
const isLazyComponent = (component: any): boolean => {
  return (
    component &&
    typeof component === 'object' &&
    component.$$typeof === Symbol.for('react.lazy')
  )
}

export const renderDynamicUI = (
  node: UINode,
  index: number = 0,
): React.ReactNode => {
  // 1. Safety Checks
  if (!node || !node.componentName) return null

  const Component = LazyMuiComponents[node.componentName]
  if (!Component) {
    console.warn(`Component not found in LazyMap: ${node.componentName}`)
    return null
  }

  // 2. Handle Children (Normalize to Array, render recursively)
  let children: React.ReactNode = null

  if (node.children) {
    if (Array.isArray(node.children)) {
      children = node.children.map((child, i) =>
        typeof child === 'string' ? child : renderDynamicUI(child, i),
      )
    } else if (typeof node.children === 'object') {
      children = renderDynamicUI(node.children as UINode)
    } else {
      children = node.children
    }
  }

  // 3. Extract and Resolve Props
  const { componentName, children: _, ...rawProps } = node

  // Note: Ensure you have your 'resolveProps' function available here
  // (from previous steps) to handle nested components in props.
  const resolvedProps = resolveProps(rawProps)

  // 4. Determine Render Strategy
  const isLazy = isLazyComponent(Component)

  // STRATEGY A: Static Component (Radio, Checkbox, Icon)
  // We MUST render these directly so parent components (like FormControlLabel)
  // can clone them and inject props (checked, value, name) successfully.
  if (!isLazy) {
    return (
      <Component key={index} {...resolvedProps}>
        {children}
      </Component>
    )
  }

  // STRATEGY B: Lazy Component (Grid, Card, Accordion)
  // These require Suspense because their code is being fetched over the network.
  return (
    <Suspense key={index} fallback={<CircularProgress size={20} />}>
      <Component {...resolvedProps}>{children}</Component>
    </Suspense>
  )
}
