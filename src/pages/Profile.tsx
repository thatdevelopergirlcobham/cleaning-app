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
      const { success, error } = await updateProfile(formData);
      if (!success || error) throw error;

      addToast({
        type: 'success',
        title: 'Success',
        message: 'Profile updated successfully'
      });
      setEditMode(false);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update profile'
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Profile</h1>
            {editMode ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      full_name: profile.full_name,
                      phone: profile.phone || '',
                    });
                  }}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-1 text-green-600 hover:text-green-800"
                >
                  <Save size={18} />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Edit2 size={18} />
                <span>Edit</span>
              </button>
            )}
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