import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../api/supabaseClient';

export interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  image_url?: string;
  location?: { lat: number; lng: number; [key: string]: number | string | boolean | null } | string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  votes?: number;
  comments_count?: number;
  is_resolved?: boolean;
  resolved_at?: string | null;
  type?: string | null;
  severity?: 'low' | 'medium' | 'high' | null;
  area?: string | null;
  tags?: string[] | null;
  category?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  is_anonymous?: boolean;
  resolution_status?: string | null;
  resolved_by?: string | null;
  resolution_notes?: string | null;
  user_profiles?: { full_name: string; avatar_url?: string | null } | null;
}

type Props = {
  onSelect?: (r: Report) => void;
  limit?: number;
};

const RecentReports: React.FC<Props> = ({ onSelect, limit = 50 }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isLoadingRef = true;
    
    // Helper to show debug info in UI during development
    const logDebug = (msg: string) => {
      console.log('RecentReports Debug:', msg);
      setDebugInfo(prev => prev + '\n' + msg);
    };

    const fetchReports = async () => {
      try {
        if (!isMounted.current) return;
        setIsLoading(true);
        setError(null);
        setDebugInfo('');

        logDebug('Starting fetch...');

        timeoutId = setTimeout(() => {
          if (isMounted.current && isLoadingRef) {
            setError('Taking longer than expected to load reports.');
            setIsLoading(false);
            isLoadingRef = false;
          }
        }, 7000);

        // First try simple SELECT that we know works from test page
        const { data, error: fetchError } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        logDebug(`Simple select result - Data: ${data ? data.length : 0} rows, Error: ${fetchError ? 'yes' : 'no'}`);

        if (fetchError) {
          logDebug(`Fetch error: ${fetchError.message}`);
          throw new Error(fetchError.message);
        }

        // If simple select worked, try enhancing with user_profiles
        if (data && data.length > 0) {
          try {
            const enhancedData = await Promise.all(
              data.map(async (report) => {
                if (!report.user_id) return report;
                
                const { data: profile } = await supabase
                  .from('user_profiles')
                  .select('full_name, avatar_url')
                  .eq('id', report.user_id)
                  .single();
                  
                return {
                  ...report,
                  user_profiles: profile || null
                };
              })
            );
            
            logDebug('Enhanced reports with user profiles');
            
            if (isMounted.current) {
              setReports(enhancedData as Report[]);
              setIsLoading(false);
              isLoadingRef = false;
            }
          } catch (profileError) {
            logDebug(`Profile enhancement failed: ${profileError}. Using basic report data.`);
            // Fall back to basic report data if profile enhancement fails
            if (isMounted.current) {
              setReports(data as Report[]);
              setIsLoading(false);
              isLoadingRef = false;
            }
          }
        } else {
          // No data case
          if (isMounted.current) {
            setReports([]);
            setIsLoading(false);
            isLoadingRef = false;
          }
        }
      } catch (err) {
        const error = err as Error;
        console.error('RecentReports error:', error);
        if (isMounted.current) {
          clearTimeout(timeoutId);
          setError(error.message || 'Failed to load reports');
          setIsLoading(false);
          isLoadingRef = false;
        }
      }
    };

    fetchReports();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [limit]);

  // realtime subscription to keep list updated
  useEffect(() => {
    const subscription = supabase
      .channel('recent-reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' } as const, async (payload) => {
        if (!isMounted.current) return;

        try {
          if (payload.eventType === 'DELETE') {
            setReports(prev => prev.filter(r => r.id !== payload.old.id));
            return;
          }

          // For inserts/updates fetch the full report with user_profiles
          const { data: fullReport } = await supabase
            .from('reports')
            .select(`
              *,
              user_profiles ( full_name, avatar_url )
            `)
            .eq('id', payload.new.id)
            .single();

          if (!fullReport) return;

          if (payload.eventType === 'INSERT') {
            setReports(prev => [fullReport as Report, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setReports(prev => prev.map(r => (r.id === fullReport.id ? (fullReport as Report) : r)));
          }
        } catch (err) {
          console.error('RecentReports realtime handling error:', err);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
        <p className="text-gray-600">Loading community reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <div>
          <strong className="font-bold">Error:</strong>{' '}
          <span className="block sm:inline">{error}</span>
        </div>
        {debugInfo && (
          <pre className="mt-2 text-xs bg-white/50 p-2 rounded">
            {debugInfo}
          </pre>
        )}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No reports found</h3>
        <p className="text-gray-500 mb-6">Be the first to report an issue in your community!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
          onClick={() => onSelect && onSelect(report)}
        >
          <img
            src={report.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
            alt={report.title}
            className="w-full h-40 object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">{report.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{report.description}</p>
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
  );
};

export default RecentReports;
