'use client';

import { useState, useMemo } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { TeamMember, TeamMemberRole, TeamMemberStatus } from '@/types';
import { TeamMemberCard } from './TeamMemberCard';
import { TeamMemberForm } from './TeamMemberForm';
import { WorkloadDashboard } from './WorkloadDashboard';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Filter, Users, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';

export function TeamDirectory() {
  const {
    members,
    loading,
    addMember,
    updateMember,
    searchMembers,
    filterMembers,
    getTeamWorkload,
    getActiveMembers,
  } = useTeam();

  const [activeTab, setActiveTab] = useState<'directory' | 'workload'>('directory');
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<TeamMemberRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TeamMemberStatus | 'all'>('all');

  // Filtered members
  const filteredMembers = useMemo(() => {
    let result = searchQuery ? searchMembers(searchQuery) : members;

    const filters: Parameters<typeof filterMembers>[0] = {};
    if (filterRole !== 'all') filters.role = filterRole;
    if (filterStatus !== 'all') filters.status = filterStatus;

    if (Object.keys(filters).length > 0) {
      result = filterMembers(filters);
    }

    return result;
  }, [members, searchQuery, filterRole, filterStatus, searchMembers, filterMembers]);

  // Team stats
  const teamWorkload = getTeamWorkload();
  const activeMembers = getActiveMembers();

  const handleSave = async (memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMember) {
      await updateMember(editingMember.id, memberData);
    } else {
      await addMember(memberData);
    }
    setShowForm(false);
    setEditingMember(undefined);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caricamento team...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-600 mt-1">
            {activeTab === 'directory'
              ? `${filteredMembers.length} membri${filteredMembers.length !== members.length ? ` (${members.length} totali)` : ''}`
              : 'Panoramica carico di lavoro'}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingMember(undefined);
            setShowForm(true);
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuovo Membro
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'directory'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-5 w-5 inline mr-2" />
            Directory
          </button>
          <button
            onClick={() => setActiveTab('workload')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'workload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="h-5 w-5 inline mr-2" />
            Workload
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'workload' ? (
        <WorkloadDashboard />
      ) : (
        <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Membri Attivi</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{activeMembers.length}</div>
          <div className="text-xs text-blue-700 mt-1">su {members.length} totali</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Ore Totali</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{teamWorkload.total}h</div>
          <div className="text-xs text-green-700 mt-1">Media: {teamWorkload.average}h/membro</div>
        </div>

        <div className={`rounded-lg p-4 border ${
          teamWorkload.overloaded.length > 0
            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className={`h-5 w-5 ${
              teamWorkload.overloaded.length > 0 ? 'text-red-600' : 'text-gray-600'
            }`} />
            <span className={`text-sm font-medium ${
              teamWorkload.overloaded.length > 0 ? 'text-red-900' : 'text-gray-900'
            }`}>Sovraccarichi</span>
          </div>
          <div className={`text-2xl font-bold ${
            teamWorkload.overloaded.length > 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {teamWorkload.overloaded.length}
          </div>
          <div className={`text-xs mt-1 ${
            teamWorkload.overloaded.length > 0 ? 'text-red-700' : 'text-gray-700'
          }`}>
            {teamWorkload.overloaded.length > 0 ? 'Richiede attenzione' : 'Tutto OK'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Sottoutilizzati</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{teamWorkload.underutilized.length}</div>
          <div className="text-xs text-yellow-700 mt-1">Capacità disponibile</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filtri e Ricerca</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per nome, email, skill..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as TeamMemberRole | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti i ruoli</option>
            <option value="manager">Manager</option>
            <option value="coordinator">Coordinatore</option>
            <option value="technician">Tecnico</option>
            <option value="contractor">Appaltatore</option>
            <option value="viewer">Visualizzatore</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TeamMemberStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti gli stati</option>
            <option value="active">Attivo</option>
            <option value="inactive">Inattivo</option>
            <option value="vacation">In Ferie</option>
          </select>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {members.length === 0 ? 'Nessun membro nel team' : 'Nessun risultato'}
          </h3>
          <p className="text-gray-600 mb-4">
            {members.length === 0
              ? 'Inizia aggiungendo il primo membro del team'
              : 'Prova a modificare i filtri di ricerca'}
          </p>
          {members.length === 0 && (
            <Button
              variant="primary"
              onClick={() => {
                setEditingMember(undefined);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Primo Membro
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onClick={() => handleEdit(member)}
            />
          ))}
        </div>
      )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <TeamMemberForm
          member={editingMember}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(undefined);
          }}
        />
      )}
    </div>
  );
}
