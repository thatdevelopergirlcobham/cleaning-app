import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useUI } from '../../contexts/UIContext'
import { useNotifications } from '../../hooks/useNotifications'
import { Menu, X, User, LogOut, Settings, Bell } from 'lucide-react'
import NotificationCenter from './NotificationCenter'

const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const { isMobileMenuOpen, toggleMobileMenu } = useUI()
  const { unreadCount } = useNotifications()
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      <nav className=" sticky top-5 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 p-7 bg-[#2F6B02] rounded-2xl max-w-6xl mx-auto">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              
              <span className="font-heading font-semibold text-xl text-white">CleanCal</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to={user ? "/home" : "/"}
                className={`font-medium transition-colors ${
                  isActive(user ? "/home" : "/") ? ' text-white' : ' text-white hover:text-primary'
                }`}
              >
                Home
              </Link>
              <Link
                to="/hire-cleaners"
                className={`font-medium transition-colors ${
                  isActive('/hire-cleaners') ? 'text-primary' : ' text-white hover:text-primary'
                }`}
              >
                Hire Cleaners
              </Link>
              <Link
                to="/reports-map"
                className={`font-medium transition-colors ${
                  isActive('/reports-map') ? 'text-primary' : ' text-white hover:text-primary'
                }`}
              >
                Reports Map
              </Link>
              <Link
                to="/upscale"
                className={`font-medium transition-colors ${
                  isActive('/upscale') ? 'text-primary' : ' text-white hover:text-primary'
                }`}
              >
                Upscale
              </Link>
              <Link
                to="/about"
                className={`font-medium transition-colors ${
                  isActive('/about') ? 'text-primary' : ' text-white hover:text-primary'
                }`}
              >
                About
              </Link>
            </div>

            {/* User Menu / Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notification Bell */}
                  <button
                    onClick={() => setIsNotificationCenterOpen(true)}
                    className="relative p-2  text-white hover:text-primary transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-primary">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{profile?.full_name || 'User'}</span>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-md border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-error w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center ">
                  {/* <Link to="/auth" className="btn-outline">
                    Sign In
                  </Link> */}
                  <Link to="/auth?mode=signup" className="btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <Link
              to={user ? "/home" : "/"}
              className={`block font-medium transition-colors ${
                isActive(user ? "/home" : "/") ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`block font-medium transition-colors ${
                isActive('/events') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
              onClick={toggleMobileMenu}
            >
              Events
            </Link>
            <Link
              to="/hire-cleaners"
              className={`block font-medium transition-colors ${
                isActive('/hire-cleaners') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
              onClick={toggleMobileMenu}
            >
              Hire Cleaners
            </Link>
            <Link
              to="/reports-map"
              className={`block font-medium transition-colors ${
                isActive('/reports-map') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
              onClick={toggleMobileMenu}
            >
              Reports Map
            </Link>
            <Link
              to="/upscale"
              className={`block font-medium transition-colors ${
                isActive('/upscale') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
              onClick={toggleMobileMenu}
            >
              Upscale
            </Link>
            <Link
              to="/about"
              className={`block font-medium transition-colors ${
                isActive('/about') ? 'text-primary' : 'text-gray-600 hover:text-primary'
              }`}
              onClick={toggleMobileMenu}
            >
              About
            </Link>

            {user ? (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center space-x-2 py-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{profile?.full_name || 'User'}</span>
                </div>
                <Link
                  to="/profile"
                  className="block text-gray-600 hover:text-primary py-2"
                  onClick={toggleMobileMenu}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block text-gray-600 hover:text-primary py-2"
                  onClick={toggleMobileMenu}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    toggleMobileMenu()
                  }}
                  className="block text-error hover:text-error/80 py-2 w-full text-left"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  to="/auth"
                  className="block btn-outline text-center"
                  onClick={toggleMobileMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="block btn-primary text-center"
                  onClick={toggleMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </>
  )
}

export default Navbar
