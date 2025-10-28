// src/pages/community/CommunityHome.tsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../api/supabaseClient';
import ReportModal from '../../components/community/ReportModal';
import type { ReportSubmitData } from '../../components/community/ReportModal';
import ReportDetailsModal from '../../components/community/ReportDetailsModal';

interface Report {
  id: string;
  title: string;
  description: string;
  status?: 'pending' | 'approved' | 'rejected' | 'resolved';
  image_url?: string;
  location: { lat: number; lng: number };
  area?: string;
  severity?: 'low' | 'medium' | 'high' | 'urgent';
  user_id: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  votes?: number;
  comments_count?: number;
  is_resolved?: boolean;
  resolved_at?: string | null;
  // These fields come from the join with user_profiles
  user_profiles?: {
    full_name: string;
    avatar_url?: string | null;
  } | null;
}

const CommunityHome: React.FC = () => {
  // State management
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isMounted = useRef(true);

  // Cleanup function
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch reports from Supabase with timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isMounted.current && isLoading) {
        setError('Taking longer than expected to load. Please check your connection.');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('reports')
          .select(`
            *,
            user_profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (isMounted.current) {
          // Type assertion since we know the shape matches our Report interface
          const reports = data as unknown as Report[];
          setReports(reports);
          if (reports.length === 0) {
            setError('No reports found. Be the first to report an issue!');
          }
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        if (isMounted.current) {
          setError('Failed to load reports. Please check your connection and try again.');
        }
      } finally {
        if (isMounted.current) {
          clearTimeout(timeoutId);
          setIsLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading]);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('reports')
      .on('postgres_changes', 
        { 
          event: '*',
          schema: 'public',
          table: 'reports',
          filter: 'status=eq.approved'
        } as const, 
        (payload) => {
          if (!isMounted.current) return;

          if (payload.eventType === 'INSERT') {
            setReports(prev => [payload.new as unknown as Report, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setReports(prev => 
              prev.map(r => r.id === payload.new.id ? (payload.new as unknown as Report) : r)
            );
          } else if (payload.eventType === 'DELETE') {
            setReports(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter reports based on search query
  const filteredReports = reports.filter((report) => {
    const query = searchQuery.toLowerCase();
    return (
      report.title.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query) ||
      (report.category && report.category.toLowerCase().includes(query))
    );
  });

  const handleReportSubmit = async (data: ReportSubmitData): Promise<boolean> => {
    try {
      setError(null);
      const reportData = {
        ...data,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        votes: 0,
        comments_count: 0,
        is_resolved: false
      };
      
      const { error } = await supabase
        .from('reports')
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;
      
      setShowReportModal(false);
      return true;
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
        />
      )}
      
      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
      {/* Hero Section */}
      <div className="bg-[#0d542b] text-white py-16 text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Report an Issue in Your Community</h1>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          Spot waste or pollution? Let's keep Calabar clean together. Submit a report and
          make a difference.
        </p>
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-white text-[#0d542b] font-semibold py-3 px-8 rounded-lg shadow hover:bg-gray-100 transition"
        >
          Report Issue
        </button>
      </div>

      {/* Search Bar */}
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <input
            type="text"
            placeholder="Search waste reports..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-600 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Reports Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {error && reports.length > 0 && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {error} Some reports may not be visible.
                </p>
              </div>
            </div>
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Waste Issues</h2>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error:</strong>{' '}
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
            <p className="text-gray-600">Loading community reports...</p>
          </div>
        ) : error && reports.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
            <p className="text-gray-500 mb-6">{error || 'Be the first to report an issue in your community!'}</p>
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Report an Issue
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <img
                  src={report.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={report.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {report.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{report.area}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      report.severity === 'high' ? 'bg-red-100 text-red-800' :
                      report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
      />

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};

export default CommunityHome;