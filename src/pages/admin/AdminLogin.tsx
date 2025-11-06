import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const AdminLogin: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const adminEmail = import.meta.env.VITE_TEST_ADMIN_EMAIL || 'admin@cleancal.local'
  const adminPassword = import.meta.env.VITE_TEST_ADMIN_PASSWORD || 'admin123'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (email === adminEmail && password === adminPassword) {
      // Mark developer/admin access locally (for testing only)
      try {
        localStorage.setItem('dev_admin_logged_in', '1')
      } catch (err) { void err }
      navigate('/admin')
    } else {
      setError('Invalid admin email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <button className="text-sm text-gray-500 mb-4" onClick={() => navigate('/') }>
          <ArrowLeft className="inline-block w-4 h-4 mr-1" /> Back
        </button>

        <h2 className="text-xl font-semibold mb-2">Admin Login (Test)</h2>
        <p className="text-sm text-gray-500 mb-4">Use the test admin credentials to access the admin dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-between">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Sign in</button>
            <button type="button" onClick={() => { setEmail(''); setPassword(''); setError(null) }} className="text-sm text-gray-500">Clear</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
