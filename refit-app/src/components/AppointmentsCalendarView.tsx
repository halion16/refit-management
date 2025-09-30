'use client';

import { useMemo } from 'react';
import { Calendar, Clock, MapPin, Video, Users } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { Appointment } from '@/types';

interface AppointmentsCalendarViewProps {
  currentDate: Date;
}

const appointmentTypeColors: Record<Appointment['type'], string> = {
  meeting: 'border-l-blue-500 bg-blue-50',
  site_visit: 'border-l-green-500 bg-green-50',
  client_call: 'border-l-purple-500 bg-purple-50',
  inspection: 'border-l-orange-500 bg-orange-50',
  deadline: 'border-l-red-500 bg-red-50',
  milestone: 'border-l-yellow-500 bg-yellow-50',
  contractor_meeting: 'border-l-indigo-500 bg-indigo-50',
  internal_review: 'border-l-gray-500 bg-gray-50',
  other: 'border-l-gray-400 bg-gray-50'
};

const appointmentTypeLabels: Record<Appointment['type'], string> = {
  meeting: 'Riunione',
  site_visit: 'Sopralluogo',
  client_call: 'Chiamata',
  inspection: 'Ispezione',
  deadline: 'Scadenza',
  milestone: 'Milestone',
  contractor_meeting: 'Meeting Fornitore',
  internal_review: 'Revisione',
  other: 'Altro'
};

export function AppointmentsCalendarView({ currentDate }: AppointmentsCalendarViewProps) {
  const { getAppointmentsByDateRange } = useAppointments();

  // Get appointments for current month
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const monthAppointments = useMemo(() => {
    const startStr = monthStart.toISOString().split('T')[0];
    const endStr = monthEnd.toISOString().split('T')[0];
    return getAppointmentsByDateRange(startStr, endStr);
  }, [currentDate, getAppointmentsByDateRange]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Appointment[]> = {};
    monthAppointments.forEach(apt => {
      if (!groups[apt.scheduledDate]) {
        groups[apt.scheduledDate] = [];
      }
      groups[apt.scheduledDate].push(apt);
    });
    return groups;
  }, [monthAppointments]);

  const formatTime = (time: string) => time.substring(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Oggi';
    if (dateStr === tomorrow) return 'Domani';

    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  if (monthAppointments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Appuntamenti del Mese</h3>
        </div>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nessun appuntamento programmato per questo mese</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Appuntamenti del Mese</h3>
        </div>
        <div className="text-sm text-gray-600">
          {monthAppointments.length} appuntament{monthAppointments.length === 1 ? 'o' : 'i'}
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedByDate)
          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
          .map(([date, appointments]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-gray-200"></div>
                <h4 className="text-sm font-semibold text-gray-700">
                  {formatDate(date)}
                </h4>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>

              <div className="space-y-2">
                {appointments
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(apt => (
                    <div
                      key={apt.id}
                      className={`border-l-4 rounded-r-lg p-3 hover:shadow-md transition-shadow ${
                        appointmentTypeColors[apt.type]
                      } ${apt.status === 'cancelled' ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-600 px-2 py-0.5 bg-white rounded">
                              {appointmentTypeLabels[apt.type]}
                            </span>
                            {apt.priority === 'high' && (
                              <span className="text-xs font-medium text-red-600 px-2 py-0.5 bg-red-100 rounded">
                                Alta Priorità
                              </span>
                            )}
                            {apt.status === 'cancelled' && (
                              <span className="text-xs font-medium text-gray-600 px-2 py-0.5 bg-gray-200 rounded line-through">
                                Cancellato
                              </span>
                            )}
                          </div>

                          <h5 className="font-semibold text-gray-900 mb-1">{apt.title}</h5>

                          {apt.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                              {apt.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                            </span>

                            {apt.location && (
                              <span className="flex items-center gap-1">
                                {apt.location.type === 'physical' ? (
                                  <>
                                    <MapPin className="h-3.5 w-3.5" />
                                    {apt.location.address ? (
                                      <span className="truncate max-w-[200px]">
                                        {apt.location.address}
                                      </span>
                                    ) : (
                                      'Sede'
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <Video className="h-3.5 w-3.5" />
                                    Online
                                  </>
                                )}
                              </span>
                            )}

                            {apt.participants.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {apt.participants.length} partecipant
                                {apt.participants.length === 1 ? 'e' : 'i'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}