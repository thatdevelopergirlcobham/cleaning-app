import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import { getReports } from '../api/reports';
import type { Report, ReportWithProfile } from '../api/reports';

interface UseRealtimeReportsReturn {
  reports: ReportWithProfile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addReport: (report: ReportWithProfile) => void;
  updateReport: (report: ReportWithProfile) => void;
  removeReport: (id: string) => void;
}

export const useRealtimeReports = (): UseRealtimeReportsReturn => {
  const [reports, setReports] = useState<ReportWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReports();
      setReports(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addReport = useCallback((report: ReportWithProfile) => {
    setReports(prev => [...prev, report]);
  }, []);

  const updateReport = useCallback((updatedReport: ReportWithProfile) => {
    setReports(prev =>
      prev.map(report =>
        report.id === updatedReport.id ? updatedReport : report
      )
    );
  }, []);

  const removeReport = useCallback((reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
  }, []);

  useEffect(() => {
    fetchReports();

    // Set up real-time subscription
    const subscription = supabase
      .channel('realtime-reports')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports'
        },
        (payload: { new: Report }) => {
          if (payload.new.status === 'approved') {
            addReport(payload.new as ReportWithProfile);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reports'
        },
        (payload: { new: Report }) => {
          const updatedReport = payload.new as ReportWithProfile;
          if (updatedReport.status === 'approved') {
            updateReport(updatedReport);
          } else {
            removeReport(updatedReport.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'reports'
        },
        (payload: { old: { id: string } }) => {
          removeReport(payload.old.id);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchReports, addReport, updateReport, removeReport]);

  return {
    reports,
    loading,
    error,
    refetch: fetchReports,
    addReport,
    updateReport,
    removeReport,
  };
};
