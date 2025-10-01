'use client';

import { useState } from 'react';
import type { Comment } from '@/types';
import {
  MessageSquare,
  Trash2,
  Edit,
  MoreVertical,
  ThumbsUp,
  Heart,
  Smile,
  Check,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onReply?: (comment: Comment) => void;
  onEdit?: (comment: Comment) => void;
  onDelete?: (commentId: string) => void;
  onReaction?: (commentId: string, emoji: string) => void;
  replyCount?: number;
  showThread?: boolean;
  onToggleThread?: () => void;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '🎉', '👏'];

export function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  replyCount = 0,
  showThread = false,
  onToggleThread,
}: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: it,
  });

  const isOwnComment = comment.userId === currentUserId;
  const isEdited = !!comment.updatedAt;

  // Get initials for avatar
  const initials = comment.userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Group reactions by emoji
  const groupedReactions = (comment.reactions || []).reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, typeof comment.reactions>);

  const handleReactionClick = (emoji: string) => {
    if (onReaction) {
      onReaction(comment.id, emoji);
    }
    setShowEmojiPicker(false);
  };

  return (
    <div className="group">
      <div className="flex gap-3">
        {/* Avatar */}
        {comment.userAvatar ? (
          <img
            src={comment.userAvatar}
            alt={comment.userName}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 flex-shrink-0">
            {initials}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <span className="font-semibold text-sm text-gray-900">
                {comment.userName}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {timeAgo}
                {isEdited && ' (modificato)'}
              </span>
            </div>

            {/* Actions menu */}
            {isOwnComment && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      {onEdit && (
                        <button
                          onClick={() => {
                            onEdit(comment);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Modifica
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (
                              confirm('Sei sicuro di voler eliminare questo commento?')
                            ) {
                              onDelete(comment.id);
                            }
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Elimina
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Comment content */}
          <div className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
            {comment.content}
          </div>

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mb-2 space-y-1">
              {comment.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="inline-flex items-center gap-2 bg-gray-50 rounded px-2 py-1 text-xs text-gray-600"
                >
                  <span>📎 {attachment.name}</span>
                  <span className="text-gray-400">
                    ({Math.round(attachment.size / 1024)} KB)
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {Object.keys(groupedReactions).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {Object.entries(groupedReactions).map(([emoji, reactions]) => {
                const hasReacted = reactions.some((r) => r.userId === currentUserId);

                return (
                  <button
                    key={emoji}
                    onClick={() => handleReactionClick(emoji)}
                    className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                      ${
                        hasReacted
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                    title={reactions.map((r) => r.userName).join(', ')}
                  >
                    <span>{emoji}</span>
                    <span>{reactions.length}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 text-xs">
            {onReply && (
              <button
                onClick={() => onReply(comment)}
                className="text-gray-600 hover:text-blue-600 flex items-center gap-1"
              >
                <MessageSquare className="h-3 w-3" />
                Rispondi
              </button>
            )}

            {/* Emoji picker */}
            {onReaction && (
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-600 hover:text-blue-600 flex items-center gap-1"
                >
                  <Smile className="h-3 w-3" />
                  Reagisci
                </button>

                {showEmojiPicker && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowEmojiPicker(false)}
                    />
                    <div className="absolute left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-20 flex gap-1">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReactionClick(emoji)}
                          className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Thread toggle */}
            {replyCount > 0 && onToggleThread && (
              <button
                onClick={onToggleThread}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {showThread ? '▼' : '▶'} {replyCount}{' '}
                {replyCount === 1 ? 'risposta' : 'risposte'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
