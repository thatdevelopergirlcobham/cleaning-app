import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Users, User as UserIcon } from 'lucide-react'

const Navbar: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    {
      path: '/hire-cleaners',
      icon: Users,
      label: 'Hire Cleaners',
      requiresAuth: false,
    },
    {
      path: '/reports-map',
      icon: UserIcon,
      label: 'Reports',
      requiresAuth: true,
    }
  ]

  if (!user) {
    return null
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="grid grid-cols-2 h-16">
          {navItems.map((item) => {
            if (item.requiresAuth && !user) return null

            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive(item.path) ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-[#2F6B02] py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-12">
            {navItems.map((item) => {
              if (item.requiresAuth && !user) return null
              
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 transition-colors ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive(item.path) ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
