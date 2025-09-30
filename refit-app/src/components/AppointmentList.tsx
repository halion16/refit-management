'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Calendar, Clock } from 'lucide-react';
import { Appointment, AppointmentType, AppointmentStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentForm } from './AppointmentForm';
import { useAppointments } from '@/hooks/useAppointments';
import { useProjects } from '@/hooks/useProjects';

export function AppointmentList() {
  const {
    appointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    completeAppointment,
  } = useAppointments();

  const { projects = [] } = useProjects();

  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AppointmentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'upcoming' | 'all' | 'today'>('upcoming');

  // Filter and search appointments
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Filter by view mode
    if (viewMode === 'upcoming') {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

      filtered = filtered.filter(apt => {
        if (apt.status === 'cancelled' || apt.status === 'completed') return false;
        if (apt.scheduledDate > today) return true;
        if (apt.scheduledDate === today && apt.startTime >= currentTime) return true;
        return false;
      });
    } else if (viewMode === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(apt =>
        apt.scheduledDate === today && apt.status !== 'cancelled'
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(apt => apt.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    // Filter by project
    if (filterProject !== 'all') {
      filtered = filtered.filter(apt => apt.projectId === filterProject);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.title.toLowerCase().includes(query) ||
        apt.description?.toLowerCase().includes(query)
      );
    }

    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [appointments, searchQuery, filterType, filterStatus, filterProject, viewMode]);

  const handleSave = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingAppointment) {
      await updateAppointment(editingAppointment.id, appointmentData);
    } else {
      await addAppointment(appointmentData);
    }
    setShowForm(false);
    setEditingAppointment(undefined);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleCancel = async (appointment: Appointment) => {
    if (confirm('Sei sicuro di voler cancellare questo appuntamento?')) {
      await cancelAppointment(appointment.id, 'Cancellato dall\'utente', 'current-user');
    }
  };

  const handleComplete = async (appointment: Appointment) => {
    await completeAppointment(appointment.id);
  };

  const handleDelete = async (appointment: Appointment) => {
    if (confirm('Sei sicuro di voler eliminare definitivamente questo appuntamento?')) {
      await deleteAppointment(appointment.id);
    }
  };

  // Group appointments by date
  const groupedAppointments = useMemo(() => {
    const groups: Record<string, Appointment[]> = {};

    filteredAppointments.forEach(apt => {
      if (!groups[apt.scheduledDate]) {
        groups[apt.scheduledDate] = [];
      }
      groups[apt.scheduledDate].push(apt);
    });

    return groups;
  }, [filteredAppointments]);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (dateString === today) return 'Oggi';
    if (dateString === tomorrow) return 'Domani';

    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caricamento appuntamenti...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appuntamenti</h1>
          <p className="text-gray-600 mt-1">
            {filteredAppointments.length} appuntament{filteredAppointments.length === 1 ? 'o' : 'i'}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingAppointment(undefined);
            setShowForm(true);
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuovo Appuntamento
        </Button>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setViewMode('upcoming')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            viewMode === 'upcoming'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          In Arrivo
        </button>
        <button
          onClick={() => setViewMode('today')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            viewMode === 'today'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Oggi
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            viewMode === 'all'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Tutti
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filtri</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca appuntamenti..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AppointmentType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti i tipi</option>
            <option value="meeting">Riunione</option>
            <option value="site_visit">Sopralluogo</option>
            <option value="client_call">Chiamata Cliente</option>
            <option value="inspection">Ispezione</option>
            <option value="deadline">Scadenza</option>
            <option value="milestone">Milestone</option>
            <option value="contractor_meeting">Meeting Fornitore</option>
            <option value="internal_review">Revisione Interna</option>
            <option value="other">Altro</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as AppointmentStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti gli stati</option>
            <option value="scheduled">Programmato</option>
            <option value="confirmed">Confermato</option>
            <option value="completed">Completato</option>
            <option value="cancelled">Cancellato</option>
            <option value="no_show">Non Presentato</option>
          </select>

          {/* Project Filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti i progetti</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun appuntamento trovato
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'Prova a modificare i filtri di ricerca'
              : 'Inizia creando il tuo primo appuntamento'}
          </p>
          {!searchQuery && filterType === 'all' && filterStatus === 'all' && (
            <Button
              variant="primary"
              onClick={() => {
                setEditingAppointment(undefined);
                setShowForm(true);
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Crea Appuntamento
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200"></div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  {formatDateHeader(date)}
                </h3>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {dateAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onView={handleEdit}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <AppointmentForm
          appointment={editingAppointment}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingAppointment(undefined);
          }}
        />
      )}
    </div>
  );
}