import React, { useState } from 'react'
import { useUserReports } from '../../hooks/useUserReports'
import { type CreateReportInput } from '../../api/userReportsService'
import ReportModal from './ReportModal'

/**
 * Example component demonstrating CRUD operations for user reports
 */
const UserReportsManager: React.FC = () => {
  const {
    reports,
    loading,
    error,
    refetch,
    createReport,
    updateReport,
    deleteReport,
    counts
  } = useUserReports()

  // removed inline create/edit form; using modal instead
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [formData, setFormData] = useState<CreateReportInput>({
    title: '',
    description: '',
    category: '',
    priority: 'low',
    severity: 'low',
    is_anonymous: false
  })

  /**
   * Handle form input changes
   */
  // inline form handlers removed; modal manages its own form state

  /**
   * Handle create report
   */
  const openCreateModal = () => {
    setModalMode('create')
    setEditingId(null)
    setModalOpen(true)
  }

  /**
   * Handle update report
   */
  const handleModalSubmit = async (data: {
    title: string;
    description: string;
    category: string;
    priority: string;
    image_url: string;
    location: { lat: number; lng: number; address?: string } | string;
  }) => {
    // Validate location: DB expects an object with lat/lng
    if (!data.location || typeof data.location !== 'object') {
      alert('Please select a valid location (use the search or current location).')
      return
    }

    if (modalMode === 'create') {
      await createReport({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: (data.priority as any) || 'low',
        severity: 'low',
        image_url: data.image_url,
        location: data.location,
        is_anonymous: false,
      })
    } else if (modalMode === 'edit' && editingId) {
      await updateReport(editingId, {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: (data.priority as any) || 'low',
        image_url: data.image_url,
        location: data.location,
      })
      setEditingId(null)
    }
    setModalOpen(false)
  }

  /**
   * Handle delete report
   */
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      const success = await deleteReport(id)
      
      if (success) {
        alert('Report deleted successfully!')
      }
    }
  }

  /**
   * Start editing a report
   */
  const startEdit = (report: any) => {
    setEditingId(report.id)
    setModalMode('edit')
    setFormData({
      title: report.title,
      description: report.description,
      category: report.category || '',
      priority: report.priority || 'low',
      severity: report.severity || 'low',
      image_url: report.image_url,
      location: report.location,
      is_anonymous: report.is_anonymous || false
    })
    setModalOpen(true)
  }

  if (loading && reports.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading your reports...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">My Reports</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{counts.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{counts.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{counts.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create New Report
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Create/Edit Modal */}
        {modalOpen && (
          <ReportModal
            isOpen={modalOpen}
            onClose={() => { setModalOpen(false); setEditingId(null); }}
            mode={modalMode}
            initialData={editingId ? {
              title: formData.title,
              description: formData.description,
              category: formData.category,
              priority: formData.priority,
              image_url: (formData as any).image_url,
              location: formData.location as any
            } : undefined}
            onSubmit={handleModalSubmit}
          />
        )}

        {/* Reports List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Reports</h2>
            <button
              onClick={refetch}
              className="text-blue-600 hover:text-blue-800 transition"
            >
              Refresh
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No reports yet. Create your first report!</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{report.title}</h3>
                    <p className="text-gray-600 mb-4">{report.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'approved' ? 'bg-green-100 text-green-800' :
                        report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {report.status}
                      </span>
                      
                      {report.priority && (
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          report.priority === 'high' ? 'bg-red-100 text-red-800' :
                          report.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          Priority: {report.priority}
                        </span>
                      )}
                      
                      {report.category && (
                        <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                          {report.category}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>Created: {new Date(report.created_at).toLocaleDateString()}</p>
                      <p>Votes: {report.votes} | Comments: {report.comments_count}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => startEdit(report)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default UserReportsManager
