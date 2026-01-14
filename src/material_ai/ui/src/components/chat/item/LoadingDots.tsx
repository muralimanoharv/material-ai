const LoadingDots = () => {
  const animationName = 'dotSequence'

  const styles = `
    @keyframes ${animationName} {
      0%, 20% { opacity: 0; }
      21%, 80% { opacity: 1; }
      81%, 100% { opacity: 0; }
    }
  `

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  }

  const dotStyle = (delay: string) => ({
    animation: `${animationName} 2s infinite`,
    animationDelay: delay,
    opacity: 0, // Start hidden
  })

  return (
    <div style={containerStyle} aria-live="polite">
      <style>{styles}</style>
      <span>Loading</span>
      <span style={dotStyle('0s')}>.</span>
      <span style={dotStyle('0.4s')}>.</span>
      <span style={dotStyle('0.8s')}>.</span>
    </div>
  )
}

export default LoadingDots
