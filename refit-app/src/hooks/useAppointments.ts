import { useState, useEffect, useCallback } from 'react';
import { Appointment, STORAGE_KEYS } from '@/types';

interface UseAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;

  // CRUD Operations
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Appointment>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getAppointment: (id: string) => Appointment | undefined;

  // Filter Operations
  getAppointmentsByProject: (projectId: string) => Appointment[];
  getAppointmentsByPhase: (phaseId: string) => Appointment[];
  getAppointmentsByLocation: (locationId: string) => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByDateRange: (startDate: string, endDate: string) => Appointment[];
  getAppointmentsByType: (type: Appointment['type']) => Appointment[];
  getAppointmentsByStatus: (status: Appointment['status']) => Appointment[];
  getUpcomingAppointments: (limit?: number) => Appointment[];
  getTodayAppointments: () => Appointment[];

  // Status Operations
  confirmAppointment: (id: string) => Promise<void>;
  cancelAppointment: (id: string, reason?: string, cancelledBy?: string) => Promise<void>;
  completeAppointment: (id: string, outcomes?: string) => Promise<void>;

  // Utility
  refreshAppointments: () => void;
}

export function useAppointments(): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load appointments from localStorage
  const loadAppointments = useCallback(() => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAppointments(parsed);
      } else {
        setAppointments([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load appointments');
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save appointments to localStorage
  const saveAppointments = useCallback((appointmentsToSave: Appointment[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointmentsToSave));
      setAppointments(appointmentsToSave);
    } catch (err) {
      setError('Failed to save appointments');
      console.error('Error saving appointments:', err);
      throw err;
    }
  }, []);

  // Initialize
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Generate unique ID
  const generateId = () => `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add appointment
  const addAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      ...appointmentData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...appointments, newAppointment];
    saveAppointments(updated);
    return newAppointment;
  }, [appointments, saveAppointments]);

  // Update appointment
  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    const updated = appointments.map(apt =>
      apt.id === id
        ? { ...apt, ...updates, updatedAt: new Date().toISOString() }
        : apt
    );
    saveAppointments(updated);
  }, [appointments, saveAppointments]);

  // Delete appointment
  const deleteAppointment = useCallback(async (id: string) => {
    const updated = appointments.filter(apt => apt.id !== id);
    saveAppointments(updated);
  }, [appointments, saveAppointments]);

  // Get single appointment
  const getAppointment = useCallback((id: string) => {
    return appointments.find(apt => apt.id === id);
  }, [appointments]);

  // Filter by project
  const getAppointmentsByProject = useCallback((projectId: string) => {
    return appointments.filter(apt => apt.projectId === projectId);
  }, [appointments]);

  // Filter by phase
  const getAppointmentsByPhase = useCallback((phaseId: string) => {
    return appointments.filter(apt => apt.phaseId === phaseId);
  }, [appointments]);

  // Filter by location
  const getAppointmentsByLocation = useCallback((locationId: string) => {
    return appointments.filter(apt => apt.locationId === locationId);
  }, [appointments]);

  // Filter by date
  const getAppointmentsByDate = useCallback((date: string) => {
    return appointments.filter(apt => apt.scheduledDate === date);
  }, [appointments]);

  // Filter by date range
  const getAppointmentsByDateRange = useCallback((startDate: string, endDate: string) => {
    return appointments.filter(apt =>
      apt.scheduledDate >= startDate && apt.scheduledDate <= endDate
    ).sort((a, b) => {
      const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [appointments]);

  // Filter by type
  const getAppointmentsByType = useCallback((type: Appointment['type']) => {
    return appointments.filter(apt => apt.type === type);
  }, [appointments]);

  // Filter by status
  const getAppointmentsByStatus = useCallback((status: Appointment['status']) => {
    return appointments.filter(apt => apt.status === status);
  }, [appointments]);

  // Get upcoming appointments
  const getUpcomingAppointments = useCallback((limit?: number) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    const upcoming = appointments
      .filter(apt => {
        if (apt.status === 'cancelled' || apt.status === 'completed') return false;
        if (apt.scheduledDate > today) return true;
        if (apt.scheduledDate === today && apt.startTime >= currentTime) return true;
        return false;
      })
      .sort((a, b) => {
        const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });

    return limit ? upcoming.slice(0, limit) : upcoming;
  }, [appointments]);

  // Get today's appointments
  const getTodayAppointments = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.scheduledDate === today && apt.status !== 'cancelled')
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments]);

  // Confirm appointment
  const confirmAppointment = useCallback(async (id: string) => {
    await updateAppointment(id, { status: 'confirmed' });
  }, [updateAppointment]);

  // Cancel appointment
  const cancelAppointment = useCallback(async (id: string, reason?: string, cancelledBy?: string) => {
    const updates: Partial<Appointment> = {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
      cancelledBy: cancelledBy,
    };
    await updateAppointment(id, updates);
  }, [updateAppointment]);

  // Complete appointment
  const completeAppointment = useCallback(async (id: string, outcomes?: string) => {
    const updates: Partial<Appointment> = {
      status: 'completed',
      outcomes: outcomes,
    };
    await updateAppointment(id, updates);
  }, [updateAppointment]);

  // Refresh
  const refreshAppointments = useCallback(() => {
    loadAppointments();
  }, [loadAppointments]);

  return {
    appointments,
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointment,
    getAppointmentsByProject,
    getAppointmentsByPhase,
    getAppointmentsByLocation,
    getAppointmentsByDate,
    getAppointmentsByDateRange,
    getAppointmentsByType,
    getAppointmentsByStatus,
    getUpcomingAppointments,
    getTodayAppointments,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    refreshAppointments,
  };
}