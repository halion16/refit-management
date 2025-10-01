'use client';

import { useEffect, useRef, useState } from 'react';
import { AtSign } from 'lucide-react';
import type { MentionSuggestion } from '@/hooks/useMentions';

interface MentionAutocompleteProps {
  suggestions: MentionSuggestion[];
  onSelect: (suggestion: MentionSuggestion) => void;
  position?: { top: number; left: number } | null;
  maxSuggestions?: number;
}

export function MentionAutocomplete({
  suggestions,
  onSelect,
  position,
  maxSuggestions = 5,
}: MentionAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % Math.min(suggestions.length, maxSuggestions));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + Math.min(suggestions.length, maxSuggestions)) % Math.min(suggestions.length, maxSuggestions));
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          // Let parent handle escape
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, selectedIndex, onSelect, maxSuggestions]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (suggestions.length === 0) return null;

  const displayedSuggestions = suggestions.slice(0, maxSuggestions);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      ref={listRef}
      className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-y-auto"
      style={position ? { top: position.top, left: position.left } : { bottom: '100%', left: 0, marginBottom: '4px' }}
    >
      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
        <AtSign className="h-3 w-3 inline mr-1" />
        Menzioni
      </div>

      {displayedSuggestions.map((suggestion, index) => (
        <button
          key={suggestion.id}
          onClick={() => onSelect(suggestion)}
          className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
            index === selectedIndex ? 'bg-blue-50' : ''
          }`}
        >
          {/* Avatar */}
          {suggestion.avatar ? (
            <img
              src={suggestion.avatar}
              alt={suggestion.name}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600 flex-shrink-0">
              {getInitials(suggestion.name)}
            </div>
          )}

          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 truncate">
              {suggestion.name}
            </div>
            {suggestion.role && (
              <div className="text-xs text-gray-500 truncate">
                {suggestion.role}
              </div>
            )}
          </div>

          {/* Selected indicator */}
          {index === selectedIndex && (
            <div className="text-blue-600 text-xs font-medium">
              Enter
            </div>
          )}
        </button>
      ))}

      {suggestions.length > maxSuggestions && (
        <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100">
          +{suggestions.length - maxSuggestions} altri
        </div>
      )}
    </div>
  );
}
