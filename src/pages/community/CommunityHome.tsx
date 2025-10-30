// src/pages/community/CommunityHome.tsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../api/supabaseClient';
import ReportModal from '../../components/community/ReportModal';
import type { ReportInsert } from '../../api/reports';
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

  // Location permission is handled in ReportModal when user creates a report

  // Fetch reports from Supabase with timeout
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isLoadingRef = true;
    
    const fetchReports = async () => {
      try {
        if (!isMounted.current) return;
        
        console.log('Fetching reports from Supabase...');
        setIsLoading(true);
        setError(null);
        
        // Set up timeout
        timeoutId = setTimeout(() => {
          if (isMounted.current && isLoadingRef) {
            console.warn('Request timeout after 10 seconds');
            setError('Taking longer than expected to load. Please check your connection.');
            setIsLoading(false);
            isLoadingRef = false;
          }
        }, 5000); // 5 second timeout
        
        console.log('Attempting to fetch from Supabase...');
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        
        const { data, error: fetchError } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        console.log('Query completed. Data:', data, 'Error:', fetchError);

        if (fetchError) {
          console.error('Supabase fetch error:', fetchError);
          console.error('Error code:', fetchError.code);
          console.error('Error message:', fetchError.message);
          console.error('Error details:', fetchError.details);
          
          // If it's an RLS error, show helpful message
          if (fetchError.message?.includes('row-level security') || fetchError.code === '42501') {
            throw new Error('Database permissions not set up. Please run the SQL script in Supabase.');
          }
          
          throw fetchError;
        }
        
        if (isMounted.current) {
          clearTimeout(timeoutId);
          const reports = data as unknown as Report[];
          console.log(`Successfully fetched ${reports.length} reports`);
          setReports(reports);
          setIsLoading(false);
          isLoadingRef = false;
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching reports:', error);
        if (isMounted.current) {
          clearTimeout(timeoutId);
          setError(error.message || 'Failed to load reports. Please check your connection and try again.');
          setIsLoading(false);
          isLoadingRef = false;
        }
      }
    };

    fetchReports();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Empty dependency array - runs once on mount

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('reports')
      .on('postgres_changes', 
        { 
          event: '*',
          schema: 'public',
          table: 'reports'
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

  const handleReportSubmit = async (data: ReportInsert): Promise<boolean> => {
    try {
      console.log('Submitting report:', data);
      console.log('User ID:', data.user_id);
      setError(null);
      
      console.log('Calling Supabase insert...');
      const { data: insertedData, error: insertError } = await supabase
        .from('reports')
        .insert([data])
        .select()
        .single();

      console.log('Supabase response received');
      console.log('Insert data:', insertedData);
      console.log('Insert error:', insertError);

      if (insertError) {
        console.error('Insert error details:', insertError);
        console.error('Error code:', insertError.code);
        console.error('Error message:', insertError.message);
        throw insertError;
      }
      
      console.log('Report submitted successfully:', insertedData);
      
      // Add the new report to the list immediately
      if (insertedData) {
        setReports(prev => [insertedData as unknown as Report, ...prev]);
        console.log('Report added to list');
      }
      
      setShowReportModal(false);
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Error submitting report:', error);
      console.error('Full error object:', err);
      setError(error.message || 'Failed to submit report. Please try again.');
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
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
            <p className="text-gray-500 mb-6">Be the first to report an issue in your community!</p>
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