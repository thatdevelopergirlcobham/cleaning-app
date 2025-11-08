import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Mail, Lock } from 'lucide-react'
import { supabase } from '../../api/supabaseClient'
// import { usersApi } from '../../api/users'

const AdminLogin: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void (async () => {
      setError(null)
      setLoading(true)
      try {
        // 1) Try custom admin credentials via RPC (admin_credentials table)
        const { data: isAdmin, error: rpcErr } = await supabase.rpc('verify_admin', {
          p_email: email,
          p_password: password,
        })
        if (rpcErr) throw rpcErr

        if (isAdmin === true) {
          try { localStorage.setItem('dev_admin_logged_in', '1') } catch { /* noop */ }
          const redirect = searchParams.get('redirect')
          navigate(redirect ? decodeURIComponent(redirect) : '/admin', { replace: true })
          return
        }

        // 2) Fallback (optional): Supabase Auth + role check in user_profiles
        // const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        // if (error) throw error
        // const authUser = data.user
        // if (!authUser) throw new Error('Authentication failed')
        // const profile = await usersApi.getUserProfile(authUser.id)
        // if (!profile || profile.role !== 'admin') throw new Error('You do not have admin access')
        // try { localStorage.setItem('dev_admin_logged_in', '1') } catch { /* noop */ }
        // const redirect = searchParams.get('redirect')
        // navigate(redirect ? decodeURIComponent(redirect) : '/admin', { replace: true })
        // return

        throw new Error('Invalid admin credentials')
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    })()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <button className="text-sm text-gray-500 mb-4" onClick={() => navigate('/') }>
          <ArrowLeft className="inline-block w-4 h-4 mr-1" /> Back
        </button>

        <h2 className="text-xl font-semibold mb-2">Admin Login</h2>
        <p className="text-sm text-gray-500 mb-4">Sign in with your admin credentials.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 pl-9"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-2.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 pl-9"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-2.5 top-3.5" />
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <button type="button" onClick={() => { setEmail(''); setPassword(''); setError(null) }} className="text-sm text-gray-500">Clear</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
