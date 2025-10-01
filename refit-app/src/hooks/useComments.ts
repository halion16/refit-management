import { useState, useCallback, useEffect } from 'react';
import type {
  Comment,
  CommentEntityType,
  CommentFilters,
  Reaction,
  CommentAttachment,
} from '@/types';
import { COMMENTS_STORAGE_KEY } from '@/types';
import { useNotifications } from './useNotifications';

/**
 * Hook for managing comments and threaded discussions
 * Supports replies, reactions, mentions, and attachments
 */
export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  // Load comments from localStorage
  useEffect(() => {
    const loadComments = () => {
      try {
        const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Sort by timestamp descending (newest first)
          const sorted = parsed.sort(
            (a: Comment, b: Comment) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setComments(sorted);
        }
      } catch (error) {
        console.error('Error loading comments:', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, []);

  // Save comments to localStorage
  const saveComments = useCallback((updatedComments: Comment[]) => {
    try {
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updatedComments));
      setComments(updatedComments);
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  }, []);

  /**
   * Add new comment
   */
  const addComment = useCallback(
    async (
      commentData: Omit<Comment, 'id' | 'createdAt' | 'reactions'>
    ): Promise<Comment> => {
      const newComment: Comment = {
        ...commentData,
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        reactions: [],
      };

      const updated = [newComment, ...comments];
      saveComments(updated);

      // Create notifications for mentioned users
      if (newComment.mentions && newComment.mentions.length > 0) {
        const entityLabel = newComment.entityType === 'task' ? 'task' :
                           newComment.entityType === 'project' ? 'progetto' :
                           newComment.entityType === 'appointment' ? 'appuntamento' : 'elemento';

        newComment.mentions.forEach(async (userId) => {
          // Don't notify yourself
          if (userId !== newComment.userId) {
            await addNotification({
              userId,
              type: 'mention',
              priority: 'medium',
              title: `${newComment.userName} ti ha menzionato`,
              message: newComment.parentId
                ? `Ti ha menzionato in una risposta: "${newComment.content.substring(0, 100)}${newComment.content.length > 100 ? '...' : ''}"`
                : `Ti ha menzionato in un commento su un ${entityLabel}: "${newComment.content.substring(0, 100)}${newComment.content.length > 100 ? '...' : ''}"`,
              read: false,
            });
          }
        });
      }

      return newComment;
    },
    [comments, saveComments, addNotification]
  );

  /**
   * Update comment content
   */
  const updateComment = useCallback(
    async (id: string, content: string, editedBy: string): Promise<void> => {
      const updated = comments.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              content,
              updatedAt: new Date().toISOString(),
              editedBy,
            }
          : comment
      );

      saveComments(updated);
    },
    [comments, saveComments]
  );

  /**
   * Delete comment (soft delete)
   */
  const deleteComment = useCallback(
    async (id: string): Promise<void> => {
      const updated = comments.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              deleted: true,
              content: '[Commento eliminato]',
            }
          : comment
      );

      saveComments(updated);
    },
    [comments, saveComments]
  );

  /**
   * Get comments by entity (task, project, etc.)
   */
  const getCommentsByEntity = useCallback(
    (entityType: CommentEntityType, entityId?: string): Comment[] => {
      return comments.filter(
        (c) =>
          c.entityType === entityType &&
          (entityId ? c.entityId === entityId : true) &&
          !c.deleted
      );
    },
    [comments]
  );

  /**
   * Get comment thread (replies to a comment)
   */
  const getCommentThread = useCallback(
    (parentId: string): Comment[] => {
      return comments
        .filter((c) => c.parentId === parentId && !c.deleted)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ); // Oldest first for replies
    },
    [comments]
  );

  /**
   * Get top-level comments (no parent)
   */
  const getTopLevelComments = useCallback(
    (filters?: CommentFilters): Comment[] => {
      let filtered = comments.filter((c) => !c.parentId && !c.deleted);

      if (!filters) return filtered;

      if (filters.entityType) {
        filtered = filtered.filter((c) => c.entityType === filters.entityType);
      }

      if (filters.entityId) {
        filtered = filtered.filter((c) => c.entityId === filters.entityId);
      }

      if (filters.userId) {
        filtered = filtered.filter((c) => c.userId === filters.userId);
      }

      return filtered;
    },
    [comments]
  );

  /**
   * Add reaction to comment
   */
  const addReaction = useCallback(
    async (
      commentId: string,
      emoji: string,
      userId: string,
      userName: string
    ): Promise<void> => {
      const updated = comments.map((comment) => {
        if (comment.id !== commentId) return comment;

        const reactions = comment.reactions || [];

        // Check if user already reacted with this emoji
        const existingReaction = reactions.find(
          (r) => r.userId === userId && r.emoji === emoji
        );

        if (existingReaction) {
          // Remove reaction if already exists (toggle)
          return {
            ...comment,
            reactions: reactions.filter(
              (r) => !(r.userId === userId && r.emoji === emoji)
            ),
          };
        } else {
          // Add new reaction
          return {
            ...comment,
            reactions: [
              ...reactions,
              {
                emoji,
                userId,
                userName,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
      });

      saveComments(updated);
    },
    [comments, saveComments]
  );

  /**
   * Remove reaction from comment
   */
  const removeReaction = useCallback(
    async (commentId: string, emoji: string, userId: string): Promise<void> => {
      const updated = comments.map((comment) => {
        if (comment.id !== commentId) return comment;

        const reactions = comment.reactions || [];

        return {
          ...comment,
          reactions: reactions.filter(
            (r) => !(r.userId === userId && r.emoji === emoji)
          ),
        };
      });

      saveComments(updated);
    },
    [comments, saveComments]
  );

  /**
   * Get mentions for a specific user
   */
  const getMentionsForUser = useCallback(
    (userId: string): Comment[] => {
      return comments.filter(
        (c) => c.mentions && c.mentions.includes(userId) && !c.deleted
      );
    },
    [comments]
  );

  /**
   * Get comment count by entity
   */
  const getCommentCount = useCallback(
    (entityType: CommentEntityType, entityId?: string): number => {
      return comments.filter(
        (c) =>
          c.entityType === entityType &&
          (entityId ? c.entityId === entityId : true) &&
          !c.deleted
      ).length;
    },
    [comments]
  );

  /**
   * Get reply count for a comment
   */
  const getReplyCount = useCallback(
    (commentId: string): number => {
      return comments.filter((c) => c.parentId === commentId && !c.deleted)
        .length;
    },
    [comments]
  );

  /**
   * Get recent comments (last N)
   */
  const getRecentComments = useCallback(
    (limit: number = 10): Comment[] => {
      return comments.filter((c) => !c.deleted).slice(0, limit);
    },
    [comments]
  );

  /**
   * Search comments by content
   */
  const searchComments = useCallback(
    (query: string): Comment[] => {
      if (!query.trim()) return [];

      const lowerQuery = query.toLowerCase();

      return comments.filter(
        (c) =>
          !c.deleted &&
          (c.content.toLowerCase().includes(lowerQuery) ||
            c.userName.toLowerCase().includes(lowerQuery))
      );
    },
    [comments]
  );

  return {
    // State
    comments,
    loading,

    // CRUD operations
    addComment,
    updateComment,
    deleteComment,

    // Queries
    getCommentsByEntity,
    getCommentThread,
    getTopLevelComments,
    getCommentCount,
    getReplyCount,
    getRecentComments,
    searchComments,

    // Reactions
    addReaction,
    removeReaction,

    // Mentions
    getMentionsForUser,
  };
}
