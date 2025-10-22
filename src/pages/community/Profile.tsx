import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { User, Mail, Phone, Shield } from 'lucide-react'

const Profile: React.FC = () => {
  const { user, profile } = useAuth()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="card max-w-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-xl text-gray-900">
              {profile?.full_name || 'User'}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 capitalize">
                {profile?.role || 'user'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">{user?.email}</span>
          </div>

          {profile?.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{profile.phone}</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="btn-outline w-full">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
