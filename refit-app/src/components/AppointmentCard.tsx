'use client';

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Appointment } from '@/types';
import { Button } from '@/components/ui/Button';

interface AppointmentCardProps {
  appointment: Appointment;
  onView?: (appointment: Appointment) => void;
  onEdit?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onComplete?: (appointment: Appointment) => void;
  compact?: boolean;
}

const appointmentTypeLabels: Record<Appointment['type'], string> = {
  meeting: 'Riunione',
  site_visit: 'Sopralluogo',
  client_call: 'Chiamata Cliente',
  inspection: 'Ispezione',
  deadline: 'Scadenza',
  milestone: 'Milestone',
  contractor_meeting: 'Meeting Fornitore',
  internal_review: 'Revisione Interna',
  other: 'Altro'
};

const appointmentTypeColors: Record<Appointment['type'], string> = {
  meeting: 'bg-blue-100 text-blue-800',
  site_visit: 'bg-green-100 text-green-800',
  client_call: 'bg-purple-100 text-purple-800',
  inspection: 'bg-orange-100 text-orange-800',
  deadline: 'bg-red-100 text-red-800',
  milestone: 'bg-yellow-100 text-yellow-800',
  contractor_meeting: 'bg-indigo-100 text-indigo-800',
  internal_review: 'bg-gray-100 text-gray-800',
  other: 'bg-gray-100 text-gray-800'
};

const statusIcons = {
  scheduled: Calendar,
  confirmed: CheckCircle,
  cancelled: XCircle,
  completed: CheckCircle,
  no_show: AlertCircle
};

const statusColors = {
  scheduled: 'text-blue-600',
  confirmed: 'text-green-600',
  cancelled: 'text-red-600',
  completed: 'text-gray-600',
  no_show: 'text-orange-600'
};

const statusLabels = {
  scheduled: 'Programmato',
  confirmed: 'Confermato',
  cancelled: 'Cancellato',
  completed: 'Completato',
  no_show: 'Non Presentato'
};

const priorityColors = {
  low: 'border-gray-300',
  medium: 'border-blue-400',
  high: 'border-orange-400'
};

export function AppointmentCard({
  appointment,
  onView,
  onEdit,
  onCancel,
  onComplete,
  compact = false
}: AppointmentCardProps) {
  const StatusIcon = statusIcons[appointment.status];

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (compact) {
    return (
      <div
        className={`p-3 rounded-lg border-l-4 ${priorityColors[appointment.priority]} bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer`}
        onClick={() => onView?.(appointment)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${appointmentTypeColors[appointment.type]}`}>
                {appointmentTypeLabels[appointment.type]}
              </span>
              <StatusIcon className={`h-4 w-4 ${statusColors[appointment.status]}`} />
            </div>
            <h4 className="font-semibold text-sm text-gray-900 truncate">{appointment.title}</h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </span>
              {appointment.participants.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {appointment.participants.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border-l-4 ${priorityColors[appointment.priority]} bg-white border border-gray-200 hover:shadow-lg transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${appointmentTypeColors[appointment.type]}`}>
              {appointmentTypeLabels[appointment.type]}
            </span>
            <span className={`flex items-center gap-1 text-sm font-medium ${statusColors[appointment.status]}`}>
              <StatusIcon className="h-4 w-4" />
              {statusLabels[appointment.status]}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{appointment.title}</h3>
          {appointment.description && (
            <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="space-y-3 mb-4">
        {/* Date and Time */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{formatDate(appointment.scheduledDate)}</span>
          <Clock className="h-4 w-4 text-gray-400 ml-2" />
          <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
        </div>

        {/* Location */}
        {appointment.location && (
          <div className="flex items-start gap-2 text-sm">
            {appointment.location.type === 'physical' ? (
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            ) : (
              <Video className="h-4 w-4 text-gray-400 mt-0.5" />
            )}
            <div>
              {appointment.location.type === 'physical' && appointment.location.address && (
                <span>{appointment.location.address}</span>
              )}
              {appointment.location.type === 'virtual' && appointment.location.meetingLink && (
                <a
                  href={appointment.location.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Partecipa al meeting
                </a>
              )}
            </div>
          </div>
        )}

        {/* Participants */}
        {appointment.participants.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium">{appointment.participants.length} partecipanti</span>
              <div className="mt-1 space-y-1">
                {appointment.participants.slice(0, 3).map((p, idx) => (
                  <div key={idx} className="text-xs text-gray-600">
                    {p.name} {p.required && <span className="text-red-500">*</span>}
                  </div>
                ))}
                {appointment.participants.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{appointment.participants.length - 3} altri
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {(onView || onEdit || onCancel || onComplete) && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          {onView && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onView(appointment)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Dettagli
            </Button>
          )}
          {onEdit && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(appointment)}
            >
              Modifica
            </Button>
          )}
          {onComplete && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onComplete(appointment)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Completa
            </Button>
          )}
          {onCancel && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onCancel(appointment)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancella
            </Button>
          )}
        </div>
      )}
    </div>
  );
}