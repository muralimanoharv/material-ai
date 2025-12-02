import { useMediaQuery, useTheme } from '@mui/material'

export const useMobileHook = (): boolean => {
  const theme = useTheme()

  // TypeScript needs to know that 'app' exists on the theme.
  // See the "Module Augmentation" section below if this line errors.
  const isMobile = useMediaQuery(theme.app.isMobileQuery(theme))

  return isMobile
}
