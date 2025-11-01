
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ReportModal from '../../components/community/ReportModal';
import { supabase } from '../../api/supabaseClient';
import { reverseGeocode } from '../../utils/geocoding';
import { MapIcon, CalendarIcon, UserCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  image_url?: string;
  location?: { lat: number; lng: number } | string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  type?: string | null;
  severity?: 'low' | 'medium' | 'high' | null;
  category?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  is_anonymous?: boolean;
  // For UI - will be populated after fetch
  locationText?: string;
}

interface FetchError extends Error {
  status?: number;
  statusText?: string;
}

const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'd MMMM, h:mm a');
  } catch {
    return dateStr;
  }
};

// const getUserInitials = (name?: string) => {
//   if (!name) return '?';
//   return name
//     .split(' ')
//     .map(part => part[0])
//     .join('')
//     .toUpperCase()
//     .slice(0, 2);
// };

const getStatusColor = (status: Report['status']) => {
  switch (status) {
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const StatusIcon = ({ status }: { status: Report['status'] }) => {
  switch (status) {
    case 'resolved':
      return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
    case 'pending':
      return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
    default:
      return null;
  }
};

const SUPABASE_URL = 'https://hajgpcqbfougojrpaprr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhamdwY3FiZm91Z29qcnBhcHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Njc1MjksImV4cCI6MjA3NjA0MzUyOX0.JcY366RLPTKNCmv19lKcKVJZE1fpTv3VeheDwXRGchY';

const HomeTau: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Apply filters and search
  useEffect(() => {
    let result = [...reports];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.locationText?.toLowerCase().includes(term) ||
        r.type?.toLowerCase().includes(term) ||
        r.category?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(r => r.status === statusFilter);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'status':
        result.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
        break;
      case 'severity':
        result.sort((a, b) => {
          const severityOrder = { high: 0, medium: 1, low: 2 };
          const aOrder = a.severity ? severityOrder[a.severity] ?? 3 : 3;
          const bOrder = b.severity ? severityOrder[b.severity] ?? 3 : 3;
          return aOrder - bOrder;
        });
        break;
      default: // 'newest'
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    setFilteredReports(result);
  }, [reports, searchTerm, statusFilter, sortBy]);

  const processLocation = useCallback(async (report: Report): Promise<Report> => {
    if (!report.location || typeof report.location === 'string') {
      return { ...report, locationText: report.location || 'No location' };
    }

    try {
      const { lat, lng } = report.location;
      const address = await reverseGeocode({ lat, lng });
      return { ...report, locationText: address };
    } catch (err) {
      console.warn('Failed to geocode location for report:', report.id, err);
      return { ...report, locationText: 'Location unavailable' };
    }
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/reports?select=*`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
          }
        );
        if (!res.ok) {
          const text = await res.text();
          const err = new Error(`Fetch failed: ${res.status} ${text}`) as FetchError;
          err.status = res.status;
          err.statusText = res.statusText;
          throw err;
        }
        const data = await res.json();
        const reportsWithLocation = await Promise.all(
          (Array.isArray(data) ? data : []).map(processLocation)
        );
        setReports(reportsWithLocation);
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('Failed to load reports:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [processLocation]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0d542b] text-white py-16 text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Keep Calabar Clean</h1>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          Help maintain the beauty of Calabar! Report waste issues, pollution spots, or environmental concerns in your community. Together, we can keep our city clean, green, and pristine.
        </p>
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-white text-[#0d542b] font-semibold py-3 px-8 rounded-lg shadow hover:bg-gray-100 transition"
        >
          Report Waste Issue
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Waste Issues (Tau)</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="resolved">Resolved</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="status">By Status</option>
              <option value="severity">By Severity</option>
            </select>
          </div>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
            <p className="text-gray-600">Loading community reports...</p>
          </div>
        ) : error ? (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error:</strong>{' '}
            <span>{error.message || 'Failed to load reports'}</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
            <p className="text-gray-500 mb-6">Be the first to report an issue in your community!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden">
                <div className="relative">
                  <img
                    src={r.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={r.title}
                    className="w-full h-48 object-cover"
                    style={{ background: '#e5e7eb' }}
                  />
                  <div className="absolute top-4 right-4">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(r.status)}`}>
                      <StatusIcon status={r.status} />
                      <span className="text-sm font-medium">{r.status}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-800 mb-2">{r.title}</h3>
                  <p className="text-gray-700 mb-4 line-clamp-2">{r.description}</p>
                  
                  <div className="space-y-3">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{r.locationText || 'No location'}</span>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{formatDate(r.created_at)}</span>
                    </div>
                    
                    {/* User */}
                    <div className="flex items-center gap-2">
                      <UserCircleIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {r.is_anonymous ? 'Anonymous User' : 'Community Member'}
                      </span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Link
                    to={`/reports/${r.id}`}
                    className="mt-4 flex items-center justify-center w-full gap-1 py-2 px-4 bg-green-800  text-white rounded-lg transition-colors"
                  >
                    <span>View Details</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={async (reportData) => {
            try {
              // Determine if submission is anonymous (no user_id or empty)
              const isAnonymous = !reportData.user_id || reportData.user_id.trim() === '';
              const reportPayload = {
                ...reportData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: 'pending' as const,
                is_anonymous: isAnonymous,
                user_id: isAnonymous ? undefined : reportData.user_id,
                location: typeof reportData.location === 'object' ? reportData.location : (reportData.location || null),
                category: reportData.category || 'other',
                priority: reportData.priority || 'medium',
                type: 'general'
              };

              // Log the payload being sent to Supabase for debugging
              console.log('HomeTau: inserting reportPayload ->', reportPayload);

              // Use supabase client so the current user's JWT is sent and RLS policies using auth.uid() work
              const { data: inserted, error } = await supabase
                .from('reports')
                .insert(reportPayload)
                .select();

              // Log raw response from Supabase for debugging
              console.log('HomeTau: supabase insert response ->', { inserted, error });

              if (error) {
                console.error('Supabase insert error:', error, 'payload:', reportPayload);
                throw error;
              }

              if (!inserted || (Array.isArray(inserted) && inserted.length === 0)) {
                console.error('HomeTau: invalid insert response', inserted);
                throw new Error('Invalid response from server');
              }

              const insertedRow = Array.isArray(inserted) ? inserted[0] : inserted;

              // Log the final inserted row shape
              console.log('HomeTau: insertedRow ->', insertedRow);

              // Add to local state so it shows instantly. Normalize locationText to a string for display.
              const isLatLng = (loc: unknown): loc is { lat: number; lng: number } => {
                return typeof loc === 'object' && loc !== null &&
                  typeof (loc as { lat?: unknown }).lat === 'number' &&
                  typeof (loc as { lng?: unknown }).lng === 'number';
              };

              const locationText = typeof reportData.location === 'string'
                ? reportData.location
                : (isLatLng(reportData.location)
                    ? `${reportData.location.lat}, ${reportData.location.lng}`
                    : String(reportData.location || ''));

              setReports(prevReports => [
                { ...insertedRow, locationText },
                ...prevReports
              ]);
              return true;
            } catch (err) {
              console.error('HomeTau: error during onSubmit ->', err);
              setError(err as Error);
              return false;
            }
          }}
        />
      )}
    </div>
  );
};

export default HomeTau;
