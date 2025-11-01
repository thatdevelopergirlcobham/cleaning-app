import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import ReportCard from './ReportCard';
import ReportForm, { type ReportFormData } from './ReportForm';
import LoadingSpinner from '../common/LoadingSpinner';
import type { ReportWithProfile } from '../../api/reports';

// Extended type for Report data
interface ReportData extends Omit<ReportFormData, 'location'> {
  location: { lat: number; lng: number } | null;
}

// Using imported ReportWithProfile type

export interface ReportType {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_review' | 'resolved' | 'rejected';
  image_url: string;
  location: { lat: number; lng: number } | null;
  lat?: number;
  lng?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  votes: number;
  comments_count: number;
  is_resolved: boolean;
  resolved_at: string | null;
  type: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  priority: 'low' | 'medium' | 'high';
  area?: string;
  tags: string[];
  is_anonymous?: boolean;
  resolution_status?: 'unresolved' | 'in_progress' | 'resolved' | 'reopened';
  resolved_by?: string;
  resolution_notes?: string;
  user_profiles?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  full_name?: string;
  avatar_url?: string;
}

interface FeedProps {
  reports: ReportType[];
  loading: boolean;
  error: string | null;
  onReportSubmit: (data: ReportData) => Promise<boolean>;
}

const Feed: React.FC<FeedProps> = ({
  reports = [],
  loading = false,
  error = null,
  onReportSubmit,
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleReportClick = () => {
    // For demo purposes, we'll just open the modal
    // In a real app, you'd check authentication first
    setIsReportModalOpen(true);
  };

  const handleFormSubmit = async (data: ReportData) => {
    const success = await onReportSubmit(data);
    if (success) {
      setIsReportModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsReportModalOpen(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <LoadingSpinner className="h-12 w-12 mx-auto" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gray-900">
            Community Feed
          </h1>
          <p className="text-gray-600 mt-1">
            Approved waste reports and community actions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filter Button */}
          <div className="relative">
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 text-gray-700 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Add Report Button */}
          <button
            onClick={handleReportClick}
            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            No reports yet
          </h3>
          <p className="text-gray-600 mb-4">
            Be the first to report a waste issue in your community!
          </p>
          <button
            onClick={handleReportClick}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Report First Issue
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            // Ensure the report matches the ReportWithProfile interface
              const reportWithProfile = {
              ...report,
              // Make sure required fields are present
              user_profiles: report.user_profiles || {
                id: report.user_id,
                full_name: report.user_name || 'Anonymous',
                avatar_url: report.user_avatar,
              },
              status: report.status as 'pending' | 'approved' | 'rejected' | 'resolved',
              // Ensure location is properly typed
              location: report.location || { lat: 0, lng: 0 },
              // Add any other required fields with defaults if needed
              created_at: report.created_at || new Date().toISOString(),
              updated_at: report.updated_at || new Date().toISOString(),
              // Add other required fields from Report type with defaults
              id: report.id,
              title: report.title,
              description: report.description,
              image_url: report.image_url || '',
              user_id: report.user_id || '',
              category: report.category || 'general',
              priority: report.priority || 'medium',
              // `area` is not part of the ReportWithProfile type in some schemas — avoid adding unknown props here
              type: report.type || 'general',
              severity: report.severity || 'medium',
              votes: report.votes || 0,
              comments_count: report.comments_count || 0,
              is_anonymous: report.is_anonymous || false,
              resolution_status: report.resolution_status || 'unresolved',
              resolved_at: report.resolved_at,
              resolved_by: report.resolved_by,
              resolution_notes: report.resolution_notes,
              // Add any other fields from the Report type
            } as unknown as ReportWithProfile;

            return (
              <ReportCard
                key={report.id}
                report={reportWithProfile}
                onClick={() => {
                  // In a real app, this would navigate to a detail view
                  console.log('View report:', report.id);
                }}
              />
            );
          })}
        </div>
      )}

      {/* Report Form Modal */}
      <ReportForm
        isOpen={isReportModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Feed;