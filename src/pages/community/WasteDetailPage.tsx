import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDistance } from 'date-fns';

interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  image_url?: string;
  created_at: string;
  status: string;
  severity?: 'low' | 'medium' | 'high' | 'urgent';
  waste_type?: string;
  user_id: string;
  updated_at?: string;
};

const WasteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Report not found');

        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch report details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReportDetail();
    }
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-2 text-sm underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
      >
        ← Back
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {report.title || 'Untitled Report'}
          </h1>
          <span className={`px-3 py-1 rounded-full text-sm ${
            report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {report.status?.toUpperCase() || 'PENDING'}
          </span>
        </div>

        {report.image_url && (
          <div className="mb-6">
            <img 
              src={report.image_url} 
              alt="Report" 
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Description</h2>
            <p className="text-gray-600 mt-1">{report.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700">Location</h2>
            <p className="text-gray-600 mt-1">{report.location || 'Location not specified'}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700">Additional Details</h2>
            <div className="mt-2 space-y-2 text-gray-600">
              <p>Reported: {formatDistance(new Date(report.created_at), new Date(), { addSuffix: true })}</p>
              {report.severity && (
                <p>Severity: {report.severity}</p>
              )}
              {report.waste_type && (
                <p>Waste Type: {report.waste_type}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteDetailPage;