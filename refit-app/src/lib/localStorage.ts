// LOCALSTORAGE UTILITY FUNCTIONS

import { STORAGE_KEYS, type StorageKey } from '@/types';

export class LocalStorageManager {
  /**
   * Get data from localStorage with type safety
   */
  static get<T>(key: StorageKey): T[] {
    try {
      if (typeof window === 'undefined') return [];

      const data = localStorage.getItem(key);
      if (!data) return [];

      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return [];
    }
  }

  /**
   * Set data to localStorage
   */
  static set<T>(key: StorageKey, data: T[]): boolean {
    try {
      if (typeof window === 'undefined') return false;

      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error);
      return false;
    }
  }

  /**
   * Add item to array in localStorage
   */
  static add<T extends { id: string }>(key: StorageKey, item: T): boolean {
    try {
      const items = this.get<T>(key);
      items.push(item);
      return this.set(key, items);
    } catch (error) {
      console.error(`Error adding item to localStorage key ${key}:`, error);
      return false;
    }
  }

  /**
   * Update item in localStorage by ID
   */
  static update<T extends { id: string; updatedAt?: string }>(
    key: StorageKey,
    id: string,
    updates: Partial<T>
  ): boolean {
    try {
      const items = this.get<T>(key);
      const index = items.findIndex(item => item.id === id);

      if (index === -1) return false;

      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      return this.set(key, items);
    } catch (error) {
      console.error(`Error updating item in localStorage key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete item from localStorage by ID
   */
  static delete<T extends { id: string }>(key: StorageKey, id: string): boolean {
    try {
      const items = this.get<T>(key);
      const filtered = items.filter(item => item.id !== id);
      return this.set(key, filtered);
    } catch (error) {
      console.error(`Error deleting item from localStorage key ${key}:`, error);
      return false;
    }
  }

  /**
   * Find item by ID
   */
  static findById<T extends { id: string }>(key: StorageKey, id: string): T | null {
    try {
      const items = this.get<T>(key);
      return items.find(item => item.id === id) || null;
    } catch (error) {
      console.error(`Error finding item in localStorage key ${key}:`, error);
      return null;
    }
  }

  /**
   * Clear all data for a specific key
   */
  static clear(key: StorageKey): boolean {
    try {
      if (typeof window === 'undefined') return false;

      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error clearing localStorage key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  static getStorageInfo(): {
    used: number;
    total: number;
    percentage: number;
    keys: { key: string; size: number }[];
  } {
    if (typeof window === 'undefined') {
      return { used: 0, total: 0, percentage: 0, keys: [] };
    }

    const keys: { key: string; size: number }[] = [];
    let totalSize = 0;

    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage[key].length;
        keys.push({ key, size });
        totalSize += size;
      }
    }

    // Estimate total available (usually ~5-10MB)
    const estimatedTotal = 5 * 1024 * 1024; // 5MB

    return {
      used: totalSize,
      total: estimatedTotal,
      percentage: (totalSize / estimatedTotal) * 100,
      keys: keys.sort((a, b) => b.size - a.size)
    };
  }

  /**
   * Export all refit data for backup
   */
  static exportData(): string {
    const data: Record<string, any> = {};

    Object.values(STORAGE_KEYS).forEach(key => {
      data[key] = this.get(key);
    });

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      version: '1.0',
      data
    }, null, 2);
  }

  /**
   * Import data from backup
   */
  static importData(jsonData: string): boolean {
    try {
      const backup = JSON.parse(jsonData);

      if (!backup.data) {
        throw new Error('Invalid backup format');
      }

      Object.entries(backup.data).forEach(([key, value]) => {
        if (Object.values(STORAGE_KEYS).includes(key as StorageKey)) {
          this.set(key as StorageKey, value as any[]);
        }
      });

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Generate unique ID
   */
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate data integrity
   */
  static validateData(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if all keys exist and are valid JSON
      Object.values(STORAGE_KEYS).forEach(key => {
        try {
          const data = this.get(key);
          if (!Array.isArray(data)) {
            errors.push(`${key}: Data is not an array`);
          }
        } catch (error) {
          errors.push(`${key}: Invalid JSON data`);
        }
      });

      // Check storage usage
      const storageInfo = this.getStorageInfo();
      if (storageInfo.percentage > 90) {
        warnings.push('Storage usage is above 90%');
      }

      // TODO: Add more specific validation rules
      // - Check for orphaned references
      // - Validate required fields
      // - Check date formats

    } catch (error) {
      errors.push(`Validation error: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}