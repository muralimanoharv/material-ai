import { useTheme } from "@emotion/react"
import { Button } from "@mui/material"
import { HOST } from "../assets/config"

export default function SigninButton({varient = 'contained', borderRadius = '100px'}) {
    const theme = useTheme()
    return <Button
        onClick={() => {
            window.location.href = `${HOST}/login`
        }}
        sx={varient == 'contained' ? {
            color: theme.palette.background.default,
            padding: '10px 24px',
            borderRadius
        } : {
            color: theme.palette.primary.main,
            paddingLeft: 0,
            justifyContent: 'flex-start',
            transition: 'color 0.2s ease-in-out',
            '&:hover': {
                background: 'none',
                color: theme.palette.text.selected
            }
        }}
        disableRipple={varient == 'text'}
        variant={varient}>
        Sign in
    </Button>
}