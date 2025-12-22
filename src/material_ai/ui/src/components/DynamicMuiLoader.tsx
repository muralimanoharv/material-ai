import React, { Suspense, type ReactNode, type ElementType } from 'react'
import { LazyMuiComponents } from './LazyMuiComponents'
import { CircularProgress } from '@mui/material'

export interface UINode {
  componentName: string
  children?: UINode[] | UINode | string
  style?: React.CSSProperties
  [key: string]: unknown
}

const isUINode = (value: unknown): value is UINode => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'componentName' in value
  )
}

const resolveProps = (
  props: Record<string, unknown>,
): Record<string, unknown> => {
  const processed: Record<string, unknown> = {}

  Object.entries(props).forEach(([key, value]) => {
    if (isUINode(value)) {
      processed[key] = renderDynamicUI(value)
    } else {
      processed[key] = value
    }
  })

  return processed
}

const isLazyComponent = (component: ElementType): boolean => {
  return (
    typeof component === 'object' &&
    component !== null &&
    '$$typeof' in component &&
    (component as { $$typeof: symbol }).$$typeof === Symbol.for('react.lazy')
  )
}

export const renderDynamicUI = (node: UINode, index: number = 0): ReactNode => {
  if (!node || !node.componentName) return null

  const Component = (LazyMuiComponents as Record<string, ElementType>)[
    node.componentName
  ]

  if (!Component) {
    return null
  }

  let children: ReactNode = null

  if (node.children) {
    if (Array.isArray(node.children)) {
      children = node.children.map((child, i) =>
        typeof child === 'string' ? child : renderDynamicUI(child, i),
      )
    } else if (isUINode(node.children)) {
      children = renderDynamicUI(node.children)
    } else {
      children = node.children as ReactNode
    }
  }

  const { ...rawProps } = node
  const resolvedProps = resolveProps(rawProps)

  if (!isLazyComponent(Component)) {
    return (
      <Component key={index} {...resolvedProps}>
        {children}
      </Component>
    )
  }

  return (
    <Suspense key={index} fallback={<CircularProgress size={20} />}>
      <Component {...resolvedProps}>{children}</Component>
    </Suspense>
  )
}
