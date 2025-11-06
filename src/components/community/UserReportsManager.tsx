import React, { useState } from 'react'
import { useUserReports } from '../../hooks/useUserReports'
import { type CreateReportInput } from '../../api/userReportsService'
import LocationAutocomplete from '../common/LocationAutocomplete'

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

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
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
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  /**
   * Handle create report
   */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = await createReport(formData)
    
    if (result) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'low',
        severity: 'low',
        is_anonymous: false
      })
      setIsCreating(false)
      alert('Report created successfully!')
    }
  }

  /**
   * Handle update report
   */
  const handleUpdate = async (id: string) => {
    const result = await updateReport(id, {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      severity: formData.severity
    })
    
    if (result) {
      setEditingId(null)
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'low',
        severity: 'low',
        is_anonymous: false
      })
      alert('Report updated successfully!')
    }
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
    setFormData({
      title: report.title,
      description: report.description,
      category: report.category || '',
      priority: report.priority || 'low',
      severity: report.severity || 'low',
      is_anonymous: report.is_anonymous || false
    })
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
            onClick={() => setIsCreating(!isCreating)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {isCreating ? 'Cancel' : 'Create New Report'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Report' : 'Create New Report'}
            </h2>
            
            <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(editingId); } : handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Report title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the issue..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Waste, Infrastructure"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Severity</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <LocationAutocomplete
                    value={formData.location?.address || ''}
                    onChange={(location) => {
                      setFormData(prev => ({
                        ...prev,
                        location: {
                          lat: location.lat,
                          lng: location.lng,
                          address: location.address
                        }
                      }))
                    }}
                    placeholder="Search for location (e.g., Atiwa, Calabar, Lagos)"
                  />
                  {formData.location && (
                    <div className="mt-2 text-xs text-gray-600">
                      📍 Selected: {formData.location.address}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_anonymous"
                    checked={formData.is_anonymous}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">Post Anonymously</label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId ? 'Update Report' : 'Create Report'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingId(null)
                    setFormData({
                      title: '',
                      description: '',
                      category: '',
                      priority: 'low',
                      severity: 'low',
                      is_anonymous: false
                    })
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
