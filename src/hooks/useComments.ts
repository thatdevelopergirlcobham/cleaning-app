import { useState, useEffect, useCallback } from 'react';
import { commentsApi, type CommentWithUser } from '../api/comments';
import { useToast } from './useToast';
import { useAuth } from './useAuth';

export const useComments = (reportId: string) => {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { user } = useAuth();

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!reportId) {
      setLoading(false);
      return;
    }
    try {
      const fetchedComments = await commentsApi.getComments(reportId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load comments'
      });
    } finally {
      setLoading(false);
    }
  }, [reportId, addToast]);

  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Real-time subscription
  useEffect(() => {
    if (!reportId) return;

    const subscription = commentsApi.subscribeToComments(reportId, (newComment) => {
      setComments(prev => [...prev, newComment]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [reportId]);

  // Add new comment
  const addComment = useCallback(async (commentData: { report_id: string; content: string; is_anonymous?: boolean; user_id?: string | null }) => {
    if (!user || !reportId) return;

    try {
      const newComment = await commentsApi.createComment({
        report_id: commentData.report_id,
        user_id: commentData.user_id ?? user.id,
        content: commentData.content,
        is_anonymous: commentData.is_anonymous,
        created_at: new Date().toISOString()
      });

      // Optimistically add the comment
      setComments(prev => [...prev, newComment]);
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Comment posted successfully'
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to post comment'
      });
      throw error;
    }
  }, [reportId, user, addToast]);

  // Delete comment
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    try {
      await commentsApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete comment'
      });
      throw error;
    }
  }, [user, addToast]);

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    refreshComments: fetchComments
  };
};