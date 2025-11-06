# User Reports CRUD System - Complete Guide

## Overview

This guide explains how to implement user-specific report management with full CRUD (Create, Read, Update, Delete) operations. The system ensures that users can only access and modify their own reports.

## Table of Contents

1. [Database Setup](#database-setup)
2. [How It Works](#how-it-works)
3. [Frontend Implementation](#frontend-implementation)
4. [Usage Examples](#usage-examples)
5. [Security](#security)
6. [Troubleshooting](#troubleshooting)

---

## Database Setup

### Step 1: Run the SQL Setup Script

Execute the SQL file in your Supabase SQL Editor:

```bash
# Location: db/user-reports-setup.sql
```

This script will:
- ✅ Fix the incomplete `handle_report_timestamps` trigger
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create CRUD functions for user reports
- ✅ Add performance indexes
- ✅ Grant necessary permissions

### Step 2: Verify Setup

Run this query to verify:

```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%user_report%';

-- Should return:
-- get_user_reports
-- create_user_report
-- update_user_report
-- delete_user_report
-- get_user_report_by_id
-- get_user_reports_count
```

---

## How It Works

### Database Relationships

```
auth.users (Supabase Auth)
    ↓
user_profiles (id references auth.users.id)
    ↓
reports (profile_id references user_profiles.id)
```

### Key Concepts

1. **Authentication**: Uses Supabase Auth (`auth.uid()`)
2. **User Identification**: Links reports via `profile_id` to `user_profiles`
3. **Row Level Security**: Ensures users only access their own data
4. **CRUD Operations**: Full create, read, update, delete functionality

---

## Frontend Implementation

### File Structure

```
src/
├── api/
│   ├── supabaseClient.ts          # Supabase client setup
│   └── userReportsService.ts      # Service layer for CRUD operations
├── hooks/
│   └── useUserReports.ts          # React hook for easy integration
└── components/
    └── community/
        └── UserReportsManager.tsx  # Example component
```

### Service Layer (`userReportsService.ts`)

The service provides these methods:

```typescript
// Fetch all user reports
UserReportsService.getUserReports()

// Fetch single report
UserReportsService.getUserReportById(reportId)

// Create new report
UserReportsService.createUserReport(data)

// Update report
UserReportsService.updateUserReport(reportId, updates)

// Delete report
UserReportsService.deleteUserReport(reportId)

// Get filtered reports
UserReportsService.getUserReportsWithFilters(filters)

// Get report counts
UserReportsService.getUserReportsCount()
```

### React Hook (`useUserReports.ts`)

Simplifies state management:

```typescript
const {
  reports,        // Array of user's reports
  loading,        // Loading state
  error,          // Error message
  refetch,        // Refresh data
  createReport,   // Create function
  updateReport,   // Update function
  deleteReport,   // Delete function
  getReportById,  // Get single report
  counts          // Report counts by status
} = useUserReports()
```

---

## Usage Examples

### Example 1: Display User's Reports

```tsx
import { useUserReports } from '../hooks/useUserReports'

function MyReports() {
  const { reports, loading, error } = useUserReports()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>My Reports ({reports.length})</h1>
      {reports.map(report => (
        <div key={report.id}>
          <h3>{report.title}</h3>
          <p>{report.description}</p>
          <span>Status: {report.status}</span>
        </div>
      ))}
    </div>
  )
}
```

### Example 2: Create a New Report

```tsx
import { useUserReports } from '../hooks/useUserReports'

function CreateReport() {
  const { createReport, loading } = useUserReports(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'waste',
    priority: 'medium',
    severity: 'low'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newReport = await createReport(formData)
    
    if (newReport) {
      alert('Report created successfully!')
      // Reset form or redirect
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        placeholder="Title"
        required
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        placeholder="Description"
        required
      />
      <select
        value={formData.priority}
        onChange={(e) => setFormData({...formData, priority: e.target.value})}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Report'}
      </button>
    </form>
  )
}
```

### Example 3: Update a Report

```tsx
import { useUserReports } from '../hooks/useUserReports'

function EditReport({ reportId }) {
  const { updateReport, getReportById } = useUserReports(false)
  const [report, setReport] = useState(null)

  useEffect(() => {
    const fetchReport = async () => {
      const data = await getReportById(reportId)
      setReport(data)
    }
    fetchReport()
  }, [reportId])

  const handleUpdate = async () => {
    const updated = await updateReport(reportId, {
      title: report.title,
      description: report.description,
      priority: report.priority
    })
    
    if (updated) {
      alert('Report updated successfully!')
    }
  }

  if (!report) return <div>Loading...</div>

  return (
    <div>
      <input
        value={report.title}
        onChange={(e) => setReport({...report, title: e.target.value})}
      />
      <textarea
        value={report.description}
        onChange={(e) => setReport({...report, description: e.target.value})}
      />
      <button onClick={handleUpdate}>Update Report</button>
    </div>
  )
}
```

### Example 4: Delete a Report

```tsx
import { useUserReports } from '../hooks/useUserReports'

function ReportCard({ report }) {
  const { deleteReport } = useUserReports(false)

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      const success = await deleteReport(report.id)
      
      if (success) {
        alert('Report deleted successfully!')
      }
    }
  }

  return (
    <div>
      <h3>{report.title}</h3>
      <p>{report.description}</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  )
}
```

### Example 5: Display Report Statistics

```tsx
import { useUserReports } from '../hooks/useUserReports'

function ReportStats() {
  const { counts } = useUserReports()

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>{counts.total}</h3>
        <p>Total Reports</p>
      </div>
      <div className="stat-card">
        <h3>{counts.pending}</h3>
        <p>Pending</p>
      </div>
      <div className="stat-card">
        <h3>{counts.approved}</h3>
        <p>Approved</p>
      </div>
      <div className="stat-card">
        <h3>{counts.resolved}</h3>
        <p>Resolved</p>
      </div>
    </div>
  )
}
```

### Example 6: Filter Reports

```tsx
import UserReportsService from '../api/userReportsService'

function FilteredReports() {
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchFiltered = async () => {
      let data
      
      if (filter === 'all') {
        data = await UserReportsService.getUserReports()
      } else {
        data = await UserReportsService.getUserReportsWithFilters({
          status: filter
        })
      }
      
      setReports(data)
    }
    
    fetchFiltered()
  }, [filter])

  return (
    <div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All Reports</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="resolved">Resolved</option>
      </select>
      
      {reports.map(report => (
        <div key={report.id}>{report.title}</div>
      ))}
    </div>
  )
}
```

---

## Security

### Row Level Security (RLS)

The system uses RLS policies to ensure data security:

1. **Users can only view their own reports**
   ```sql
   USING (profile_id = auth.uid())
   ```

2. **Users can only create reports for themselves**
   ```sql
   WITH CHECK (profile_id = auth.uid())
   ```

3. **Users can only update non-resolved reports**
   ```sql
   USING (profile_id = auth.uid() AND is_resolved = false)
   ```

4. **Users can only delete pending reports**
   ```sql
   USING (profile_id = auth.uid() AND status = 'pending')
   ```

5. **Admins have full access**
   ```sql
   EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
   ```

### Best Practices

- ✅ Always authenticate users before CRUD operations
- ✅ Validate input data on the frontend
- ✅ Use the service layer instead of direct Supabase calls
- ✅ Handle errors gracefully
- ✅ Show loading states during operations
- ✅ Confirm destructive actions (delete)

---

## Troubleshooting

### Issue: "User not authenticated"

**Solution**: Ensure the user is logged in:

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  // Redirect to login
}
```

### Issue: "Failed to fetch user profile"

**Solution**: Check if user_profiles entry exists:

```sql
SELECT * FROM user_profiles WHERE id = 'user-uuid';
```

If missing, create it:

```sql
INSERT INTO user_profiles (id, email, full_name)
VALUES ('user-uuid', 'user@example.com', 'User Name');
```

### Issue: "Permission denied" when updating

**Solution**: Check if the report is resolved:

```typescript
// Users cannot update resolved reports
if (report.is_resolved) {
  alert('Cannot update resolved reports')
}
```

### Issue: "Cannot delete report"

**Solution**: Only pending reports can be deleted:

```typescript
// Check status before deletion
if (report.status !== 'pending') {
  alert('Only pending reports can be deleted')
}
```

### Issue: Reports not showing

**Solution**: Verify RLS policies are enabled:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'reports';

-- Should show: rowsecurity = true
```

---

## API Reference

### UserReportsService Methods

#### `getUserReports(): Promise<Report[]>`
Fetches all reports for the current user.

#### `getUserReportById(reportId: string): Promise<Report | null>`
Fetches a single report by ID.

#### `createUserReport(data: CreateReportInput): Promise<Report>`
Creates a new report.

**Parameters:**
- `title` (required): Report title
- `description` (required): Report description
- `category` (optional): Report category
- `priority` (optional): 'low' | 'medium' | 'high'
- `severity` (optional): 'low' | 'medium' | 'high'
- `is_anonymous` (optional): Boolean

#### `updateUserReport(reportId: string, updates: UpdateReportInput): Promise<Report>`
Updates an existing report.

#### `deleteUserReport(reportId: string): Promise<boolean>`
Deletes a report (only if pending).

#### `getUserReportsWithFilters(filters: object): Promise<Report[]>`
Fetches filtered reports.

**Filter Options:**
- `status`: 'pending' | 'approved' | 'rejected' | 'resolved'
- `category`: string
- `priority`: 'low' | 'medium' | 'high'
- `severity`: 'low' | 'medium' | 'high'
- `is_resolved`: boolean

#### `getUserReportsCount(): Promise<object>`
Returns report counts by status.

**Returns:**
```typescript
{
  total: number
  pending: number
  approved: number
  rejected: number
  resolved: number
}
```

---

## Complete Example Component

See `src/components/community/UserReportsManager.tsx` for a full working example with:
- ✅ List view with statistics
- ✅ Create form
- ✅ Edit functionality
- ✅ Delete with confirmation
- ✅ Status badges
- ✅ Loading states
- ✅ Error handling

---

## Next Steps

1. **Run the SQL setup** in Supabase SQL Editor
2. **Import the service** in your components
3. **Use the hook** for state management
4. **Customize the UI** to match your design
5. **Add image upload** functionality if needed
6. **Implement location picker** for the location field

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify database setup is complete
3. Check browser console for errors
4. Verify user authentication status

---

**Setup Complete!** 🎉

You now have a fully functional user-specific report management system with CRUD operations and proper security.
