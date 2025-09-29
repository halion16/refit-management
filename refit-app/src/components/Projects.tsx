'use client';

import { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Calendar,
  Euro,
  Users,
  MapPin,
  Edit,
  Eye,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Target,
  TrendingUp,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProjectDetails } from '@/components/ProjectDetails';
import { useProjects, useLocations } from '@/hooks/useLocalStorage';
import { formatDate, formatCurrency, generateId } from '@/lib/utils';
import type { Project, Location } from '@/types';

interface ProjectFormData {
  locationId: string;
  name: string;
  description: string;
  type: Project['type'];
  status: Project['status'];
  priority: Project['priority'];
  budget: {
    planned: number;
    approved: number;
    spent: number;
    remaining: number;
  };
  dates: {
    startPlanned: string;
    startActual?: string;
    endPlanned: string;
    endActual?: string;
  };
  projectManager: string;
  team: string[];
  notes: string;
}

const initialFormData: ProjectFormData = {
  locationId: '',
  name: '',
  description: '',
  type: 'renovation',
  status: 'planning',
  priority: 'medium',
  budget: {
    planned: 0,
    approved: 0,
    spent: 0,
    remaining: 0
  },
  dates: {
    startPlanned: '',
    endPlanned: ''
  },
  projectManager: '',
  team: [],
  notes: ''
};

function ProjectForm({
  project,
  onSave,
  onCancel
}: {
  project?: Project;
  onSave: (data: ProjectFormData) => void;
  onCancel: () => void;
}) {
  const { data: locations } = useLocations();
  const [formData, setFormData] = useState<ProjectFormData>(
    project ? {
      locationId: project.locationId,
      name: project.name,
      description: project.description,
      type: project.type,
      status: project.status,
      priority: project.priority,
      budget: project.budget,
      dates: project.dates,
      projectManager: project.projectManager,
      team: project.team,
      notes: project.notes
    } : initialFormData
  );

  const [newTeamMember, setNewTeamMember] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate remaining budget
    const remaining = formData.budget.approved - formData.budget.spent;

    onSave({
      ...formData,
      budget: {
        ...formData.budget,
        remaining
      }
    });
  };

  const addTeamMember = () => {
    if (newTeamMember.trim() && !formData.team.includes(newTeamMember.trim())) {
      setFormData(prev => ({
        ...prev,
        team: [...prev.team, newTeamMember.trim()]
      }));
      setNewTeamMember('');
    }
  };

  const removeTeamMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(m => m !== member)
    }));
  };

  const typeOptions = [
    { value: 'renovation', label: 'Ristrutturazione' },
    { value: 'refit', label: 'Refit' },
    { value: 'expansion', label: 'Espansione' },
    { value: 'maintenance', label: 'Manutenzione' }
  ];

  const statusOptions = [
    { value: 'planning', label: 'Pianificazione' },
    { value: 'approved', label: 'Approvato' },
    { value: 'in_progress', label: 'In corso' },
    { value: 'on_hold', label: 'In pausa' },
    { value: 'completed', label: 'Completato' },
    { value: 'cancelled', label: 'Annullato' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Bassa' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? 'Modifica Progetto' : 'Nuovo Progetto'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Progetto *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.locationId}
                onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
              >
                <option value="">Seleziona location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.address.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Project['type'] }))}
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Project['status'] }))}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorità *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Project['priority'] }))}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Inizio Pianificata *</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.dates.startPlanned}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dates: { ...prev.dates, startPlanned: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fine Pianificata *</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.dates.endPlanned}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dates: { ...prev.dates, endPlanned: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Inizio Effettiva</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.dates.startActual || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dates: { ...prev.dates, startActual: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fine Effettiva</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.dates.endActual || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dates: { ...prev.dates, endActual: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Budget</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Pianificato (€) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.budget.planned}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    budget: { ...prev.budget, planned: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Approvato (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.budget.approved}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    budget: { ...prev.budget, approved: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Speso (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.budget.spent}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    budget: { ...prev.budget, spent: parseFloat(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Team</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.projectManager}
                onChange={(e) => setFormData(prev => ({ ...prev, projectManager: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Aggiungi membro del team..."
                  value={newTeamMember}
                  onChange={(e) => setNewTeamMember(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
                />
                <Button type="button" onClick={addTeamMember}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.team.map((member) => (
                  <span
                    key={member}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {member}
                    <button
                      type="button"
                      onClick={() => removeTeamMember(member)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit">
              {project ? 'Salva Modifiche' : 'Crea Progetto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  location,
  onEdit,
  onDelete,
  onView
}: {
  project: Project;
  location?: Location;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onView: (project: Project) => void;
}) {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
          <p className="text-sm text-gray-600">{project.description}</p>
        </div>
        <div className="flex space-x-2 ml-4">
          <Button variant="ghost" size="sm" onClick={() => onView(project)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(project)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(project.id)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Building2 className="h-4 w-4 mr-2" />
          {location ? `${location.name} - ${location.address.city}` : 'Location non trovata'}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          {formatDate(project.dates.startPlanned)} - {formatDate(project.dates.endPlanned)}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          {project.projectManager} {project.team.length > 0 && `+${project.team.length}`}
        </div>
      </div>

      {/* Budget Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Budget</span>
          <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(project.budget.spent)} / {formatCurrency(project.budget.approved)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          ></div>
        </div>
        {isOverBudget && (
          <div className="flex items-center text-xs text-red-600 mt-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            Sforamento budget: {formatCurrency(project.budget.spent - project.budget.approved)}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusIcon(project.status)}
            <span className="ml-1">{getStatusLabel(project.status)}</span>
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
            {project.priority === 'low' ? 'Bassa' :
             project.priority === 'medium' ? 'Media' :
             project.priority === 'high' ? 'Alta' : 'Urgente'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {formatDate(project.dates.updatedAt)}
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const { data: projects, addItem, updateItem, deleteItem, loading, error } = useProjects();
  const { data: locations } = useLocations();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [viewingProject, setViewingProject] = useState<Project | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  const handleSave = (formData: ProjectFormData) => {
    const projectData = {
      ...formData,
      phases: editingProject?.phases || [],
      documents: editingProject?.documents || [],
      photos: editingProject?.photos || [],
      id: editingProject?.id || generateId(),
      dates: {
        ...formData.dates,
        createdAt: editingProject?.dates.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    if (editingProject) {
      updateItem(editingProject.id, projectData);
    } else {
      addItem(projectData);
    }

    setShowForm(false);
    setEditingProject(undefined);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo progetto?')) {
      deleteItem(id);
    }
  };

  const handleView = (project: Project) => {
    setViewingProject(project);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.projectManager.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    const matchesLocation = filterLocation === 'all' || project.locationId === filterLocation;

    return matchesSearch && matchesStatus && matchesPriority && matchesLocation;
  });

  // Statistics
  const totalBudget = projects.reduce((sum, p) => sum + p.budget.approved, 0);
  const spentBudget = projects.reduce((sum, p) => sum + p.budget.spent, 0);
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progetti</h1>
          <p className="text-gray-600">Gestisci tutti i progetti di ristrutturazione</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Progetto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Totale Progetti</p>
              <p className="text-lg font-semibold">{projects.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <PlayCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">In Corso</p>
              <p className="text-lg font-semibold">{activeProjects}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Completati</p>
              <p className="text-lg font-semibold">{completedProjects}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Euro className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Budget Totale</p>
              <p className="text-lg font-semibold">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca progetti..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tutti gli stati</option>
          <option value="planning">Pianificazione</option>
          <option value="approved">Approvato</option>
          <option value="in_progress">In corso</option>
          <option value="on_hold">In pausa</option>
          <option value="completed">Completato</option>
          <option value="cancelled">Annullato</option>
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">Tutte le priorità</option>
          <option value="low">Bassa</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
        >
          <option value="all">Tutte le locations</option>
          {locations.map(location => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      {/* Budget Overview */}
      {totalBudget > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Budget Totale Approvato</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalBudget)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Speso</p>
              <p className="text-2xl font-semibold text-blue-600">{formatCurrency(spentBudget)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rimanente</p>
              <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalBudget - spentBudget)}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full"
              style={{ width: `${totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun progetto</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterLocation !== 'all'
              ? 'Nessun progetto corrisponde ai filtri selezionati.'
              : 'Inizia creando il tuo primo progetto.'
            }
          </p>
          {!searchQuery && filterStatus === 'all' && filterPriority === 'all' && filterLocation === 'all' && (
            <div className="mt-6">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Progetto
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              location={locations.find(l => l.id === project.locationId)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(undefined);
          }}
        />
      )}

      {/* Project Details Modal */}
      {viewingProject && (
        <ProjectDetails
          project={viewingProject}
          location={locations.find(l => l.id === viewingProject.locationId)}
          onClose={() => setViewingProject(undefined)}
          onEdit={(project) => {
            setViewingProject(undefined);
            setEditingProject(project);
            setShowForm(true);
          }}
          onUpdateProject={(updatedProject) => {
            console.log('🏢 PROJECTS - Updating project in localStorage:', updatedProject);
            console.log('🏢 PROJECTS - Project phases:', updatedProject.phases);
            console.log('🏢 PROJECTS - Phase contractors:', updatedProject.phases.map(p => ({ name: p.name, contractors: p.assignedContractors })));
            updateItem(updatedProject.id, updatedProject);
            setViewingProject(updatedProject);
          }}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Errore: {error}
        </div>
      )}
    </div>
  );
}