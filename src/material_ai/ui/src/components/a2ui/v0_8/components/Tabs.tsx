import { useState, useCallback, memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import {
  useA2UIComponent,
  classMapToString,
  stylesToObject,
  ComponentNode,
} from '@a2ui/react/v0_8'
import { Tabs as MuiTabs, Tab as MuiTab, Box } from '@mui/material'

/**
 * Tabs component - displays content in switchable tabs.
 *
 * Uses Material UI's Tabs and Tab components.
 */
export const Tabs = memo(function Tabs({
  node,
  surfaceId,
}: A2UIComponentProps<Types.TabsNode>) {
  const { theme, resolveString } = useA2UIComponent(node, surfaceId)
  const props = node.properties

  const [selectedIndex, setSelectedIndex] = useState(0)

  const tabItems = props.tabItems ?? []

  const handleChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setSelectedIndex(newValue)
    },
    [],
  )

  // Apply --weight CSS variable on root div (:host equivalent) for flex layouts
  const hostStyle: React.CSSProperties =
    node.weight !== undefined
      ? ({ '--weight': node.weight } as React.CSSProperties)
      : {}

  return (
    <div className="a2ui-tabs" style={hostStyle}>
      <Box
        className={classMapToString(theme.components.Tabs.container)}
        style={stylesToObject(theme.additionalStyles?.Tabs)}
      >
        {/* Tab buttons - uses Tabs.element for the container */}
        <MuiTabs
          value={selectedIndex}
          onChange={handleChange}
          className={classMapToString(theme.components.Tabs.element)}
        >
          {tabItems.map((tab, index) => {
            const title = resolveString(tab.title)
            const isSelected = index === selectedIndex

            // Convert map objects to strings first, then concatenate if selected
            const allClasses = classMapToString(
              theme.components.Tabs.controls.all,
            )
            const selectedClasses = classMapToString(
              theme.components.Tabs.controls.selected,
            )
            const combinedClasses = isSelected
              ? `${allClasses} ${selectedClasses}`.trim()
              : allClasses

            return (
              <MuiTab key={index} label={title} className={combinedClasses} />
            )
          })}
        </MuiTabs>

        {/* Tab content */}
        {tabItems[selectedIndex] && (
          <ComponentNode
            node={tabItems[selectedIndex].child}
            surfaceId={surfaceId}
          />
        )}
      </Box>
    </div>
  )
})

export default Tabs
