'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { TaskEnhanced, TaskType, TaskPriority, TaskStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { useProjects } from '@/hooks/useProjects';

interface TaskFormProps {
  task?: TaskEnhanced;
  projectId?: string; // Pre-compilato se creato da progetto
  onSave: (taskData: Omit<TaskEnhanced, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const taskTypes: { value: TaskType; label: string }[] = [
  { value: 'construction', label: 'Costruzione' },
  { value: 'electrical', label: 'Elettrico' },
  { value: 'plumbing', label: 'Idraulico' },
  { value: 'hvac', label: 'Climatizzazione' },
  { value: 'finishing', label: 'Finiture' },
  { value: 'inspection', label: 'Ispezione' },
  { value: 'documentation', label: 'Documentazione' },
  { value: 'procurement', label: 'Acquisti' },
  { value: 'technology', label: 'Tecnologia' },
  { value: 'signage', label: 'Insegne' },
  { value: 'administrative', label: 'Amministrativo' },
  { value: 'other', label: 'Altro' }
];

const priorities: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Bassa', color: 'text-gray-600' },
  { value: 'medium', label: 'Media', color: 'text-yellow-600' },
  { value: 'high', label: 'Alta', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-600' }
];

const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Da Fare' },
  { value: 'in_progress', label: 'In Corso' },
  { value: 'under_review', label: 'In Revisione' },
  { value: 'on_hold', label: 'In Attesa' },
  { value: 'blocked', label: 'Bloccato' },
  { value: 'completed', label: 'Completato' },
  { value: 'cancelled', label: 'Cancellato' }
];

export function TaskForm({ task, projectId: initialProjectId, onSave, onCancel }: TaskFormProps) {
  const { data: projects = [] } = useProjects();
  const projectsList = Array.isArray(projects) ? projects : [];

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    projectId: task?.projectId || initialProjectId || '',
    phaseId: task?.phaseId || '',
    type: task?.type || 'other' as TaskType,
    priority: task?.priority || 'medium' as TaskPriority,
    status: task?.status || 'pending' as TaskStatus,
    assignedTo: task?.assignedTo || [],
    dueDate: task?.dueDate || '',
    estimatedHours: task?.estimatedHours || 0,
    tags: task?.tags || [],
    checklist: task?.checklist || [],
    approvalRequired: task?.approvalRequired || false,
  });

  const [newTag, setNewTag] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get selected project phases
  const selectedProject = projectsList.find(p => p.id === formData.projectId);
  const availablePhases = selectedProject?.phases || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Il progetto è obbligatorio';
    }

    if (formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Le ore stimate devono essere positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave({
      ...formData,
      progressPercentage: task?.progressPercentage || 0,
      actualHours: task?.actualHours,
      remainingHours: task?.remainingHours,
      createdBy: 'user-001', // TODO: Get from auth context
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: [
          ...prev.checklist,
          {
            id: `cl-${Date.now()}`,
            title: newChecklistItem.trim(),
            completed: false
          }
        ]
      }));
      setNewChecklistItem('');
    }
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter(item => item.id !== itemId)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">
              {task ? 'Modifica Task' : 'Nuovo Task'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo Task *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Es. Completare demolizione pareti interne"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descrizione dettagliata del task..."
              />
            </div>

            {/* Project and Phase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progetto *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value, phaseId: '' }))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.projectId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!!initialProjectId}
                >
                  <option value="">Seleziona progetto...</option>
                  {projectsList.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                {errors.projectId && (
                  <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fase
                </label>
                <select
                  value={formData.phaseId}
                  onChange={(e) => setFormData(prev => ({ ...prev, phaseId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!formData.projectId || availablePhases.length === 0}
                >
                  <option value="">Nessuna fase</option>
                  {availablePhases.map(phase => (
                    <option key={phase.id} value={phase.id}>
                      {phase.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type, Priority, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TaskType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {taskTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorità
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stato
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date and Estimated Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scadenza
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ore Stimate
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.estimatedHours ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.estimatedHours && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimatedHours}</p>
                )}
              </div>
            </div>

            {/* Approval Required */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="approvalRequired"
                checked={formData.approvalRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, approvalRequired: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="approvalRequired" className="ml-2 block text-sm text-gray-700">
                Richiede approvazione
              </label>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Aggiungi tag..."
                />
                <Button type="button" onClick={handleAddTag} variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checklist
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Aggiungi elemento checklist..."
                />
                <Button type="button" onClick={handleAddChecklistItem} variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1 text-sm text-gray-700">{item.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button type="submit" variant="primary" className="flex-1">
                {task ? 'Salva Modifiche' : 'Crea Task'}
              </Button>
              <Button type="button" variant="secondary" onClick={onCancel}>
                Annulla
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}