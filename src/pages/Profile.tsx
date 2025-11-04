import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Edit2, Save, X, User, Phone, Mail } from 'lucide-react';
import type { UserProfile } from '../contexts/AuthContext.types';

const Profile: React.FC = () => {
  const { profile, updateProfile, signOut } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [userReports, setUserReports] = useState<Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
  }>>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchUserReports();
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserReports = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load your reports'
      });
    } finally {
      setLoadingReports(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, error } = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        // Don't update avatar_url if it's not changed
        ...(formData.avatar_url && { avatar_url: formData.avatar_url })
      });
      
      if (!success || error) throw error || new Error('Failed to update profile');

      addToast({
        type: 'success',
        title: 'Success',
        message: 'Profile updated successfully'
      });
      setEditMode(false);
    } catch (error) {
      console.error('Profile update error:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Success',
        message: 'Report deleted successfully'
      });
      fetchUserReports();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete report'
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to sign out'
      });
    }
  };

  if (!profile) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditMode(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="inline-block w-4 h-4 mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline-block w-4 h-4 mr-1" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline-block w-4 h-4 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email || ''}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* User Reports Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Your Reports</h2>
          
          {loadingReports ? (
            <LoadingSpinner />
          ) : userReports.length === 0 ? (
            <p className="text-gray-500">You haven't submitted any reports yet.</p>
          ) : (
            <div className="space-y-4">
              {userReports.map(report => (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{report.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700 mt-2">{report.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/reports/${report.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 text-sm rounded ${
                      report.status === 'approved' ? 'bg-green-100 text-green-800' :
                      report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;