import { useState, useEffect } from 'react';
import { Contractor, STORAGE_KEYS } from '@/types';

export const useContractors = () => {
  const [data, setData] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContractors();
  }, []);

  const loadContractors = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONTRACTORS);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading contractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContractors = (contractors: Contractor[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTRACTORS, JSON.stringify(contractors));
      setData(contractors);
    } catch (error) {
      console.error('Error saving contractors:', error);
    }
  };

  const addContractor = (contractor: Omit<Contractor, 'id'>) => {
    const newContractor: Contractor = {
      ...contractor,
      id: Date.now().toString(),
    };
    const updatedContractors = [...data, newContractor];
    saveContractors(updatedContractors);
    return newContractor;
  };

  const updateContractor = (id: string, updates: Partial<Contractor>) => {
    const updatedContractors = data.map(contractor =>
      contractor.id === id ? { ...contractor, ...updates } : contractor
    );
    saveContractors(updatedContractors);
  };

  const deleteContractor = (id: string) => {
    const updatedContractors = data.filter(contractor => contractor.id !== id);
    saveContractors(updatedContractors);
  };

  return {
    data,
    loading,
    addContractor,
    updateContractor,
    deleteContractor,
    refresh: loadContractors
  };
};