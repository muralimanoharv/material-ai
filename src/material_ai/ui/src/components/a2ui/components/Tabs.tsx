import React, { useState } from 'react'
import { TabsApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import { Box, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material'

// The type of a tab is deeply nested into the TabsApi schema, and
// it seems z.infer is not inferring it correctly (?). We use `any` for now.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type _Tab = any

export const Tabs = createComponentImplementation(
  TabsApi,
  ({ props, buildChild }) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const tabs = props.tabs || []
    const activeTab = tabs[selectedIndex]

    // MUI's Tabs onChange handler passes the event and the new value
    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
      setSelectedIndex(newValue)
    }

    return (
      <Box sx={{ width: '100%' }}>
        {/* Header Container */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <MuiTabs
            value={selectedIndex}
            onChange={handleChange}
            aria-label="component tabs"
            variant="scrollable" // Good practice in case there are many tabs
            scrollButtons="auto"
          >
            {tabs.map((tab: _Tab, i: number) => (
              <MuiTab
                key={i}
                label={tab.title}
                id={`tab-${i}`}
                aria-controls={`tabpanel-${i}`}
              />
            ))}
          </MuiTabs>
        </Box>

        {/* Content Container */}
        <Box
          role="tabpanel"
          id={`tabpanel-${selectedIndex}`}
          aria-labelledby={`tab-${selectedIndex}`}
          sx={{ px: 2 }} // px: 2 represents 16px horizontal padding, replacing your custom content padding
        >
          {activeTab ? buildChild(activeTab.child) : null}
        </Box>
      </Box>
    )
  },
)
