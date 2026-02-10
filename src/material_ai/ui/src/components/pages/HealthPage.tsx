import { useContext, useEffect, useState } from 'react'
import { withLayout } from '../../hooks'
import { AppContext, type AppContextType } from '../../context'
import HealthDashboard from '../health/HealthDashboard'

function HealthPage() {
  const context = useContext(AppContext) as AppContextType
  const [health, setHealth] = useState(context.health)

  useEffect(() => {
    const updateHealth = () => {
      context.apiService
        .fetch_health()
        .then((data) => {
          setHealth(data)
        })
        .catch((err) => {
          console.error('Polling error:', err)
        })
    }

    updateHealth()

    const intervalId = setInterval(updateHealth, 10000)

    return () => clearInterval(intervalId)
  }, [context.apiService])

  if (!health) return null
  return <HealthDashboard data={health} />
}
const HealthPageWithLayout = withLayout(HealthPage, { showFooter: false })

export default HealthPageWithLayout
