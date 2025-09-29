import { useState, useEffect } from 'react';
import { Quote, STORAGE_KEYS } from '@/types';

export const useQuotes = () => {
  const [data, setData] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUOTES);
      if (stored) {
        const quotes = JSON.parse(stored);
        // MIGRATION: Converti phaseId singolo a phaseIds array
        const migratedQuotes = quotes.map(migrateQuoteToMultiPhase);
        setData(migratedQuotes);
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  // MIGRATION: Funzione per convertire preventivi esistenti al nuovo formato multi-fase
  const migrateQuoteToMultiPhase = (quote: any): Quote => {
    // Se già ha phaseIds, è già migrato
    if (quote.phaseIds && Array.isArray(quote.phaseIds)) {
      return quote;
    }

    // Migra da phaseId singolo a phaseIds array
    const migratedQuote: Quote = {
      ...quote,
      phaseIds: quote.phaseId ? [quote.phaseId] : [],
      // Mantieni phaseId per backward compatibility
      phaseId: quote.phaseId,
      // Inizializza phaseBreakdown se non presente
      phaseBreakdown: quote.phaseBreakdown || []
    };

    return migratedQuote;
  };

  const saveQuotes = (quotes: Quote[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
      setData(quotes);
    } catch (error) {
      console.error('Error saving quotes:', error);
    }
  };

  const addQuote = (quote: Omit<Quote, 'id'>) => {
    const newQuote: Quote = {
      ...quote,
      id: Date.now().toString(),
      // Assicura che phaseIds sia sempre un array
      phaseIds: quote.phaseIds || [],
      // Mantieni phaseId per backward compatibility se presente
      phaseId: quote.phaseIds?.[0] || quote.phaseId,
      // Calcola totalAmount automaticamente dalla somma delle fasi
      totalAmount: calculateTotalFromPhases(quote.phaseBreakdown) || quote.totalAmount || 0,
      // Inizializza le proprietà per i pagamenti se non presenti
      paymentTerms: quote.paymentTerms || [],
      payments: quote.payments || [],
      paymentConfig: quote.paymentConfig || {
        vatRate: 22,
        paymentMethod: 'bank_transfer'
      },
      // Inizializza phaseBreakdown
      phaseBreakdown: quote.phaseBreakdown || []
    };
    const updatedQuotes = [...data, newQuote];
    saveQuotes(updatedQuotes);
    return newQuote;
  };

  // Funzione helper per calcolare il totale dalla somma delle fasi
  const calculateTotalFromPhases = (phaseBreakdown?: any[]): number => {
    if (!phaseBreakdown || phaseBreakdown.length === 0) return 0;
    return phaseBreakdown.reduce((total, phase) => total + (phase.subtotal || 0), 0);
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    const updatedQuotes = data.map(quote =>
      quote.id === id ? { ...quote, ...updates } : quote
    );
    saveQuotes(updatedQuotes);
  };

  const deleteQuote = (id: string) => {
    const updatedQuotes = data.filter(quote => quote.id !== id);
    saveQuotes(updatedQuotes);
  };

  const getQuotesByProject = (projectId: string) => {
    return data.filter(quote => quote.projectId === projectId);
  };

  const getQuotesByPhase = (phaseId: string) => {
    return data.filter(quote => quote.phaseId === phaseId);
  };

  const getQuotesByContractor = (contractorId: string) => {
    return data.filter(quote => quote.contractorId === contractorId);
  };

  return {
    data,
    loading,
    addQuote,
    updateQuote,
    deleteQuote,
    getQuotesByProject,
    getQuotesByPhase,
    getQuotesByContractor,
    refresh: loadQuotes
  };
};