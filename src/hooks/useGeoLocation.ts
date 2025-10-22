import { useState, useEffect } from 'react'

interface Location {
  lat: number
  lng: number
}

interface UseGeolocationReturn {
  location: Location | null
  error: string | null
  loading: boolean
  requestLocation: () => void
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        let errorMessage = 'Unable to retrieve your location'

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable'
            break
          case err.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }

        setError(errorMessage)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    )
  }

  // Auto-request location on mount (optional)
  useEffect(() => {
    requestLocation()
  }, [])

  return {
    location,
    error,
    loading,
    requestLocation,
  }
}
