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
  Plus,
  ListTodo,
  Timer,
  DollarSign,
  Activity,
  Zap,
  Flag,
  UserCheck,
  Bell,
  TrendingDown,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProjectPhases } from '@/components/ProjectPhases';
import ProjectDocuments from '@/components/ProjectDocuments';
import { TaskForm } from '@/components/TaskForm';
import { CommentSection } from '@/components/Comments';
import { useTasksEnhanced } from '@/hooks/useTasksEnhanced';
import { useCurrentUser } from '@/store';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Project, Location, TaskEnhanced } from '@/types';

interface ProjectDetailsProps {
  project: Project;
  location?: Location;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onRequestQuote?: (projectId: string, phaseId?: string) => void;
}


export function ProjectDetails({ project, location, onClose, onEdit, onUpdateProject, onRequestQuote }: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'budget' | 'timeline' | 'team' | 'documents' | 'tasks' | 'comments'>('overview');
  const currentUser = useCurrentUser();
  const [showAddMemberInput, setShowAddMemberInput] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskEnhanced | undefined>();
  const [timelineView, setTimelineView] = useState<'gantt' | 'chronological'>('gantt');

  const { getTasksByProject, addTask, updateTask, deleteTask } = useTasksEnhanced();
  const projectTasks = getTasksByProject(project.id, project.phases);

  // Task Card Component - Compact Version
  const TaskCard = ({ task, onEdit, setShowForm }: { task: TaskEnhanced; onEdit: (task: TaskEnhanced) => void; setShowForm: (show: boolean) => void }) => {
    const progress = task.checklist?.length
      ? Math.round((task.checklist.filter(i => i.completed).length / task.checklist.length) * 100)
      : task.progressPercentage;

    const statusColors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      under_review: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      on_hold: 'bg-yellow-100 text-yellow-700',
      blocked: 'bg-red-100 text-red-700',
    };

    const statusLabels: Record<string, string> = {
      pending: 'Da Fare',
      in_progress: 'In Corso',
      under_review: 'In Revisione',
      completed: 'Completato',
      on_hold: 'In Attesa',
      blocked: 'Bloccato',
    };

    return (
      <div
        onClick={() => {
          onEdit(task);
          setShowForm(true);
        }}
        className="p-2 bg-white border border-gray-200 rounded hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm text-gray-900 truncate">{task.title}</h4>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${statusColors[task.status] || 'bg-gray-100 text-gray-700'}`}>
                {statusLabels[task.status] || task.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 whitespace-nowrap">
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
            {task.estimatedHours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimatedHours}h
              </span>
            )}
            {task.checklist && task.checklist.length > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
              </span>
            )}
            {progress > 0 && (
              <span className="flex items-center gap-1 font-medium">
                {progress}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

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
    { id: 'tasks', label: `Task (${projectTasks.length})`, icon: <ListTodo className="h-4 w-4" /> },
    { id: 'budget', label: 'Budget', icon: <Euro className="h-4 w-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Calendar className="h-4 w-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="h-4 w-4" /> },
    { id: 'documents', label: 'Documenti', icon: <FileText className="h-4 w-4" /> },
    { id: 'comments', label: 'Commenti', icon: <MessageSquare className="h-4 w-4" /> }
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
{activeTab === 'overview' && (() => {
            // Calculate KPIs
            const totalTasks = projectTasks.length;
            const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
            const tasksProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            const totalEstimatedHours = projectTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
            const totalActualHours = projectTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

            const budgetUsed = project.budget.spent;
            const budgetRemaining = project.budget.approved - budgetUsed;
            const budgetProgress = Math.round((budgetUsed / project.budget.approved) * 100);

            const today = new Date();
            const endDate = project.dates.endDate ? new Date(project.dates.endDate) : null;
            const daysRemaining = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;

            const overdueTasks = projectTasks.filter(t =>
              t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < today
            );

            const blockedTasks = projectTasks.filter(t => t.blockedBy && t.blockedBy.length > 0);
            const urgentTasks = projectTasks.filter(t =>
              (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed'
            );

            const completedPhases = project.phases.filter(p => p.status === 'completed').length;
            const phasesProgress = Math.round((completedPhases / project.phases.length) * 100);

            const isOnSchedule = daysRemaining >= 0;
            const isBudgetOk = budgetProgress <= 100;

            return (
              <div className="space-y-6">
                {/* KPI Cards - Top Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Project Progress */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Progresso</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{tasksProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${tasksProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-blue-700 mt-2">
                      {completedTasks}/{totalTasks} task completati
                    </div>
                  </div>

                  {/* Budget */}
                  <div className={`rounded-lg p-4 border ${
                    budgetProgress > 100
                      ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                      : budgetProgress > 80
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
                      : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className={`h-5 w-5 ${
                          budgetProgress > 100 ? 'text-red-600' : budgetProgress > 80 ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          budgetProgress > 100 ? 'text-red-900' : budgetProgress > 80 ? 'text-yellow-900' : 'text-green-900'
                        }`}>Budget</span>
                      </div>
                      <span className={`text-2xl font-bold ${
                        budgetProgress > 100 ? 'text-red-600' : budgetProgress > 80 ? 'text-yellow-600' : 'text-green-600'
                      }`}>{budgetProgress}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${
                      budgetProgress > 100 ? 'bg-red-200' : budgetProgress > 80 ? 'bg-yellow-200' : 'bg-green-200'
                    }`}>
                      <div
                        className={`h-2 rounded-full transition-all ${
                          budgetProgress > 100 ? 'bg-red-600' : budgetProgress > 80 ? 'bg-yellow-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                      />
                    </div>
                    <div className={`text-xs mt-2 ${
                      budgetProgress > 100 ? 'text-red-700' : budgetProgress > 80 ? 'text-yellow-700' : 'text-green-700'
                    }`}>
                      {formatCurrency(budgetRemaining)} rimanenti
                    </div>
                  </div>

                  {/* Time Remaining */}
                  <div className={`rounded-lg p-4 border ${
                    daysRemaining < 0
                      ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                      : daysRemaining < 7
                      ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
                      : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className={`h-5 w-5 ${
                          daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-yellow-600' : 'text-purple-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          daysRemaining < 0 ? 'text-red-900' : daysRemaining < 7 ? 'text-yellow-900' : 'text-purple-900'
                        }`}>Scadenza</span>
                      </div>
                      <span className={`text-2xl font-bold ${
                        daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-yellow-600' : 'text-purple-600'
                      }`}>
                        {Math.abs(daysRemaining)}
                      </span>
                    </div>
                    <div className={`text-xs mt-2 ${
                      daysRemaining < 0 ? 'text-red-700' : daysRemaining < 7 ? 'text-yellow-700' : 'text-purple-700'
                    }`}>
                      {daysRemaining < 0 ? 'Giorni di ritardo' : 'Giorni rimanenti'}
                    </div>
                    <div className={`text-xs ${
                      daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-yellow-600' : 'text-purple-600'
                    }`}>
                      {endDate ? formatDate(project.dates.endDate) : 'Data non impostata'}
                    </div>
                  </div>

                  {/* Hours Worked */}
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-900">Ore Lavorate</span>
                      </div>
                      <span className="text-2xl font-bold text-indigo-600">{totalActualHours}</span>
                    </div>
                    <div className="text-xs text-indigo-700 mt-2">
                      su {totalEstimatedHours}h stimate
                    </div>
                    {totalEstimatedHours > 0 && (
                      <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((totalActualHours / totalEstimatedHours) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Alerts Row */}
                {(overdueTasks.length > 0 || blockedTasks.length > 0 || urgentTasks.length > 0 || !isOnSchedule || !isBudgetOk) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Bell className="h-5 w-5 text-amber-600" />
                      <h3 className="font-semibold text-amber-900">Attenzione Richiesta</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {overdueTasks.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-gray-700">{overdueTasks.length} task in ritardo</span>
                        </div>
                      )}
                      {blockedTasks.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <PauseCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-gray-700">{blockedTasks.length} task bloccati</span>
                        </div>
                      )}
                      {urgentTasks.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-yellow-600" />
                          <span className="text-gray-700">{urgentTasks.length} task urgenti</span>
                        </div>
                      )}
                      {!isOnSchedule && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <span className="text-gray-700">Progetto in ritardo</span>
                        </div>
                      )}
                      {!isBudgetOk && (
                        <div className="flex items-center gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-gray-700">Budget superato</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Two Columns Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Project Status */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Stato Progetto
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Fasi Completate</span>
                          <span className="text-sm font-medium text-gray-900">
                            {completedPhases}/{project.phases.length} ({phasesProgress}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${phasesProgress}%` }}
                          />
                        </div>
                        <div className="pt-2 space-y-2">
                          {project.phases.slice(0, 3).map(phase => {
                            const phaseTasks = projectTasks.filter(t => t.phaseId === phase.id);
                            const completed = phaseTasks.filter(t => t.status === 'completed').length;
                            const progress = phaseTasks.length > 0 ? Math.round((completed / phaseTasks.length) * 100) : 0;

                            return (
                              <div key={phase.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 truncate flex-1">🔨 {phase.name}</span>
                                <span className="text-gray-600 ml-2">{progress}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Team & Workload */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        Team
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">{project.projectManager}</span>
                            <span className="text-xs text-gray-500">(Manager)</span>
                          </div>
                          <span className="text-xs text-gray-600">
                            {projectTasks.filter(t => t.assignee === project.projectManager).length} task
                          </span>
                        </div>
                        {project.team.map(member => {
                          const memberTasks = projectTasks.filter(t => t.assignee === member);
                          return (
                            <div key={member} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{member}</span>
                              </div>
                              <span className="text-xs text-gray-600">{memberTasks.length} task</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        Informazioni
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Tipo</span>
                          <span className="font-medium capitalize">{project.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Creato</span>
                          <span className="font-medium">{formatDate(project.dates.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Aggiornato</span>
                          <span className="font-medium">{formatDate(project.dates.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Location */}
                    {location && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-indigo-600" />
                          Location
                        </h3>
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <span className="font-medium text-indigo-900">{location.name}</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-indigo-600 mt-0.5" />
                              <span className="text-indigo-800">{location.address.street}, {location.address.city}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-indigo-600" />
                              <span className="text-indigo-800">Superficie: {location.surface} mq</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-indigo-600" />
                              <span className="text-indigo-800">Manager: {location.manager}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Urgent Tasks */}
                    {urgentTasks.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Flag className="h-5 w-5 text-red-600" />
                          Task Urgenti
                        </h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {urgentTasks.slice(0, 5).map(task => (
                            <div key={task.id} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-red-900 truncate flex-1">{task.title}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ml-2 ${
                                  task.priority === 'urgent'
                                    ? 'bg-red-200 text-red-800'
                                    : 'bg-orange-200 text-orange-800'
                                }`}>
                                  {task.priority === 'urgent' ? 'Urgente' : 'Alta'}
                                </span>
                              </div>
                              {task.dueDate && (
                                <div className="text-xs text-red-700 mt-1">
                                  Scadenza: {formatDate(task.dueDate)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Overdue Tasks */}
                    {overdueTasks.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          Task in Ritardo
                        </h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {overdueTasks.slice(0, 5).map(task => (
                            <div key={task.id} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-red-900 truncate flex-1">{task.title}</span>
                              </div>
                              {task.dueDate && (
                                <div className="text-xs text-red-700 mt-1">
                                  Scaduto il: {formatDate(task.dueDate)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {project.notes && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-600" />
                          Note
                        </h3>
                        <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                          {project.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'phases' && (
            <ProjectPhases
              phases={project.phases}
              projectId={project.id}
              onUpdatePhases={(phases) => {
                console.log('💾 PROJECT DETAILS - Updating phases:', phases);
                console.log('💾 PROJECT DETAILS - Original project:', project);
                const updatedProject = { ...project, phases };
                console.log('💾 PROJECT DETAILS - Updated project:', updatedProject);
                onUpdateProject(updatedProject);
              }}
              onRequestQuote={onRequestQuote ? (phase) => onRequestQuote(project.id, phase.id) : undefined}
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

{activeTab === 'timeline' && (() => {
            const projectStart = project.dates.startPlanned ? new Date(project.dates.startPlanned) : new Date();
            const projectEnd = project.dates.endPlanned ? new Date(project.dates.endPlanned) : new Date();
            const totalDays = Math.max(1, Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));
            const today = new Date();

            // Calculate position of today marker
            const todayPosition = ((today.getTime() - projectStart.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100;

            return (
              <div className="space-y-6">
                {/* Header with View Switcher */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Timeline Progetto</h3>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setTimelineView('gantt')}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        timelineView === 'gantt'
                          ? 'bg-white text-blue-600 shadow'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Vista Gantt
                    </button>
                    <button
                      onClick={() => setTimelineView('chronological')}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        timelineView === 'chronological'
                          ? 'bg-white text-blue-600 shadow'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Vista Cronologica
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Inizio Pianificato</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">{formatDate(project.dates.startPlanned)}</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Fine Pianificata</span>
                    </div>
                    <div className="text-lg font-bold text-purple-600">{formatDate(project.dates.endPlanned)}</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Durata Totale</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">{totalDays} giorni</div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">Fasi Totali</span>
                    </div>
                    <div className="text-lg font-bold text-amber-600">{project.phases.length}</div>
                  </div>
                </div>

                {/* Gantt View */}
                {timelineView === 'gantt' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="space-y-4">
                      {/* Timeline Header */}
                      <div className="flex items-center mb-6">
                        <div className="w-48 flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-700">Fase</span>
                        </div>
                        <div className="flex-1 relative">
                          <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>{formatDate(projectStart)}</span>
                            <span>Oggi</span>
                            <span>{formatDate(projectEnd)}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded relative">
                            {/* Today marker */}
                            {todayPosition >= 0 && todayPosition <= 100 && (
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                                style={{ left: `${todayPosition}%` }}
                              >
                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Phases Gantt Bars */}
                      {project.phases.map((phase, index) => {
                        const phaseStart = phase.dates?.startPlanned ? new Date(phase.dates.startPlanned) : projectStart;
                        const phaseEnd = phase.dates?.endPlanned ? new Date(phase.dates.endPlanned) : projectEnd;

                        const startOffset = ((phaseStart.getTime() - projectStart.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100;
                        const phaseDuration = ((phaseEnd.getTime() - phaseStart.getTime()) / (projectEnd.getTime() - projectStart.getTime())) * 100;

                        const statusColors: Record<string, string> = {
                          planning: 'bg-gray-400',
                          active: 'bg-blue-500',
                          completed: 'bg-green-500',
                          on_hold: 'bg-yellow-500',
                          delayed: 'bg-red-500',
                        };

                        const phaseTasks = projectTasks.filter(t => t.phaseId === phase.id);
                        const completedTasks = phaseTasks.filter(t => t.status === 'completed').length;
                        const progress = phaseTasks.length > 0 ? (completedTasks / phaseTasks.length) * 100 : 0;
                        const phaseColor = statusColors[phase.status] || statusColors.planning;

                        return (
                          <div key={phase.id} className="flex items-center group hover:bg-gray-50 p-2 rounded transition-colors">
                            <div className="w-48 flex-shrink-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{phase.name}</div>
                              <div className="text-xs text-gray-500">{Math.ceil((phaseEnd.getTime() - phaseStart.getTime()) / (1000 * 60 * 60 * 24))} giorni</div>
                            </div>
                            <div className="flex-1 relative h-12 flex items-center">
                              <div className="absolute inset-0 h-8 bg-gray-50 rounded"></div>
                              <div
                                className="absolute h-8 rounded shadow-sm transition-all hover:shadow-md cursor-pointer"
                                style={{
                                  left: `${Math.max(0, startOffset)}%`,
                                  width: `${Math.min(100 - Math.max(0, startOffset), phaseDuration)}%`,
                                }}
                              >
                                {/* Background bar */}
                                <div className={`h-full rounded ${phaseColor} opacity-30`}></div>

                                {/* Progress bar */}
                                <div
                                  className={`absolute top-0 left-0 h-full rounded ${phaseColor}`}
                                  style={{ width: `${progress}%` }}
                                ></div>

                                {/* Phase info tooltip */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs font-medium text-white drop-shadow">
                                    {Math.round(progress)}%
                                  </span>
                                </div>

                                {/* Hover tooltip */}
                                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                                  <div className="font-semibold">{phase.name}</div>
                                  <div>Inizio: {formatDate(phaseStart)}</div>
                                  <div>Fine: {formatDate(phaseEnd)}</div>
                                  <div>Progresso: {Math.round(progress)}%</div>
                                  <div>Task: {completedTasks}/{phaseTasks.length}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-6 text-xs">
                        <span className="font-semibold text-gray-700">Legenda:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-400 rounded"></div>
                          <span className="text-gray-600">Planning</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-gray-600">In Corso</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="text-gray-600">Completato</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                          <span className="text-gray-600">In Attesa</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span className="text-gray-600">Ritardo</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-0.5 h-4 bg-red-500"></div>
                          <span className="text-gray-600">Oggi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chronological View */}
                {timelineView === 'chronological' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="relative">
                      {/* Vertical line */}
                      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                      <div className="space-y-8">
                        {/* Project Start */}
                        <div className="relative flex items-start">
                          <div className="flex-shrink-0 w-16 flex flex-col items-center">
                            <div className="w-4 h-4 bg-blue-500 rounded-full ring-4 ring-blue-100"></div>
                          </div>
                          <div className="flex-1 ml-4 pb-8">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <PlayCircle className="h-5 w-5 text-blue-600" />
                                <h4 className="font-semibold text-blue-900">Inizio Progetto</h4>
                              </div>
                              <p className="text-sm text-blue-700">{formatDate(project.dates.startPlanned)}</p>
                              <p className="text-xs text-blue-600 mt-1">Durata totale: {totalDays} giorni</p>
                            </div>
                          </div>
                        </div>

                        {/* Phases */}
                        {project.phases.map((phase, index) => {
                          const statusIcons = {
                            planning: Clock,
                            active: PlayCircle,
                            completed: CheckCircle,
                            on_hold: PauseCircle,
                            delayed: AlertCircle,
                          };

                          const statusColors = {
                            planning: { bg: 'from-gray-50 to-gray-100', border: 'border-gray-200', text: 'text-gray-900', icon: 'text-gray-600' },
                            active: { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-600' },
                            completed: { bg: 'from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-900', icon: 'text-green-600' },
                            on_hold: { bg: 'from-yellow-50 to-yellow-100', border: 'border-yellow-200', text: 'text-yellow-900', icon: 'text-yellow-600' },
                            delayed: { bg: 'from-red-50 to-red-100', border: 'border-red-200', text: 'text-red-900', icon: 'text-red-600' },
                          };

                          const Icon = statusIcons[phase.status] || Clock;
                          const colors = statusColors[phase.status] || statusColors.planning;

                          const phaseTasks = projectTasks.filter(t => t.phaseId === phase.id);
                          const completedTasks = phaseTasks.filter(t => t.status === 'completed').length;

                          return (
                            <div key={phase.id} className="relative flex items-start">
                              <div className="flex-shrink-0 w-16 flex flex-col items-center">
                                <div className={`w-4 h-4 rounded-full ring-4 ${
                                  phase.status === 'completed' ? 'bg-green-500 ring-green-100' :
                                  phase.status === 'active' ? 'bg-blue-500 ring-blue-100' :
                                  phase.status === 'delayed' ? 'bg-red-500 ring-red-100' :
                                  phase.status === 'on_hold' ? 'bg-yellow-500 ring-yellow-100' :
                                  'bg-gray-400 ring-gray-100'
                                }`}></div>
                              </div>
                              <div className="flex-1 ml-4 pb-8">
                                <div className={`bg-gradient-to-br ${colors.bg} rounded-lg p-4 border ${colors.border}`}>
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Icon className={`h-5 w-5 ${colors.icon}`} />
                                      <h4 className={`font-semibold ${colors.text}`}>{phase.name}</h4>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${colors.bg} ${colors.border} border`}>
                                      {phase.status === 'planning' ? 'Pianificazione' :
                                       phase.status === 'active' ? 'In Corso' :
                                       phase.status === 'completed' ? 'Completata' :
                                       phase.status === 'on_hold' ? 'In Attesa' :
                                       'In Ritardo'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                    <div>
                                      <span className="text-gray-600">Inizio:</span>
                                      <span className="ml-2 font-medium">{formatDate(phase.dates?.startPlanned)}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Fine:</span>
                                      <span className="ml-2 font-medium">{formatDate(phase.dates?.endPlanned)}</span>
                                    </div>
                                  </div>

                                  {phaseTasks.length > 0 && (
                                    <div>
                                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                        <span>Task: {completedTasks}/{phaseTasks.length}</span>
                                        <span>{Math.round((completedTasks / phaseTasks.length) * 100)}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                          className={`h-1.5 rounded-full ${
                                            phase.status === 'completed' ? 'bg-green-500' :
                                            phase.status === 'active' ? 'bg-blue-500' :
                                            'bg-gray-400'
                                          }`}
                                          style={{ width: `${(completedTasks / phaseTasks.length) * 100}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Project End */}
                        <div className="relative flex items-start">
                          <div className="flex-shrink-0 w-16 flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full ring-4 ${
                              project.dates.endActual
                                ? 'bg-green-500 ring-green-100'
                                : 'bg-gray-300 ring-gray-100'
                            }`}></div>
                          </div>
                          <div className="flex-1 ml-4">
                            <div className={`bg-gradient-to-br rounded-lg p-4 border ${
                              project.dates.endActual
                                ? 'from-green-50 to-green-100 border-green-200'
                                : 'from-gray-50 to-gray-100 border-gray-200'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                {project.dates.endActual ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Target className="h-5 w-5 text-gray-600" />
                                )}
                                <h4 className={`font-semibold ${
                                  project.dates.endActual ? 'text-green-900' : 'text-gray-900'
                                }`}>
                                  {project.dates.endActual ? 'Progetto Completato' : 'Completamento Previsto'}
                                </h4>
                              </div>
                              <p className={`text-sm ${
                                project.dates.endActual ? 'text-green-700' : 'text-gray-700'
                              }`}>
                                {project.dates.endActual
                                  ? formatDate(project.dates.endActual)
                                  : formatDate(project.dates.endPlanned)
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

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

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <ProjectDocuments
                projectId={project.id}
                documents={project.documents || []}
                onUpdateDocuments={(newDocuments) => {
                  const updatedProject = {
                    ...project,
                    documents: newDocuments
                  };
                  onUpdateProject(updatedProject);
                }}
              />
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Task del Progetto
                </h3>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingTask(undefined);
                    setShowTaskForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Task
                </Button>
              </div>

              {projectTasks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <ListTodo className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nessun task per questo progetto
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Inizia creando il primo task per questo progetto
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingTask(undefined);
                      setShowTaskForm(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crea Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  {/* Task senza fase */}
                  {(() => {
                    const tasksWithoutPhase = projectTasks.filter(t => !t.phaseId);
                    if (tasksWithoutPhase.length === 0) return null;

                    return (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 sticky top-0 bg-white py-1">
                          <ListTodo className="h-4 w-4" />
                          Task Generali ({tasksWithoutPhase.length})
                        </h4>
                        <div className="space-y-1">
                          {tasksWithoutPhase.map(task => (
                            <TaskCard key={task.id} task={task} onEdit={setEditingTask} setShowForm={setShowTaskForm} />
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Task raggruppati per fase */}
                  {project.phases.map(phase => {
                    const phaseTasks = projectTasks.filter(t => t.phaseId === phase.id);
                    if (phaseTasks.length === 0) return null;

                    const completedTasks = phaseTasks.filter(t => t.status === 'completed').length;
                    const phaseProgress = Math.round((completedTasks / phaseTasks.length) * 100);

                    return (
                      <div key={phase.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                              🔨 {phase.name}
                              <span className="text-xs font-normal text-gray-600">
                                ({phaseTasks.length} task)
                              </span>
                            </h4>
                            <span className="text-xs font-medium text-gray-700">
                              {completedTasks}/{phaseTasks.length} completati
                            </span>
                          </div>

                          {/* Progress Bar Fase */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                phaseProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${phaseProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {phaseTasks.map(task => (
                            <TaskCard key={task.id} task={task} onEdit={setEditingTask} setShowForm={setShowTaskForm} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && currentUser && (
            <div className="p-6">
              <CommentSection
                entityType="project"
                entityId={project.id}
                currentUserId={currentUser.id}
                currentUserName={currentUser.name}
                currentUserAvatar={currentUser.avatar}
                title="Commenti Progetto"
              />
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          projectId={project.id}
          onSave={async (taskData) => {
            if (editingTask) {
              await updateTask(editingTask.id, taskData);
            } else {
              await addTask(taskData);
            }
            setShowTaskForm(false);
            setEditingTask(undefined);
          }}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(undefined);
          }}
        />
      )}
    </div>
  );
}