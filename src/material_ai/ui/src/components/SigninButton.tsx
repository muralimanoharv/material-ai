import { useTheme, Button } from '@mui/material'
import { HOST } from '../service/api.service'

interface SigninButtonProps {
  varient?: 'contained' | 'text' | 'outlined'
  borderRadius?: string
}

export default function SigninButton({
  varient = 'contained',
  borderRadius = '100px',
}: SigninButtonProps) {
  const theme = useTheme()

  return (
    <Button
      onClick={() => {
        window.location.href = `${HOST}/login`
      }}
      sx={
        varient === 'contained'
          ? {
              color: theme.palette.background.default,
              padding: '10px 24px',
              borderRadius,
            }
          : {
              color: theme.palette.primary.main,
              paddingLeft: 0,
              justifyContent: 'flex-start',
              transition: 'color 0.2s ease-in-out',
              '&:hover': {
                background: 'none',
                color:
                  (theme.palette.text).selected ||
                  theme.palette.text.primary,
              },
            }
      }
      disableRipple={varient === 'text'}
      variant={varient}
    >
      Sign in
    </Button>
  )
}
