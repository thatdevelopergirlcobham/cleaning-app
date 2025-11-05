import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Users, User as UserIcon, Home } from 'lucide-react'

const Navbar: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname.startsWith(path)

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      requiresAuth: false,
    },
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
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg md:hidden">
        <div className="flex justify-around h-16">
          {navItems.map((item) => {
            if (item.requiresAuth && !user) return null

            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center justify-center transition-colors relative group ${
                  active ? 'text-primary' : 'text-gray-600 hover:text-primary'
                }`}
              >
                <div className={`p-2 rounded-full ${active ? 'bg-primary/10' : 'group-hover:bg-gray-100'}`}>
                  <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-gray-500'}`} />
                </div>
                <span className={`text-xs mt-1 font-medium ${active ? 'text-primary' : 'text-gray-600'}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute top-0 w-full h-1 bg-primary rounded-t-md" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-[#2F6B02] shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex items-center">
              {navItems.map((item, index) => {
                if (item.requiresAuth && !user) return null
                
                const Icon = item.icon
                const active = isActive(item.path)
                
                return (
                  <React.Fragment key={item.path}>
                    {index > 0 && <div className="h-6 w-px bg-white/20 mx-2" />}
                    <Link
                      to={item.path}
                      className={`relative flex items-center px-6 py-4 transition-colors group ${
                        active ? 'text-white' : 'text-white/90 hover:text-white'
                      }`}
                    >
                      <div className={`flex items-center space-x-2`}>
                        <div className={`p-1.5 rounded-md ${active ? 'bg-white/20' : 'group-hover:bg-white/10'}`}>
                          <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-white/80'}`} />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {active && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-t-md" />
                      )}
                    </Link>
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Add padding to main content to account for fixed navbar */}
      <div className="pb-16 md:pb-0" />
    </>
  )
}

export default Navbar
