'use client';

import { Toaster } from 'react-hot-toast';

/**
 * Toast Provider Component
 * Wraps react-hot-toast Toaster with custom styling
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options for all toasts
        duration: 5000,
        style: {
          background: '#ffffff',
          color: '#1f2937',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '400px',
        },
        // Success
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid #10b981',
          },
        },
        // Error
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid #ef4444',
          },
        },
        // Loading
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid #3b82f6',
          },
        },
      }}
    />
  );
}
