


import { useMediaQuery, useTheme } from '@mui/material';


export const useMobileHook = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.app.isMobileQuery(theme)); 

  return isMobile;
};