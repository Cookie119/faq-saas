import { useEffect } from 'react'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const INTERVAL_MS = 4 * 60 * 1000  // 4 minutes

export function useKeepAlive() {
  useEffect(() => {
    // ping immediately on mount so a cold-started server warms up fast
    const ping = () => {
      fetch(`${BASE}/health`, { method: 'GET' })
        .catch(() => {})  // silently ignore — we don't care about the response
    }

    ping()
    const id = setInterval(ping, INTERVAL_MS)
    return () => clearInterval(id)
  }, [])
}
