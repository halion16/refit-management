'use client';

import { useState, useMemo } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import type { Comment, CommentEntityType } from '@/types';
import { useComments } from '@/hooks/useComments';
import { useTeam } from '@/hooks/useTeam';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';

interface CommentSectionProps {
  entityType: CommentEntityType;
  entityId?: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  title?: string;
  collapsed?: boolean;
}

export function CommentSection({
  entityType,
  entityId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  title = 'Commenti',
  collapsed = false,
}: CommentSectionProps) {
  const {
    addComment,
    updateComment,
    deleteComment,
    getTopLevelComments,
    getCommentThread,
    getReplyCount,
    addReaction,
  } = useComments();

  const { getActiveMembers } = useTeam();
  const availableUsers = getActiveMembers();

  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  // Get top-level comments for this entity
  const topLevelComments = useMemo(
    () => getTopLevelComments({ entityType, entityId }),
    [getTopLevelComments, entityType, entityId]
  );

  const totalComments = topLevelComments.reduce((acc, comment) => {
    return acc + 1 + getReplyCount(comment.id);
  }, 0);

  // Handle adding new comment
  const handleAddComment = async (content: string, mentions?: string[]) => {
    await addComment({
      entityType,
      entityId,
      userId: currentUserId,
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      content,
      mentions,
      parentId: replyingTo?.id,
    });

    setReplyingTo(null);
  };

  // Handle editing comment
  const handleEditComment = async (content: string) => {
    if (!editingComment) return;

    await updateComment(editingComment.id, content, currentUserId);
    setEditingComment(null);
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  // Handle reaction
  const handleReaction = async (commentId: string, emoji: string) => {
    await addReaction(commentId, emoji, currentUserId, currentUserName);
  };

  // Toggle thread expansion
  const toggleThread = (commentId: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {totalComments > 0 && (
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
              {totalComments}
            </span>
          )}
        </div>
        {isCollapsed ? (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4 border-t border-gray-200">
          {/* New comment input */}
          {!editingComment && !replyingTo && (
            <div className="pb-4 border-b border-gray-100">
              <CommentInput
                placeholder="Scrivi un commento..."
                onSubmit={handleAddComment}
                submitLabel="Commenta"
                availableUsers={availableUsers}
              />
            </div>
          )}

          {/* Comments list */}
          {topLevelComments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nessun commento ancora</p>
              <p className="text-xs mt-1">Sii il primo a commentare!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {topLevelComments.map((comment) => {
                const replies = getCommentThread(comment.id);
                const replyCount = replies.length;
                const isThreadExpanded = expandedThreads.has(comment.id);

                return (
                  <div key={comment.id} className="space-y-4">
                    {/* Main comment */}
                    {editingComment?.id === comment.id ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-xs text-blue-700 mb-2 font-medium">
                          Modifica commento
                        </div>
                        <CommentInput
                          initialValue={comment.content}
                          onSubmit={handleEditComment}
                          onCancel={() => setEditingComment(null)}
                          submitLabel="Salva"
                          autoFocus
                          editMode
                          availableUsers={availableUsers}
                        />
                      </div>
                    ) : (
                      <CommentItem
                        comment={comment}
                        currentUserId={currentUserId}
                        onReply={setReplyingTo}
                        onEdit={setEditingComment}
                        onDelete={handleDeleteComment}
                        onReaction={handleReaction}
                        replyCount={replyCount}
                        showThread={isThreadExpanded}
                        onToggleThread={
                          replyCount > 0 ? () => toggleThread(comment.id) : undefined
                        }
                      />
                    )}

                    {/* Reply input */}
                    {replyingTo?.id === comment.id && (
                      <div className="ml-11 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="text-xs text-gray-700 mb-2">
                          Rispondi a <span className="font-medium">{comment.userName}</span>
                        </div>
                        <CommentInput
                          placeholder="Scrivi una risposta..."
                          onSubmit={handleAddComment}
                          onCancel={() => setReplyingTo(null)}
                          submitLabel="Rispondi"
                          autoFocus
                          availableUsers={availableUsers}
                        />
                      </div>
                    )}

                    {/* Thread/Replies */}
                    {isThreadExpanded && replies.length > 0 && (
                      <div className="ml-11 space-y-4 pl-4 border-l-2 border-gray-200">
                        {replies.map((reply) => (
                          <div key={reply.id}>
                            {editingComment?.id === reply.id ? (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="text-xs text-blue-700 mb-2 font-medium">
                                  Modifica risposta
                                </div>
                                <CommentInput
                                  initialValue={reply.content}
                                  onSubmit={handleEditComment}
                                  onCancel={() => setEditingComment(null)}
                                  submitLabel="Salva"
                                  autoFocus
                                  editMode
                                  availableUsers={availableUsers}
                                />
                              </div>
                            ) : (
                              <CommentItem
                                comment={reply}
                                currentUserId={currentUserId}
                                onReply={setReplyingTo}
                                onEdit={setEditingComment}
                                onDelete={handleDeleteComment}
                                onReaction={handleReaction}
                              />
                            )}

                            {/* Reply to reply input */}
                            {replyingTo?.id === reply.id && (
                              <div className="ml-11 mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="text-xs text-gray-700 mb-2">
                                  Rispondi a <span className="font-medium">{reply.userName}</span>
                                </div>
                                <CommentInput
                                  placeholder="Scrivi una risposta..."
                                  onSubmit={handleAddComment}
                                  onCancel={() => setReplyingTo(null)}
                                  submitLabel="Rispondi"
                                  autoFocus
                                  availableUsers={availableUsers}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
