import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Logout: React.FC = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const doLogout = async () => {
      try {
        await signOut()
      } catch {
        // ignore, we will still redirect
      } finally {
        navigate('/auth', { replace: true })
      }
    }
    void doLogout()
  }, [signOut, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Signing you out...</div>
    </div>
  )
}

export default Logout
