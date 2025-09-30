'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, MapPin, Video, Bell } from 'lucide-react';
import { Appointment, AppointmentType, Participant, AppointmentLocation } from '@/types';
import { Button } from '@/components/ui/Button';
import { useProjects } from '@/hooks/useProjects';
import { useLocations } from '@/hooks/useLocations';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSave: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const appointmentTypes: { value: AppointmentType; label: string }[] = [
  { value: 'meeting', label: 'Riunione' },
  { value: 'site_visit', label: 'Sopralluogo' },
  { value: 'client_call', label: 'Chiamata Cliente' },
  { value: 'inspection', label: 'Ispezione' },
  { value: 'deadline', label: 'Scadenza' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'contractor_meeting', label: 'Meeting Fornitore' },
  { value: 'internal_review', label: 'Revisione Interna' },
  { value: 'other', label: 'Altro' },
];

export function AppointmentForm({ appointment, onSave, onCancel }: AppointmentFormProps) {
  const { projects = [] } = useProjects();
  const { locations = [] } = useLocations();

  const [formData, setFormData] = useState({
    title: appointment?.title || '',
    description: appointment?.description || '',
    type: appointment?.type || 'meeting' as AppointmentType,
    scheduledDate: appointment?.scheduledDate || new Date().toISOString().split('T')[0],
    startTime: appointment?.startTime || '09:00',
    endTime: appointment?.endTime || '10:00',
    allDay: appointment?.allDay || false,
    projectId: appointment?.projectId || '',
    phaseId: appointment?.phaseId || '',
    locationId: appointment?.locationId || '',
    status: appointment?.status || 'scheduled' as const,
    priority: appointment?.priority || 'medium' as const,
    notes: appointment?.notes || '',
    agenda: appointment?.agenda || '',
  });

  const [locationType, setLocationType] = useState<'physical' | 'virtual'>(
    appointment?.location?.type || 'physical'
  );
  const [locationData, setLocationData] = useState<Partial<AppointmentLocation>>({
    address: appointment?.location?.address || '',
    meetingLink: appointment?.location?.meetingLink || '',
    roomNumber: appointment?.location?.roomNumber || '',
    notes: appointment?.location?.notes || '',
  });

  const [participants, setParticipants] = useState<Participant[]>(
    appointment?.participants || []
  );

  const [reminderEnabled, setReminderEnabled] = useState(
    appointment?.reminder?.enabled || false
  );
  const [reminderMinutes, setReminderMinutes] = useState(
    appointment?.reminder?.minutesBefore || 30
  );

  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    type: 'internal' as const,
    required: true,
  });

  const selectedProject = projects.find(p => p.id === formData.projectId);
  const availablePhases = selectedProject?.phases || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      projectId: formData.projectId || undefined,
      phaseId: formData.phaseId || undefined,
      locationId: formData.locationId || undefined,
      location: {
        type: locationType,
        ...locationData,
      },
      participants,
      organizer: 'current-user', // TODO: Get from auth context
      createdBy: 'current-user',
      reminder: reminderEnabled ? {
        enabled: true,
        minutesBefore: reminderMinutes,
      } : undefined,
    };

    onSave(appointmentData);
  };

  const addParticipant = () => {
    if (newParticipant.name && newParticipant.email) {
      setParticipants([...participants, { ...newParticipant }]);
      setNewParticipant({ name: '', email: '', type: 'internal', required: true });
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {appointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Es: Riunione con il cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descrizione dell'appuntamento..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as AppointmentType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {appointmentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorità
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Bassa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="scheduled">Programmato</option>
                  <option value="confirmed">Confermato</option>
                  <option value="completed">Completato</option>
                  <option value="cancelled">Cancellato</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900">Data e Orario</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ora Inizio *
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ora Fine *
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900">Luogo</h3>

            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setLocationType('physical')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  locationType === 'physical'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                }`}
              >
                <MapPin className="h-4 w-4" />
                Fisico
              </button>
              <button
                type="button"
                onClick={() => setLocationType('virtual')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  locationType === 'virtual'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                }`}
              >
                <Video className="h-4 w-4" />
                Virtuale
              </button>
            </div>

            {locationType === 'physical' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    value={locationData.address || ''}
                    onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Via, Città"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stanza/Piano
                  </label>
                  <input
                    type="text"
                    value={locationData.roomNumber || ''}
                    onChange={(e) => setLocationData({ ...locationData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Es: Sala Riunioni 1, Piano 2"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Meeting
                </label>
                <input
                  type="url"
                  value={locationData.meetingLink || ''}
                  onChange={(e) => setLocationData({ ...locationData, meetingLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://meet.google.com/..."
                />
              </div>
            )}
          </div>

          {/* Project Association */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900">Collegamento Progetto (opzionale)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progetto
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value, phaseId: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Nessun progetto</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.projectId && availablePhases.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fase
                  </label>
                  <select
                    value={formData.phaseId}
                    onChange={(e) => setFormData({ ...formData, phaseId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Nessuna fase specifica</option>
                    {availablePhases.map(phase => (
                      <option key={phase.id} value={phase.id}>
                        {phase.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900">Partecipanti</h3>

            {/* Participant List */}
            {participants.length > 0 && (
              <div className="space-y-2 mb-4">
                {participants.map((p, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-gray-600">{p.email}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      p.required ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {p.required ? 'Richiesto' : 'Opzionale'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Participant */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                placeholder="Nome"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                value={newParticipant.email}
                onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                placeholder="Email"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <select
                value={newParticipant.required ? 'required' : 'optional'}
                onChange={(e) => setNewParticipant({ ...newParticipant, required: e.target.value === 'required' })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="required">Richiesto</option>
                <option value="optional">Opzionale</option>
              </select>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addParticipant}
              >
                <Plus className="h-4 w-4 mr-1" />
                Aggiungi
              </Button>
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reminder"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="reminder" className="font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Promemoria
              </label>
            </div>

            {reminderEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avvisa prima di
                </label>
                <select
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="15">15 minuti</option>
                  <option value="30">30 minuti</option>
                  <option value="60">1 ora</option>
                  <option value="120">2 ore</option>
                  <option value="1440">1 giorno</option>
                </select>
              </div>
            )}
          </div>

          {/* Notes & Agenda */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agenda
              </label>
              <textarea
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Punti all'ordine del giorno..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Note aggiuntive..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit" variant="primary">
              {appointment ? 'Salva Modifiche' : 'Crea Appuntamento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}