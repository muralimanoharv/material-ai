/* eslint-disable */
/* GENERATED_BY_MAI */
import React, { useContext, useEffect, useState, type MouseEvent } from 'react'
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Stack,
  useTheme,
  Grid,
  type Theme,
} from '@mui/material'
import {
  Language as LanguageIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material'
import { getI18n, setI18n } from '../../utils'
import { AppContext, type AppContextType } from '../../context'
import type { Language } from '../../schema'

const LanguageSelector: React.FC = () => {
  const { refreshConfig, config } = useContext(AppContext) as AppContextType
  const theme: Theme = useTheme()

  // State management with TypeScript types
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const languages = config.get().languages
  const language =
    languages.find((lang) => lang.code === getI18n()) || languages[0]
  const [selectedLang, setSelectedLang] = useState<Language>(language)

  useEffect(() => {
    setI18n(selectedLang.code)
    refreshConfig()
  }, [selectedLang])

  const open = Boolean(anchorEl)

  /**
   * Opens the menu
   * @param event - React Mouse Event from the button
   */
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  /**
   * Closes the menu and updates selected language
   * @param lang - The selected language object or undefined if closing without selection
   */
  const handleClose = (lang?: Language): void => {
    setAnchorEl(null)
    if (lang) {
      setSelectedLang(lang)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Grid container spacing={3} justifyContent="center">
        {/* Wrapping in the requested Grid size */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Stack direction="row" justifyContent="center" alignItems="center">
            {/* The Trigger Button */}
            <Button
              data-testid="language-selector-button"
              id="language-selector-button"
              aria-controls={open ? 'language-selector-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              variant="outlined"
              startIcon={<LanguageIcon sx={{ color: 'text.secondary' }} />}
              endIcon={<ArrowDropDownIcon sx={{ color: 'text.secondary' }} />}
              sx={{
                textTransform: 'none',
                px: 2,
                py: 1,
                borderColor: 'divider',
                color: 'text.primary',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '1rem',
                minWidth: '180px',
                justifyContent: 'space-between',
                backgroundColor: 'background.default',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Typography
                variant="body1"
                sx={{ flexGrow: 1, textAlign: 'left', ml: 1 }}
              >
                {selectedLang.label}
              </Typography>
            </Button>

            {/* The Dropdown Menu */}
            <Menu
              data-testid="language-selector-menu"
              id="language-selector-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={() => handleClose()}
              MenuListProps={{
                'aria-labelledby': 'language-selector-button',
              }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: '240px',
                    boxShadow: theme.shadows[3],
                    borderRadius: '8px',
                    border: `1px solid ${theme.palette.divider}`,
                    '& .MuiMenuItem-root': {
                      py: 1.5,
                      px: 2.5,
                      fontSize: '0.95rem',
                      '&.Mui-selected': {
                        color: 'primary.main',
                      },
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    },
                  },
                },
              }}
              transformOrigin={{ horizontal: 'left', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
              {languages.map((lang: Language) => (
                <MenuItem
                  data-testid={`language-selector-menu-item-${lang.code}`}
                  key={lang.code}
                  selected={lang.code === selectedLang.code}
                  onClick={() => handleClose(lang)}
                >
                  {lang.label}
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default LanguageSelector
