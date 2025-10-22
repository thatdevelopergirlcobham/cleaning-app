import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="font-heading font-bold text-6xl text-gray-900 mb-2">404</h1>
          <h2 className="font-heading font-semibold text-2xl text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center space-x-2 btn-primary"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
