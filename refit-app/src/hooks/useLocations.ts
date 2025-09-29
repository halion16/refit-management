import { useState, useEffect } from 'react';
import { Location, STORAGE_KEYS } from '@/types';

export const useLocations = () => {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveLocations = (locations: Location[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
      setData(locations);
    } catch (error) {
      console.error('Error saving locations:', error);
    }
  };

  const addLocation = (location: Omit<Location, 'id'>) => {
    const newLocation: Location = {
      ...location,
      id: Date.now().toString(),
    };
    const updatedLocations = [...data, newLocation];
    saveLocations(updatedLocations);
    return newLocation;
  };

  const updateLocation = (id: string, updates: Partial<Location>) => {
    const updatedLocations = data.map(location =>
      location.id === id ? { ...location, ...updates } : location
    );
    saveLocations(updatedLocations);
  };

  const deleteLocation = (id: string) => {
    const updatedLocations = data.filter(location => location.id !== id);
    saveLocations(updatedLocations);
  };

  return {
    data,
    loading,
    addLocation,
    updateLocation,
    deleteLocation,
    refresh: loadLocations
  };
};