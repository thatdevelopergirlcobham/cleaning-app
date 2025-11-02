import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabaseClient'; // We use this directly now
// We no longer need getReportById, but we still need the type
import { type ReportWithProfile } from '../../api/reports'; 
import { reverseGeocode } from '../../utils/geocoding';
import { format } from 'date-fns';
import { MapIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useComments } from '../../hooks/useComments';

type ReportRow = ReportWithProfile | null;

interface LocationData {
  lat: number;
  lng: number;
}

const formatDate = (d?: string) => {
  if (!d) return '';
  try {
    return format(new Date(d), 'd MMMM, yyyy, h:mm a');
  } catch {
    return d as string;
  }
};

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationText, setLocationText] = useState<string | null>(null);
  const { user } = useAuth();

  // Comments state
  // This is now redundant because ReportWithProfile includes user_profiles
  // but we can keep it for the fallback logic just in case.
  const [authorProfile, setAuthorProfile] = useState<{ full_name?: string; avatar_url?: string | null } | null>(null);
  
  // Comments
  const { comments, loading: commentsLoading, addComment } = useComments(id || '');

  // Fetch the main report
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('No report id specified');
      return;
    }

    let isMounted = true;

    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      setAuthorProfile(null); // Reset author profile

      try {
        // --- THIS IS THE UPDATED LOGIC ---
        // We use supabase.rpc or a direct fetch to replicate the PostgREST query
        // Using the JS client is cleaner:
        const { data, error: queryError } = await supabase
          .from('reports')
          .select('*, user_profiles(full_name, avatar_url)') // This matches your HTML file's query
          .eq('id', id)
          .single(); // .single() fetches one record or null, which is perfect

        if (queryError && queryError.code !== 'PGRST116') {
          // PGRST116 means "exact one row not found", which is not an error for .single()
          // But we'll treat it as "not found"
          console.error('Supabase query error:', queryError);
          throw new Error(queryError.message);
        }
        // --- END OF UPDATED LOGIC ---

        if (!isMounted) return;
        if (!data) {
          setError('Report not found');
          setReport(null);
          setLoading(false);
          return;
        }

        setReport(data as ReportWithProfile);
        setLoading(false);

        // Handle location text
        if (data.location) {
          const location = data.location;
          if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
            const locationData = location as LocationData;
            setLocationText(null);
            (async () => {
              try {
                const addr = await reverseGeocode({ lat: locationData.lat, lng: locationData.lng });
                if (isMounted) setLocationText(addr);
              } catch (err) {
                console.warn('Geocode error', err);
                if (isMounted) setLocationText(`${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)}`);
              }
            })();
          } else if (typeof location === 'string') {
            setLocationText(location);
          }
        } else if (typeof data.location === 'string') {
          setLocationText(data.location as string);
        }

        // Author profile should now be included directly on `data.user_profiles`
        // thanks to our new `select` query.
        if (data.user_profiles) {
          setAuthorProfile(data.user_profiles as { full_name?: string; avatar_url?: string | null });
        } else if (data.user_id) {
          // This fallback logic can stay, just in case
          (async () => {
            try {
              const { data: up } = await supabase
                .from('user_profiles')
                .select('full_name,avatar_url')
                .eq('id', data.user_id)
                .single();
              if (isMounted && up) setAuthorProfile(up as { full_name?: string; avatar_url?: string | null });
            } catch (err) {
              console.warn('Failed to load author profile fallback', err);
            }
          })();
        }
      } catch (err) {
        const e = err as Error;
        if (!isMounted) return;
        console.error('Failed to load report', e);
        setError(e.message || 'Failed to load report');
        setLoading(false);
      }
    };

    fetchReport();

    return () => {
      isMounted = false;
    };
  }, [id]); // Removed supabase from dependency array as it's stable

  // Comments are now handled by useComments hook

  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const submitComment = async () => {
    if (!id) return;
    if (!newComment.trim()) return setCommentError('Comment cannot be empty');
    setCommentError(null);
    setSubmittingComment(true);

    try {
      await addComment({
        report_id: id,
        content: newComment.trim(),
        is_anonymous: !user,
        user_id: user?.id ?? null,
      });
      
      setNewComment('');
    } catch (err) {
      console.error('Submit comment error', err);
      setCommentError((err as Error).message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // --- THE UI REMAINS UNCHANGED ---
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:underline"
          >
            ← Back
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
            <p className="text-gray-600">Loading report...</p>
          </div>
        ) : error ? (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>{' '}
            <span>{error}</span>
          </div>
        ) : !report ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Report not found</h3>
            <p className="text-gray-500">It may have been removed or the ID is invalid.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative">
              <img
                src={report.image_url || 'https://via.placeholder.com/1200x600?text=No+Image'}
                alt={report.title}
                className="w-full h-72 object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl font-bold text-gray-800">{report.title}</h1>
                {/* This should work correctly now */}
                <div className="text-sm text-gray-600">
                  {authorProfile?.full_name || (report.is_anonymous ? 'Anonymous' : 'Community Member')}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className={`px-3 py-1 rounded-full text-sm ${
                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {report.status || 'unknown'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapIcon className="w-5 h-5 text-gray-400" />
                  <span>
                    {report.location 
                      ? (typeof report.location === 'object' && 'lat' in report.location)
                        ? (locationText === null ? 'Resolving location...' : locationText)
                        : (locationText || 'Location not available')
                      : 'Location not available'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <span>{formatDate(report.created_at)}</span>
                </div>
              </div>

              <div className="prose max-w-none text-gray-700 mb-6">
                <h2 className="text-lg font-semibold">Description</h2>
                <p>{report.description}</p>
              </div>

              
              {/* Comments Section */}
              <div className="mt-8">
                {commentsLoading ? (
                  <p className="text-sm text-gray-500">Loading comments...</p>
                ) : (
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-sm text-gray-500">No comments yet. Be the first to comment.</p>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 overflow-hidden">
                                {c.user_profiles?.full_name ? c.user_profiles.full_name.slice(0, 2).toUpperCase() : (c.is_anonymous ? 'A' : 'U')}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{c.user_profiles?.full_name || (c.is_anonymous ? 'Anonymous' : 'Community Member')}</div>
                                <div className="text-xs text-gray-500">{formatDate(c.created_at)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-800">{c.content}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="mt-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? 'Write your comment...' : 'Write a public comment (you will be anonymous)'}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    rows={4}
                  />
                  {commentError && <div className="text-sm text-red-600 mt-2">{commentError}</div>}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={submitComment}
                      disabled={submittingComment}
                      className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
                    >
                      {submittingComment ? 'Submitting...' : 'Post Comment'}
                    </button>
                    <button
                      onClick={() => setNewComment('')}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportDetailPage;