import { useState, useCallback, useMemo } from 'react';
import type { TeamMember } from '@/types';

export interface MentionSuggestion {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface MentionMatch {
  start: number;
  end: number;
  query: string;
}

/**
 * Hook for handling @mentions with autocomplete
 */
export function useMentions(availableUsers: TeamMember[]) {
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState<number | null>(null);

  /**
   * Detect @mention in text
   * Returns the mention match if found, null otherwise
   */
  const detectMention = useCallback((text: string, cursorPosition: number): MentionMatch | null => {
    // Find the last @ before cursor
    const beforeCursor = text.substring(0, cursorPosition);
    const lastAtIndex = beforeCursor.lastIndexOf('@');

    if (lastAtIndex === -1) return null;

    // Check if there's a space or start of text before @
    if (lastAtIndex > 0) {
      const charBefore = text[lastAtIndex - 1];
      if (charBefore !== ' ' && charBefore !== '\n') {
        return null;
      }
    }

    // Get text after @
    const afterAt = text.substring(lastAtIndex + 1, cursorPosition);

    // Check if there's a space after @ (would end the mention)
    if (afterAt.includes(' ') || afterAt.includes('\n')) {
      return null;
    }

    return {
      start: lastAtIndex,
      end: cursorPosition,
      query: afterAt,
    };
  }, []);

  /**
   * Get filtered suggestions based on query
   */
  const getSuggestions = useCallback((query: string): MentionSuggestion[] => {
    if (!query) {
      // Return all users if no query
      return availableUsers.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      }));
    }

    const lowerQuery = query.toLowerCase();
    return availableUsers
      .filter(user =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.role?.toLowerCase().includes(lowerQuery)
      )
      .map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      }));
  }, [availableUsers]);

  /**
   * Current suggestions based on mention query
   */
  const suggestions = useMemo(() => {
    return getSuggestions(mentionQuery);
  }, [mentionQuery, getSuggestions]);

  /**
   * Handle text input change
   */
  const handleInputChange = useCallback((text: string, cursorPosition: number) => {
    const match = detectMention(text, cursorPosition);

    if (match) {
      setMentionQuery(match.query);
      setMentionPosition(match.start);
    } else {
      setMentionQuery('');
      setMentionPosition(null);
    }
  }, [detectMention]);

  /**
   * Insert mention into text
   */
  const insertMention = useCallback((
    text: string,
    suggestion: MentionSuggestion,
    mentionStart: number
  ): { newText: string; newCursorPosition: number } => {
    const beforeMention = text.substring(0, mentionStart);
    const afterMention = text.substring(mentionStart).replace(/^@\S*/, '');

    const mentionText = `@${suggestion.name}`;
    const newText = beforeMention + mentionText + ' ' + afterMention;
    const newCursorPosition = beforeMention.length + mentionText.length + 1;

    return { newText, newCursorPosition };
  }, []);

  /**
   * Extract mentioned user IDs from text
   */
  const extractMentions = useCallback((text: string): string[] => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1];
      const user = availableUsers.find(u => u.name === mentionedName);
      if (user && !mentions.includes(user.id)) {
        mentions.push(user.id);
      }
    }

    return mentions;
  }, [availableUsers]);

  /**
   * Highlight mentions in text (for display)
   */
  const highlightMentions = useCallback((text: string): React.ReactNode[] => {
    const mentionRegex = /(@\w+(?:\s+\w+)*)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Check if this is a valid mention
      const mentionName = match[1].substring(1); // Remove @
      const isValidMention = availableUsers.some(u => u.name === mentionName);

      // Add mention (highlighted or not)
      parts.push(
        <span
          key={match.index}
          className={isValidMention ? 'text-blue-600 font-medium' : ''}
        >
          {match[1]}
        </span>
      );

      lastIndex = match.index + match[1].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  }, [availableUsers]);

  /**
   * Clear mention state
   */
  const clearMentionState = useCallback(() => {
    setMentionQuery('');
    setMentionPosition(null);
  }, []);

  return {
    // State
    mentionQuery,
    mentionPosition,
    suggestions,
    showSuggestions: mentionPosition !== null && suggestions.length > 0,

    // Methods
    handleInputChange,
    insertMention,
    extractMentions,
    highlightMentions,
    clearMentionState,
  };
}
