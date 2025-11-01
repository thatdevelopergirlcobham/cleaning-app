import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';

interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  image_url?: string;
  created_at: string;
  status: string;
  user_id: string;
}

interface ReportCardNewProps {
  report: Report;
}

const ReportCardNew: React.FC<ReportCardNewProps> = ({ report }) => {
  const getTimeAgo = (timestamp: string) => {
    return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
      <Link to={`/waste-detail/${report.id}`} className="block">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {report.title || 'Untitled Report'}
            </h3>
            <p className="text-gray-600 text-sm mb-2">{report.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-3">📍 {report.location || 'Location not specified'}</span>
              <span>🕒 {getTimeAgo(report.created_at)}</span>
            </div>
          </div>
          {report.image_url && (
            <div className="ml-4">
              <img 
                src={report.image_url} 
                alt="Report" 
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center">
          <span className={`px-2 py-1 rounded-full text-xs ${
            report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {report.status?.toUpperCase() || 'PENDING'}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default ReportCardNew;