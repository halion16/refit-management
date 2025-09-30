'use client';

import { useTeam } from '@/hooks/useTeam';
import { Users, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TeamWorkloadWidgetProps {
  onViewDetails?: () => void;
}

export function TeamWorkloadWidget({ onViewDetails }: TeamWorkloadWidgetProps) {
  const { members, getTeamWorkload, getActiveMembers } = useTeam();

  const teamWorkload = getTeamWorkload();
  const activeMembers = getActiveMembers();

  // Get top 3 most utilized members
  const topUtilized = [...activeMembers]
    .sort((a, b) => b.workload.utilizationRate - a.workload.utilizationRate)
    .slice(0, 3);

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Team Workload</h3>
        </div>
        {onViewDetails && (
          <Button variant="ghost" size="sm" onClick={onViewDetails}>
            <span className="text-sm">Dettagli</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {activeMembers.length}
          </div>
          <div className="text-xs text-gray-500">Attivi</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {teamWorkload.average}h
          </div>
          <div className="text-xs text-gray-500">Media ore</div>
        </div>
        <div className="text-center">
          <div
            className={`text-2xl font-bold ${
              teamWorkload.overloaded.length > 0
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {teamWorkload.overloaded.length}
          </div>
          <div className="text-xs text-gray-500">Sovraccarichi</div>
        </div>
      </div>

      {/* Alert */}
      {teamWorkload.overloaded.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-red-800 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">
              {teamWorkload.overloaded.length} membri sovraccarichi
            </span>
          </div>
        </div>
      )}

      {/* Top Members */}
      {topUtilized.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-medium text-gray-500 uppercase">
            Membri più impegnati
          </div>
          {topUtilized.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {member.name}
                </div>
                <div className="text-xs text-gray-500">
                  {member.workload.currentTasks} task •{' '}
                  {member.workload.totalHours}h
                </div>
              </div>
              <div
                className={`text-sm font-semibold ${getUtilizationColor(
                  member.workload.utilizationRate
                )}`}
              >
                {member.workload.utilizationRate}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {activeMembers.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          Nessun membro attivo nel team
        </div>
      )}
    </div>
  );
}
