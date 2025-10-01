'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Paperclip } from 'lucide-react';
import type { Comment, TeamMember } from '@/types';
import { useMentions } from '@/hooks/useMentions';
import { MentionAutocomplete } from './MentionAutocomplete';

interface CommentInputProps {
  placeholder?: string;
  initialValue?: string;
  onSubmit: (content: string, mentions?: string[]) => void | Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
  maxLength?: number;
  submitLabel?: string;
  editMode?: boolean;
  availableUsers?: TeamMember[];
}

export function CommentInput({
  placeholder = 'Scrivi un commento...',
  initialValue = '',
  onSubmit,
  onCancel,
  autoFocus = false,
  maxLength = 2000,
  submitLabel = 'Invia',
  editMode = false,
  availableUsers = [],
}: CommentInputProps) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mentions system
  const {
    suggestions,
    showSuggestions,
    mentionPosition,
    handleInputChange,
    insertMention,
    extractMentions,
    clearMentionState,
  } = useMentions(availableUsers);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Extract mentions from content
      const mentions = extractMentions(trimmedContent);
      await onSubmit(trimmedContent, mentions);
      setContent('');
      clearMentionState();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle mention selection
  const handleMentionSelect = (suggestion: any) => {
    if (textareaRef.current && mentionPosition !== null) {
      const cursorPosition = textareaRef.current.selectionStart;
      const { newText, newCursorPosition } = insertMention(
        content,
        suggestion,
        mentionPosition
      );

      setContent(newText);
      clearMentionState();

      // Set cursor position after mention
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    }
  };

  // Handle content change with mention detection
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Detect mentions
    if (textareaRef.current) {
      handleInputChange(newContent, textareaRef.current.selectionStart);
    }
  };

  const handleCancel = () => {
    setContent(initialValue);
    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't interfere with mention autocomplete
    if (showSuggestions && ['ArrowDown', 'ArrowUp', 'Enter', 'Tab'].includes(e.key)) {
      // Let MentionAutocomplete handle these keys
      return;
    }

    // Submit on Ctrl+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }

    // Cancel on Escape
    if (e.key === 'Escape') {
      if (showSuggestions) {
        clearMentionState();
      } else if (onCancel) {
        e.preventDefault();
        handleCancel();
      }
    }
  };

  const remainingChars = maxLength - content.length;
  const isNearLimit = remainingChars < 100;
  const isOverLimit = remainingChars < 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[80px] max-h-[300px]"
          maxLength={maxLength}
          disabled={isSubmitting}
        />

        {/* Character count */}
        {isNearLimit && (
          <div
            className={`absolute bottom-2 right-2 text-xs ${
              isOverLimit ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {remainingChars}
          </div>
        )}

        {/* Mention Autocomplete */}
        {showSuggestions && (
          <MentionAutocomplete
            suggestions={suggestions}
            onSelect={handleMentionSelect}
          />
        )}
      </div>

      {/* Hint text */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Usa @ per menzionare qualcuno • Ctrl+Invio per inviare
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            Annulla
          </button>
        )}

        <button
          type="submit"
          disabled={!content.trim() || isSubmitting || isOverLimit}
          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Invio...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
