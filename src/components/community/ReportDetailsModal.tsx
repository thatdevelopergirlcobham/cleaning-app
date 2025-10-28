// src/components/community/ReportDetailsModal.tsx
import React from 'react';

interface ReportDetailsModalProps {
  report: any;
  onClose: () => void;
}

const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{report.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <img
            src={report.image_url || 'https://via.placeholder.com/800x400?text=No+Image'}
            alt={report.title}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="capitalize">{report.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Severity</p>
              <p className="capitalize">{report.severity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Area</p>
              <p>{report.area || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reported On</p>
              <p>{new Date(report.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-700">{report.description}</p>
          </div>

          {report.tags && report.tags.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {report.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsModal;