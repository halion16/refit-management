'use client';

import { TeamMember } from '@/types';
import { Mail, Phone, Briefcase, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface TeamMemberCardProps {
  member: TeamMember;
  onClick?: () => void;
}

const roleLabels = {
  manager: 'Manager',
  coordinator: 'Coordinatore',
  technician: 'Tecnico',
  contractor: 'Appaltatore',
  viewer: 'Visualizzatore',
};

const roleColors = {
  manager: 'bg-purple-100 text-purple-700 border-purple-200',
  coordinator: 'bg-blue-100 text-blue-700 border-blue-200',
  technician: 'bg-green-100 text-green-700 border-green-200',
  contractor: 'bg-orange-100 text-orange-700 border-orange-200',
  viewer: 'bg-gray-100 text-gray-700 border-gray-200',
};

const statusColors = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  vacation: 'bg-yellow-100 text-yellow-700',
};

const statusLabels = {
  active: 'Attivo',
  inactive: 'Inattivo',
  vacation: 'In Ferie',
};

export function TeamMemberCard({ member, onClick }: TeamMemberCardProps) {
  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600 bg-red-50';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {getInitials(member.name)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{member.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-1 rounded border ${roleColors[member.role]}`}>
              {roleLabels[member.role]}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded ${statusColors[member.status]}`}>
              {statusLabels[member.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-4 w-4" />
          <span className="truncate">{member.email}</span>
        </div>
        {member.contacts.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{member.contacts.phone}</span>
          </div>
        )}
        {member.department && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="h-4 w-4" />
            <span>{member.department}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {member.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {member.skills.slice(0, 3).map(skill => (
              <span
                key={skill}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{member.skills.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        {/* Workload */}
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <Clock className="h-3 w-3" />
            <span>Carico Lavoro</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-bold ${getUtilizationColor(member.workload.utilizationRate).split(' ')[0]}`}>
              {member.workload.utilizationRate}%
            </span>
            <span className="text-xs text-gray-500">
              ({member.workload.currentTasks} task)
            </span>
          </div>
        </div>

        {/* Performance */}
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <TrendingUp className="h-3 w-3" />
            <span>Performance</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-gray-900">
              {member.performance.onTimeCompletion}%
            </span>
            <span className="text-xs text-gray-500">
              on-time
            </span>
          </div>
        </div>
      </div>

      {/* Tasks Completed Badge */}
      {member.performance.tasksCompleted > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <CheckCircle className="h-3 w-3" />
              <span>Task completati</span>
            </div>
            <span className="font-semibold text-gray-900">{member.performance.tasksCompleted}</span>
          </div>
        </div>
      )}
    </div>
  );
}
