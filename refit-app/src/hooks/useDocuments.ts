import { useState, useEffect } from 'react';
import { Document, STORAGE_KEYS } from '@/types';

export const useDocuments = () => {
  const [data, setData] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDocuments = (documents: Document[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
      setData(documents);
    } catch (error) {
      console.error('Error saving documents:', error);
    }
  };

  const addDocument = (document: Omit<Document, 'id'>) => {
    const newDocument: Document = {
      ...document,
      id: Date.now().toString(),
    };
    const updatedDocuments = [...data, newDocument];
    saveDocuments(updatedDocuments);
    return newDocument;
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    const updatedDocuments = data.map(document =>
      document.id === id ? { ...document, ...updates } : document
    );
    saveDocuments(updatedDocuments);
  };

  const deleteDocument = (id: string) => {
    const updatedDocuments = data.filter(document => document.id !== id);
    saveDocuments(updatedDocuments);
  };

  const getDocumentsByRelated = (type: Document['relatedTo']['type'], id: string) => {
    return data.filter(doc => doc.relatedTo.type === type && doc.relatedTo.id === id && doc.isActive);
  };

  const getDocumentsByQuote = (quoteId: string) => {
    return getDocumentsByRelated('quote', quoteId);
  };

  return {
    data,
    loading,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByRelated,
    getDocumentsByQuote,
    refresh: loadDocuments
  };
};