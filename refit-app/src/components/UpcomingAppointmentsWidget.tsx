'use client';

import { Calendar, Clock, MapPin, Video, ChevronRight } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { useSetCurrentView } from '@/store';
import { Appointment } from '@/types';

const appointmentTypeColors: Record<Appointment['type'], string> = {
  meeting: 'bg-blue-100 text-blue-700',
  site_visit: 'bg-green-100 text-green-700',
  client_call: 'bg-purple-100 text-purple-700',
  inspection: 'bg-orange-100 text-orange-700',
  deadline: 'bg-red-100 text-red-700',
  milestone: 'bg-yellow-100 text-yellow-700',
  contractor_meeting: 'bg-indigo-100 text-indigo-700',
  internal_review: 'bg-gray-100 text-gray-700',
  other: 'bg-gray-100 text-gray-700'
};

const appointmentTypeLabels: Record<Appointment['type'], string> = {
  meeting: 'Riunione',
  site_visit: 'Sopralluogo',
  client_call: 'Chiamata',
  inspection: 'Ispezione',
  deadline: 'Scadenza',
  milestone: 'Milestone',
  contractor_meeting: 'Meeting',
  internal_review: 'Revisione',
  other: 'Altro'
};

export function UpcomingAppointmentsWidget() {
  const { getUpcomingAppointments } = useAppointments();
  const setCurrentView = useSetCurrentView();

  const upcomingAppointments = getUpcomingAppointments(5);

  const formatTime = (time: string) => time.substring(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Oggi';
    if (dateStr === tomorrow) return 'Domani';

    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Prossimi Appuntamenti
        </h3>
        <button
          onClick={() => setCurrentView('appointments')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Vedi tutti
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {upcomingAppointments.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Nessun appuntamento programmato</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingAppointments.map(apt => (
            <div
              key={apt.id}
              className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => setCurrentView('appointments')}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${appointmentTypeColors[apt.type]}`}>
                      {appointmentTypeLabels[apt.type]}
                    </span>
                    {apt.priority === 'high' && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                    {apt.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="h-3 w-3" />
                  {formatDate(apt.scheduledDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(apt.startTime)}
                </span>
                {apt.location && (
                  <span className="flex items-center gap-1">
                    {apt.location.type === 'physical' ? (
                      <MapPin className="h-3 w-3" />
                    ) : (
                      <Video className="h-3 w-3" />
                    )}
                    {apt.location.type === 'physical' ? 'Sede' : 'Online'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}