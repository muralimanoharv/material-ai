import { Box, CircularProgress } from '@mui/material'

function LoadingIndicator() {
  const GradientSVG = () => (
    <svg width={0} height={0}>
      <linearGradient id="linearColors" x1={0} y1={0} x2={1} y2={1}>
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="25%" stopColor="#34A853" />
        <stop offset="50%" stopColor="#FBBC05" />
        <stop offset="75%" stopColor="#EA4335" />
        <stop offset="100%" stopColor="#4285F4" />
      </linearGradient>
    </svg>
  )
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <GradientSVG />
      <CircularProgress
        variant="indeterminate"
        size={30}
        sx={{
          '& .MuiCircularProgress-circle': {
            stroke: 'url(#linearColors)',
          },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/gemini.svg"
          alt="Loading icon"
          style={{ width: '50%', height: '50%', borderRadius: '50%' }}
        />
      </Box>
    </Box>
  )
}

export default LoadingIndicator
