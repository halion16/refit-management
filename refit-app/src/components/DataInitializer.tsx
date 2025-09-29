'use client';

import { useEffect } from 'react';
import { initializeSampleData, resetAllData } from '@/lib/sampleData';

export default function DataInitializer() {
  useEffect(() => {
    // Inizializza i dati solo se non esistono
    initializeSampleData();
  }, []);

  // In modalità development, aggiungi un pulsante per resettare i dati
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={resetAllData}
        className="px-3 py-2 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 shadow-lg"
        title="Reset dati di esempio (solo sviluppo)"
      >
        🔄 Reset Dati
      </button>
    </div>
  );
}