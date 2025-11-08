import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../contexts/ToastContext'

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSignUp && !fullName.trim()) {
      addToast({
        type: 'error',
        title: 'Name Required',
        message: 'Please enter your full name'
      })
      return
    }

    setLoading(true)

    try {
      // For admin accounts, force using the admin login page
      if (!isSignUp && email === import.meta.env.VITE_TEST_ADMIN_EMAIL) {
        const redirect = searchParams.get('redirect')
        navigate(redirect ? `/admin/login?redirect=${encodeURIComponent(redirect)}` : '/admin/login')
        setLoading(false)
        return
      }

      const { error } = isSignUp
        ? await signUp(email, password, fullName)
        : await signIn(email, password)

      if (error) {
        addToast({
          type: 'error',
          title: 'Authentication Failed',
          message: error.message
        })
      } else {
        addToast({
          type: 'success',
          title: 'Success',
          message: isSignUp ? 'Account created successfully!' : 'Signed in successfully!'
        })
        
        // Redirect after successful authentication
        const redirect = searchParams.get('redirect')
        setTimeout(() => {
          navigate(redirect ? decodeURIComponent(redirect) : '/home', { replace: true })
        }, 500)
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center font-heading font-bold text-3xl text-gray-900">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? 'Join the CleanCal community' : 'Welcome back to CleanCal'}
          </p>
        </div>

        {/* Tabs */}
        <div className="w-full bg-gray-100 rounded-xl p-1 flex">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${!isSignUp ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setIsSignUp(false)}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${isSignUp ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setIsSignUp(true)}
          >
            Register
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {isSignUp && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required={isSignUp}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 input-field"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 input-field"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 input-field"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : 'Need an account?'}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 text-primary hover:text-primary/80 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Auth
