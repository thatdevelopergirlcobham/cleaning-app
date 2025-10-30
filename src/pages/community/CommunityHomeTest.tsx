// TEST VERSION - Community Home
import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import ReportModal from '../../components/community/ReportModal';
import type { ReportInsert } from '../../api/reports';

interface Report {
  id: string;
  title: string;
  description: string;
  status?: string;
  image_url?: string;
  location: { lat: number; lng: number };
  category?: string;
  created_at: string;
  user_id: string;
}

const CommunityHomeTest: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Fetch reports - SIMPLIFIED VERSION
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const fetchReports = async () => {
      try {
        console.log('TEST: Fetching reports...');
        console.log('TEST: Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        setIsLoading(true);
        setError(null);
        
        // Set timeout
        timeoutId = setTimeout(() => {
          console.error('TEST: Query timeout after 5 seconds!');
          setError('Query timeout. Check RLS policies in Supabase.');
          setIsLoading(false);
        }, 5000);
        
        // Simple query without joins
        const { data, error: fetchError } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        clearTimeout(timeoutId);
        console.log('TEST: Supabase response:', { data, error: fetchError });

        if (fetchError) {
          console.error('TEST: Fetch error:', fetchError);
          console.error('TEST: Error code:', fetchError.code);
          console.error('TEST: Error message:', fetchError.message);
          
          if (fetchError.code === '42501' || fetchError.message?.includes('row-level security')) {
            throw new Error('RLS policy blocking SELECT. Run the SQL script!');
          }
          
          throw fetchError;
        }
        
        console.log(`TEST: Successfully fetched ${data?.length || 0} reports`);
        setReports(data || []);
        setIsLoading(false);
      } catch (err) {
        const error = err as Error;
        console.error('TEST: Error:', error);
        setError(error.message || 'Failed to load reports');
        setIsLoading(false);
      }
    };

    fetchReports();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleReportSubmit = async (data: ReportInsert): Promise<boolean> => {
    try {
      console.log('TEST: Submitting report:', data);
      
      const { data: insertedData, error: insertError } = await supabase
        .from('reports')
        .insert([data])
        .select()
        .single();

      if (insertError) {
        console.error('TEST: Insert error:', insertError);
        throw insertError;
      }
      
      console.log('TEST: Report submitted:', insertedData);
      
      // Add to list
      if (insertedData) {
        setReports(prev => [insertedData as Report, ...prev]);
      }
      
      setShowReportModal(false);
      return true;
    } catch (err) {
      console.error('TEST: Submit error:', err);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Community Reports (TEST)</h1>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Report Issue
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community reports...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-red-600 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Reports List */}
        {!isLoading && !error && (
          <div>
            <p className="text-gray-600 mb-4">
              Total Reports: {reports.length}
            </p>
            
            {reports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">No reports yet. Be the first to report an issue!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {report.title}
                        </h3>
                        <p className="text-gray-600 mb-3">{report.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {report.category && (
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {report.category}
                            </span>
                          )}
                          {report.status && (
                            <span className={`px-2 py-1 rounded ${
                              report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.status}
                            </span>
                          )}
                          <span>
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {report.image_url && (
                        <img
                          src={report.image_url}
                          alt={report.title}
                          className="w-24 h-24 object-cover rounded-lg ml-4"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            onSubmit={handleReportSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default CommunityHomeTest;
