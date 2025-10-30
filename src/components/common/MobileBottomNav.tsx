import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, Users, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const MobileBottomNav: React.FC = () => {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    {
      path: user ? '/home' : '/',
      icon: Home,
      label: 'Home',
      requiresAuth: false,
    },
    {
      path: '/events',
      icon: Calendar,
      label: 'Events',
      requiresAuth: false,
    },
    {
      path: '/community',
      icon: Users,
      label: 'Community',
      requiresAuth: true,
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      requiresAuth: true,
    },
  ]

  if (!user) {
    return null
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 h-16">
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
  )
}

export default MobileBottomNav
