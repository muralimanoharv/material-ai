import { useState, useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../assets/themes.js';
import { ThemeToggleContext } from '../context.jsx';

export function AppThemeProvider({ children }) {
    const [mode, setMode] = useState('system');

    const setTheme = (theme) => {
        setMode(theme)
    }

    let theme = useMemo(() => {
        if(mode == 'light') return lightTheme
        if(mode == 'dark') return darkTheme
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        return darkModeMediaQuery.matches ? darkTheme : lightTheme
    }, [mode])


    return (
        <ThemeToggleContext.Provider value={{ theme: mode, setTheme }}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeToggleContext.Provider>
    )
}