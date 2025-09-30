'use client';

import { useMemo } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { TeamMember } from '@/types';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';

export function WorkloadDashboard() {
  const { members, getTeamWorkload, getActiveMembers } = useTeam();

  const teamWorkload = getTeamWorkload();
  const activeMembers = getActiveMembers();

  // Calculate distribution
  const workloadDistribution = useMemo(() => {
    const optimal = members.filter(m =>
      m.status === 'active' &&
      m.workload.utilizationRate >= 50 &&
      m.workload.utilizationRate <= 90
    );

    return {
      overloaded: teamWorkload.overloaded,
      optimal,
      underutilized: teamWorkload.underutilized,
    };
  }, [members, teamWorkload]);

  // Get members sorted by utilization
  const membersByUtilization = useMemo(() => {
    return [...activeMembers].sort((a, b) =>
      b.workload.utilizationRate - a.workload.utilizationRate
    );
  }, [activeMembers]);

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'bg-red-500';
    if (rate >= 70) return 'bg-yellow-500';
    if (rate >= 50) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getUtilizationLabel = (rate: number) => {
    if (rate >= 90) return 'Sovraccarico';
    if (rate >= 70) return 'Carico Alto';
    if (rate >= 50) return 'Ottimale';
    return 'Disponibile';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Workload Dashboard</h2>
        <p className="text-gray-600 mt-1">
          Panoramica del carico di lavoro del team
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Active */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Membri Attivi</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {activeMembers.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            su {members.length} totali
          </div>
        </div>

        {/* Optimal Load */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Carico Ottimale</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {workloadDistribution.optimal.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            50-90% utilizzo
          </div>
        </div>

        {/* Overloaded */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Sovraccarichi</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {workloadDistribution.overloaded.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {'>'}90% utilizzo
          </div>
        </div>

        {/* Underutilized */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Disponibili</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {workloadDistribution.underutilized.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {'<'}50% utilizzo
          </div>
        </div>
      </div>

      {/* Team Utilization Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Utilizzo per Membro
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Sovraccarico</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">Alto</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Ottimale</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Disponibile</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {membersByUtilization.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessun membro attivo
            </div>
          ) : (
            membersByUtilization.map((member) => (
              <div key={member.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {member.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.workload.currentTasks} task attivi • {member.workload.totalHours}h
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {member.workload.utilizationRate}%
                    </span>
                    <span className="text-xs text-gray-500 w-24 text-right">
                      {getUtilizationLabel(member.workload.utilizationRate)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getUtilizationColor(member.workload.utilizationRate)}`}
                    style={{ width: `${Math.min(100, member.workload.utilizationRate)}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {workloadDistribution.overloaded.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-2">
                Attenzione: Membri Sovraccarichi
              </h4>
              <div className="space-y-1">
                {workloadDistribution.overloaded.map((member) => (
                  <div key={member.id} className="text-sm text-red-800">
                    <span className="font-medium">{member.name}</span> - {member.workload.utilizationRate}% utilizzo
                    ({member.workload.currentTasks} task, {member.workload.totalHours}h)
                  </div>
                ))}
              </div>
              <p className="text-xs text-red-700 mt-2">
                Considera di riassegnare alcuni task ai membri con maggiore disponibilità.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {workloadDistribution.underutilized.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Membri con Capacità Disponibile
              </h4>
              <div className="space-y-1">
                {workloadDistribution.underutilized.map((member) => (
                  <div key={member.id} className="text-sm text-blue-800">
                    <span className="font-medium">{member.name}</span> - {member.workload.utilizationRate}% utilizzo
                    {member.skills.length > 0 && (
                      <span className="text-xs ml-2">
                        Competenze: {member.skills.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Questi membri possono accettare nuovi task senza rischio di sovraccarico.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
