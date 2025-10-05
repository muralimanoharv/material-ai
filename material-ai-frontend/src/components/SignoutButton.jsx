import { Button } from '@mui/material'
import { sign_out, UNAUTHORIZED } from '../api'
import { useContext } from 'react'
import { AppContext } from '../context'
import { config } from '../assets/config'

export default function SignoutButton() {
  const context = useContext(AppContext)
  const { setUser, setSnack } = context
  return (
    <Button
      onClick={async () => {
        try {
          await sign_out()
          setUser()
        } catch (e) {
          if (e.name == UNAUTHORIZED) return
          console.error(e)
          setSnack(config.errorMessage)
        }
      }}
      color="default"
      variant="contained"
      sx={{ padding: '10px 24px' }}
    >
      Sign out
    </Button>
  )
}
