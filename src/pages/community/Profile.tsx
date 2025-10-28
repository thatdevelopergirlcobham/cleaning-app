import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Phone, Shield, Calendar, Edit, Check, X } from 'lucide-react';
import { format } from 'date-fns';

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-9 h-9 text-primary" />
          </div>
          <div className="flex-1 w-full">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+1 (___) ___-____"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-heading font-semibold text-xl text-gray-900">
                  {profile?.full_name || 'User'}
                </h2>
                <div className="flex items-center space-x-2 mt-1 text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm capitalize">
                    {profile?.role || 'user'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5 border-t border-gray-200 pt-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5">
              <Mail className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Email address</p>
              <p className="mt-0.5 text-gray-900">{user?.email}</p>
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>
          </div>

          {isEditing ? (
            <div className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5">
                <Phone className="w-5 h-5" />
              </div>
              <div className="ml-4 flex-1">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+1 (___) ___-____"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5">
                <Phone className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-0.5 text-gray-900">{profile?.phone || 'Not provided'}</p>
              </div>
            </div>
          )}

          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Member since</p>
              <p className="mt-0.5 text-gray-900">
                {user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    full_name: profile?.full_name || '',
                    phone: profile?.phone || ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <X className="w-4 h-4 mr-1 inline" /> Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Check className="w-4 h-4 mr-1 inline" /> Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Edit className="w-4 h-4 mr-1 inline" /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
