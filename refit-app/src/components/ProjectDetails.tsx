'use client';

import { useState } from 'react';
import {
  X,
  Calendar,
  Euro,
  Users,
  MapPin,
  Building2,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  TrendingUp,
  FileText,
  Camera,
  Edit,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProjectPhases } from '@/components/ProjectPhases';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Project, Location } from '@/types';

interface ProjectDetailsProps {
  project: Project;
  location?: Location;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
}


export function ProjectDetails({ project, location, onClose, onEdit, onUpdateProject }: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'budget' | 'timeline' | 'team'>('overview');
  const [showAddMemberInput, setShowAddMemberInput] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const addTeamMember = () => {
    if (newMemberName.trim() && !project.team.includes(newMemberName.trim())) {
      const updatedProject = {
        ...project,
        team: [...project.team, newMemberName.trim()]
      };
      onUpdateProject(updatedProject);
      setNewMemberName('');
      setShowAddMemberInput(false);
    }
  };

  const removeTeamMember = (memberToRemove: string) => {
    const updatedProject = {
      ...project,
      team: project.team.filter(member => member !== memberToRemove)
    };
    onUpdateProject(updatedProject);
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'planning': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4" />;
      case 'on_hold': return <PauseCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'Pianificazione';
      case 'approved': return 'Approvato';
      case 'in_progress': return 'In corso';
      case 'on_hold': return 'In pausa';
      case 'completed': return 'Completato';
      case 'cancelled': return 'Annullato';
      default: return status;
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const budgetPercentage = project.budget.approved > 0
    ? (project.budget.spent / project.budget.approved) * 100
    : 0;

  const isOverBudget = budgetPercentage > 100;

  // Calculate project duration
  const startDate = new Date(project.dates.startPlanned);
  const endDate = new Date(project.dates.endPlanned);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const tabs = [
    { id: 'overview', label: 'Panoramica', icon: <Target className="h-4 w-4" /> },
    { id: 'phases', label: 'Fasi', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'budget', label: 'Budget', icon: <Euro className="h-4 w-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Calendar className="h-4 w-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="h-4 w-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  <span className="ml-1">{getStatusLabel(project.status)}</span>
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority === 'low' ? 'Bassa' :
                   project.priority === 'medium' ? 'Media' :
                   project.priority === 'high' ? 'Alta' : 'Urgente'}
                </span>
              </div>

              {location && (
                <div className="flex items-center mt-2 text-gray-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>{location.name} - {location.address.city}, {location.address.province}</span>
                </div>
              )}

              {project.description && (
                <p className="mt-2 text-gray-600">{project.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => onEdit(project)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Button>
              <Button variant="ghost" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600">Durata</div>
              <div className="text-lg font-semibold text-gray-900">{duration} giorni</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600">Budget</div>
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(project.budget.approved)}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600">Team</div>
              <div className="text-lg font-semibold text-gray-900">{project.team.length + 1} persone</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600">Fasi</div>
              <div className="text-lg font-semibold text-gray-900">{project.phases.length}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 300px)' }}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Project Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informazioni Generali</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">Tipo:</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">{project.type}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">Manager:</span>
                      <span className="text-sm font-medium text-gray-900">{project.projectManager}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">Creato:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(project.dates.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm text-gray-600">Aggiornato:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(project.dates.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                  {location ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">{location.name}</span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{location.address.street}, {location.address.city}</span>
                        </div>
                        <div>Superficie: {location.surface} mq</div>
                        <div>Manager: {location.manager}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Location non trovata</div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {project.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Note</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{project.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'phases' && (
            <ProjectPhases
              phases={project.phases}
              onUpdatePhases={(phases) => {
                console.log('💾 PROJECT DETAILS - Updating phases:', phases);
                console.log('💾 PROJECT DETAILS - Original project:', project);
                const updatedProject = { ...project, phases };
                console.log('💾 PROJECT DETAILS - Updated project:', updatedProject);
                onUpdateProject(updatedProject);
              }}
            />
          )}

          {activeTab === 'budget' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Dettaglio Budget</h3>

              {/* Budget Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Budget Pianificato</p>
                      <p className="text-2xl font-bold text-blue-900">{formatCurrency(project.budget.planned)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Budget Approvato</p>
                      <p className="text-2xl font-bold text-green-900">{formatCurrency(project.budget.approved)}</p>
                    </div>
                  </div>
                </div>

                <div className={`${isOverBudget ? 'bg-red-50' : 'bg-orange-50'} rounded-lg p-6`}>
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${isOverBudget ? 'bg-red-100' : 'bg-orange-100'}`}>
                      <TrendingUp className={`h-6 w-6 ${isOverBudget ? 'text-red-600' : 'text-orange-600'}`} />
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-orange-600'}`}>Budget Speso</p>
                      <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-900' : 'text-orange-900'}`}>
                        {formatCurrency(project.budget.spent)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Progress */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-semibold text-gray-900">Utilizzo Budget</h4>
                  <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                    {budgetPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div
                    className={`h-4 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  ></div>
                </div>

                {isOverBudget && (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Sforamento budget: {formatCurrency(project.budget.spent - project.budget.approved)}
                  </div>
                )}

                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <span>Rimanente: {formatCurrency(project.budget.remaining)}</span>
                  <span>Approvato: {formatCurrency(project.budget.approved)}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Timeline Progetto</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Date Pianificate</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Inizio Pianificato</p>
                        <p className="text-sm text-gray-600">{formatDate(project.dates.startPlanned)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Fine Pianificata</p>
                        <p className="text-sm text-gray-600">{formatDate(project.dates.endPlanned)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Durata Pianificata</p>
                        <p className="text-sm text-gray-600">{duration} giorni</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Date Effettive</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Inizio Effettivo</p>
                        <p className="text-sm text-gray-600">
                          {project.dates.startActual ? formatDate(project.dates.startActual) : 'Non ancora iniziato'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Fine Effettiva</p>
                        <p className="text-sm text-gray-600">
                          {project.dates.endActual ? formatDate(project.dates.endActual) : 'Non ancora completato'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Visualization */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Visualizzazione Timeline</h4>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                  <div className="space-y-6">
                    <div className="relative flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Progetto Creato</p>
                        <p className="text-sm text-gray-600">{formatDate(project.dates.createdAt)}</p>
                      </div>
                    </div>

                    <div className="relative flex items-center">
                      <div className={`flex-shrink-0 w-8 h-8 ${project.dates.startActual ? 'bg-green-500' : 'bg-gray-300'} rounded-full flex items-center justify-center`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Inizio Lavori</p>
                        <p className="text-sm text-gray-600">
                          {project.dates.startActual ? formatDate(project.dates.startActual) : 'In attesa di inizio'}
                        </p>
                      </div>
                    </div>

                    <div className="relative flex items-center">
                      <div className={`flex-shrink-0 w-8 h-8 ${project.dates.endActual ? 'bg-green-500' : 'bg-gray-300'} rounded-full flex items-center justify-center`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Completamento</p>
                        <p className="text-sm text-gray-600">
                          {project.dates.endActual ? formatDate(project.dates.endActual) : `Previsto: ${formatDate(project.dates.endPlanned)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Team del Progetto</h3>
                {!showAddMemberInput ? (
                  <Button size="sm" onClick={() => setShowAddMemberInput(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Membro
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nome membro..."
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
                      autoFocus
                    />
                    <Button size="sm" onClick={addTeamMember} disabled={!newMemberName.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {setShowAddMemberInput(false); setNewMemberName('');}}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Project Manager */}
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Project Manager</p>
                    <p className="text-lg font-semibold text-blue-900">{project.projectManager}</p>
                    <p className="text-sm text-blue-600">Responsabile del progetto</p>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Team Members ({project.team.length})</h4>
                {project.team.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Nessun membro del team aggiunto</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.team.map((member, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {member.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{member}</p>
                              <p className="text-sm text-gray-600">Team Member</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTeamMember(member)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}