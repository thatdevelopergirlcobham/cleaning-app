import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User as UserIcon, Mail, Phone, Shield, Calendar, Edit, Check, X, Trash2, FileText, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../api/supabaseClient';
import { useToast } from '../../contexts/ToastContext';
import type { Report } from '../../api/reports';

type FormData = {
  full_name: string;
  phone: string;
};

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchUserReports();
    }
  }, [user]);

  const fetchUserReports = async () => {
    if (!user) return;
    
    setLoadingReports(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserReports(data || []);
    } catch (err) {
      console.error('Error fetching user reports:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load your reports'
      });
    } finally {
      setLoadingReports(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    setDeletingReportId(reportId);
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      setUserReports(prev => prev.filter(r => r.id !== reportId));
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Report deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting report:', err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete report'
      });
    } finally {
      setDeletingReportId(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const { success, error } = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
      });
      
      if (success) {
        setIsEditing(false);
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Profile updated successfully'
        });
      } else if (error) {
        setError(error.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    });
    setIsEditing(false);
    setError(null);
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
            <UserIcon className="w-9 h-9 text-primary" />
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

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            <p>{error}</p>
          </div>
        )}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 flex items-center"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-1 inline" /> Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 flex items-center"
                disabled={isLoading || !formData.full_name.trim()}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1 inline" /> Save Changes
                  </>
                )}
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

      {/* User Reports Section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-bold text-xl text-gray-900">My Reports</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: <span className="font-semibold text-primary">{userReports.length}</span> {userReports.length === 1 ? 'report' : 'reports'}
            </p>
          </div>
        </div>

        {loadingReports ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : userReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">You haven't submitted any reports yet.</p>
            <p className="text-sm text-gray-500 mt-1">Go to Community to report waste issues.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userReports.map((report) => (
              <div
                key={report.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    {report.category && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded mb-2">
                        {report.category}
                      </span>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(report.created_at), 'MMM d, yyyy')}
                      </span>
                      {report.location && (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          Location marked
                        </span>
                      )}
                    </div>
                  </div>
                  {report.image_url && (
                    <img
                      src={report.image_url}
                      alt={report.title}
                      className="w-20 h-20 object-cover rounded-lg ml-4"
                    />
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    disabled={deletingReportId === report.id}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  >
                    {deletingReportId === report.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
