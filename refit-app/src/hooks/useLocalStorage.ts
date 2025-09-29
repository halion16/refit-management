// CUSTOM HOOKS FOR LOCALSTORAGE MANAGEMENT

import { useState, useEffect, useCallback } from 'react';
import { LocalStorageManager } from '@/lib/localStorage';
import { STORAGE_KEYS, type StorageKey } from '@/types';

/**
 * Generic hook for localStorage array operations
 */
export function useLocalStorageArray<T extends { id: string; updatedAt?: string }>(
  key: StorageKey
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    try {
      const items = LocalStorageManager.get<T>(key);
      setData(items);
      setError(null);
    } catch (err) {
      setError(`Failed to load ${key}: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [key]);

  // Add item
  const addItem = useCallback((item: T) => {
    const newItem = {
      ...item,
      id: item.id || LocalStorageManager.generateId(),
      updatedAt: new Date().toISOString()
    };

    if (LocalStorageManager.add(key, newItem)) {
      setData(prev => [...prev, newItem]);
      return newItem;
    }
    throw new Error(`Failed to add item to ${key}`);
  }, [key]);

  // Update item
  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    if (LocalStorageManager.update<T>(key, id, updates)) {
      setData(prev => prev.map(item =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      ));
      return true;
    }
    return false;
  }, [key]);

  // Delete item
  const deleteItem = useCallback((id: string) => {
    if (LocalStorageManager.delete<T>(key, id)) {
      setData(prev => prev.filter(item => item.id !== id));
      return true;
    }
    return false;
  }, [key]);

  // Find item by ID
  const findById = useCallback((id: string): T | undefined => {
    return data.find(item => item.id === id);
  }, [data]);

  // Refresh data from localStorage
  const refresh = useCallback(() => {
    setLoading(true);
    try {
      const items = LocalStorageManager.get<T>(key);
      setData(items);
      setError(null);
    } catch (err) {
      setError(`Failed to refresh ${key}: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [key]);

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    findById,
    refresh,
    count: data.length
  };
}

/**
 * Hook for managing locations
 */
export function useLocations() {
  return useLocalStorageArray(STORAGE_KEYS.LOCATIONS);
}

/**
 * Hook for managing projects
 */
export function useProjects() {
  const result = useLocalStorageArray(STORAGE_KEYS.PROJECTS);

  // Additional project-specific methods
  const getProjectsByLocation = useCallback((locationId: string) => {
    return result.data.filter(project => project.locationId === locationId);
  }, [result.data]);

  const getProjectsByStatus = useCallback((status: string) => {
    return result.data.filter(project => project.status === status);
  }, [result.data]);

  return {
    ...result,
    getProjectsByLocation,
    getProjectsByStatus
  };
}

/**
 * Hook for managing contractors
 */
export function useContractors() {
  const result = useLocalStorageArray(STORAGE_KEYS.CONTRACTORS);

  // Additional contractor-specific methods
  const getActiveContractors = useCallback(() => {
    return result.data.filter(contractor => contractor.status === 'active');
  }, [result.data]);

  const getContractorsBySpecialization = useCallback((specialization: string) => {
    return result.data.filter(contractor =>
      contractor.specializations.includes(specialization)
    );
  }, [result.data]);

  return {
    ...result,
    getActiveContractors,
    getContractorsBySpecialization
  };
}

/**
 * Hook for managing quotes
 */
export function useQuotes() {
  const result = useLocalStorageArray(STORAGE_KEYS.QUOTES);

  // Additional quote-specific methods
  const getQuotesByProject = useCallback((projectId: string) => {
    return result.data.filter(quote => quote.projectId === projectId);
  }, [result.data]);

  const getQuotesByContractor = useCallback((contractorId: string) => {
    return result.data.filter(quote => quote.contractorId === contractorId);
  }, [result.data]);

  const getPendingQuotes = useCallback(() => {
    return result.data.filter(quote =>
      ['sent', 'received', 'under_review'].includes(quote.status)
    );
  }, [result.data]);

  return {
    ...result,
    getQuotesByProject,
    getQuotesByContractor,
    getPendingQuotes
  };
}

/**
 * Hook for storage management and utilities
 */
export function useStorageManager() {
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 0,
    percentage: 0,
    keys: [] as { key: string; size: number }[]
  });

  const refreshStorageInfo = useCallback(() => {
    setStorageInfo(LocalStorageManager.getStorageInfo());
  }, []);

  const exportData = useCallback(() => {
    return LocalStorageManager.exportData();
  }, []);

  const importData = useCallback((jsonData: string) => {
    return LocalStorageManager.importData(jsonData);
  }, []);

  const validateData = useCallback(() => {
    return LocalStorageManager.validateData();
  }, []);

  const clearAllData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => {
      LocalStorageManager.clear(key);
    });
  }, []);

  useEffect(() => {
    refreshStorageInfo();
  }, [refreshStorageInfo]);

  return {
    storageInfo,
    refreshStorageInfo,
    exportData,
    importData,
    validateData,
    clearAllData
  };
}

/**
 * Hook for user session management
 */
export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((user: any) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((updates: any) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    }
  }, [currentUser]);

  return {
    currentUser,
    loading,
    login,
    logout,
    updateProfile,
    isLoggedIn: !!currentUser
  };
}