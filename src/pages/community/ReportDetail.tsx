import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient';
import { reverseGeocode } from '../../utils/geocoding';
import { MapIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useComments } from '../../hooks/useComments';
import { format } from 'date-fns';
import { type ReportWithProfile } from '../../api/reports';

type ReportRow = ReportWithProfile | null;
interface LocationData {
  lat: number;
  lng: number;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [report, setReport] = useState<ReportRow>(null);
  const [loading, setLoading] = useState(true);
  const [locationText, setLocationText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Comments
  const { comments, loading: commentsLoading, addComment, deleteComment, updateComment } = useComments(id || '');
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('reports')
          .select('*, user_profiles(full_name, avatar_url)')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        console.log(' Full JSON response:', data); // show full JSON response in console

        setReport(data as ReportWithProfile);

        // Reverse geocode
        if (data?.location && typeof data.location === 'object') {
          const loc = data.location as LocationData;
          try {
            const addr = await reverseGeocode(loc);
            setLocationText(addr);
          } catch {
            setLocationText(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
          }
        } else if (typeof data?.location === 'string') {
          setLocationText(data.location);
        }

      } catch (err) {
        console.error(' Error fetching report:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleCommentSubmit = async () => {
    if (!id || !newComment.trim()) return setCommentError('Comment cannot be empty');
    setSubmitting(true);
    setCommentError(null);
    try {
      await addComment({
        report_id: id,
        content: newComment.trim(),
        is_anonymous: !user,
        user_id: user?.id ?? null,
      });
      setNewComment('');
    } catch (err) {
      console.error(' Comment submit error:', err);
      setCommentError('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-600">Loading report...</div>;
  if (error) return <div className="p-10 text-center text-red-600 font-medium">{error}</div>;
  if (!report) return <div className="p-10 text-center text-gray-600">Report not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-2xl p-8">
        <img
          src={report.image_url || 'https://via.placeholder.com/800x400?text=No+Image'}
          alt={report.title}
          className="w-full h-64 object-cover rounded-xl mb-6"
        />

        <h1 className="text-3xl font-semibold mb-2">{report.title}</h1>
        <p className="text-gray-600 text-sm mb-4">
          {report.user_profiles?.full_name || (report.is_anonymous ? 'Anonymous' : 'Community Member')}
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-6 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-gray-400" />
            <span>{locationText || 'Location unavailable'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <span>{formatDate(report.created_at)}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium
            ${report.status === 'resolved' ? 'bg-green-100 text-green-800' :
              report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              report.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'}`}>
            {report.status}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
          <p className="text-gray-800 leading-relaxed">{report.description}</p>
        </div>

        <section className="mt-10 border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Comments</h2>

          {commentsLoading ? (
            <p className="text-gray-500 text-sm">Loading comments...</p>
          ) : (
            <div className="space-y-3 mb-6">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet.</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="border rounded-md p-3 bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-gray-700">
                          {c.user_profiles?.full_name || (c.is_anonymous ? 'Anonymous' : 'User')}
                          {c.user_id === user?.id ? ' (You)' : ''}
                        </div>
                        <div className="text-xs text-gray-400 mb-1">{format(c.created_at, 'PPp')}</div>
                      </div>
                      {user && c.user_id === user.id && (
                        <div className="flex items-center gap-2">
                          {editingCommentId === c.id ? (
                            <>
                              <button
                                className="text-green-700 text-xs font-medium"
                                onClick={async () => {
                                  if (!editingContent.trim()) return;
                                  await updateComment(c.id, editingContent.trim());
                                  setEditingCommentId(null);
                                  setEditingContent('');
                                }}
                              >
                                Save
                              </button>
                              <button
                                className="text-gray-500 text-xs"
                                onClick={() => { setEditingCommentId(null); setEditingContent(''); }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="inline-flex items-center justify-center text-blue-700 bg-blue-50 hover:bg-blue-100 rounded w-7 h-7"
                                onClick={() => { setEditingCommentId(c.id); setEditingContent(c.content); }}
                                aria-label="Edit comment"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                className="inline-flex items-center justify-center text-red-700 bg-red-50 hover:bg-red-100 rounded w-7 h-7"
                                onClick={async () => { if (confirm('Delete this comment?')) await deleteComment(c.id); }}
                                aria-label="Delete comment"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {editingCommentId === c.id ? (
                      <textarea
                        className="mt-2 w-full border border-gray-300 rounded-md p-2 text-sm"
                        rows={3}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                      />
                    ) : (
                      <div className="text-gray-800 text-sm mt-1">{c.content}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-2"
            rows={3}
          />
          {commentError && <p className="text-red-600 text-sm mb-2">{commentError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleCommentSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-60"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
            <button
              onClick={() => setNewComment('')}
              className="border border-gray-300 px-4 py-2 rounded-md text-sm"
            >
              Clear
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReportDetailPage;