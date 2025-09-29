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
        setData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
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
      // Inizializza le proprietà per i pagamenti se non presenti
      paymentTerms: quote.paymentTerms || [],
      payments: quote.payments || [],
      paymentConfig: quote.paymentConfig || {
        vatRate: 22,
        paymentMethod: 'bank_transfer'
      }
    };
    const updatedQuotes = [...data, newQuote];
    saveQuotes(updatedQuotes);
    return newQuote;
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