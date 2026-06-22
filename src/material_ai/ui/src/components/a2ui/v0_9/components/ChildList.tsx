import React from 'react'
import { type ComponentContext, type ComponentId } from '@a2ui/web_core/v0_9'

// --- CHILD LIST RENDERER ---

type ResolvedChildRef =
  | ComponentId
  | {
      id: ComponentId
      basePath: string
    }

type ResolvedChildList = ResolvedChildRef[]

export const ChildList: React.FC<{
  childList: ResolvedChildList
  context: ComponentContext
  buildChild: (id: ComponentId, basePath?: string) => React.ReactNode
}> = ({ childList, buildChild }) => {
  if (!Array.isArray(childList)) return null

  return (
    <>
      {childList.map((childRef, index) => {
        if (typeof childRef === 'string') {
          return (
            <React.Fragment key={`${childRef}-${index}`}>
              {buildChild(childRef)}
            </React.Fragment>
          )
        }

        return (
          <React.Fragment key={`${childRef.id}-${childRef.basePath}`}>
            {buildChild(childRef.id, childRef.basePath)}
          </React.Fragment>
        )
      })}
    </>
  )
}
