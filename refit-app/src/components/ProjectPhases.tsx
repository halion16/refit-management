'use client';

import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  Calendar,
  Euro,
  Users,
  ArrowUp,
  ArrowDown,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate, formatCurrency, generateId } from '@/lib/utils';
import type { ProjectPhase, Task } from '@/types';

interface PhaseFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  assignedContractors: string[];
  dependencies: string[];
}

const initialPhaseFormData: PhaseFormData = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  budget: 0,
  assignedContractors: [],
  dependencies: []
};

function PhaseForm({
  phase,
  phases,
  onSave,
  onCancel
}: {
  phase?: ProjectPhase;
  phases: ProjectPhase[];
  onSave: (data: PhaseFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<PhaseFormData>(
    phase ? {
      name: phase.name,
      description: phase.description,
      startDate: phase.startDate,
      endDate: phase.endDate,
      budget: phase.budget,
      assignedContractors: phase.assignedContractors,
      dependencies: phase.dependencies
    } : initialPhaseFormData
  );

  const [newContractor, setNewContractor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addContractor = () => {
    if (newContractor.trim() && !formData.assignedContractors.includes(newContractor.trim())) {
      setFormData(prev => ({
        ...prev,
        assignedContractors: [...prev.assignedContractors, newContractor.trim()]
      }));
      setNewContractor('');
    }
  };

  const removeContractor = (contractor: string) => {
    setFormData(prev => ({
      ...prev,
      assignedContractors: prev.assignedContractors.filter(c => c !== contractor)
    }));
  };

  const availableDependencies = phases.filter(p => p.id !== phase?.id);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {phase ? 'Modifica Fase' : 'Nuova Fase'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fase *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="es. Demolizione, Elettrico, Pavimentazione..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrizione dettagliata della fase..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Inizio *</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fine *</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (€) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          {/* Dependencies */}
          {availableDependencies.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dipendenze</label>
              <select
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.dependencies}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dependencies: Array.from(e.target.selectedOptions, option => option.value)
                }))}
              >
                {availableDependencies.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Tieni premuto Ctrl (Cmd su Mac) per selezionare multiple fasi
              </p>
            </div>
          )}

          {/* Assigned Contractors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fornitori Assegnati</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome fornitore..."
                value={newContractor}
                onChange={(e) => setNewContractor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContractor())}
              />
              <Button type="button" onClick={addContractor}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.assignedContractors.map((contractor) => (
                <span
                  key={contractor}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                >
                  <Users className="h-3 w-3 mr-1" />
                  {contractor}
                  <button
                    type="button"
                    onClick={() => removeContractor(contractor)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit">
              {phase ? 'Salva Modifiche' : 'Crea Fase'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PhaseCard({
  phase,
  index,
  totalPhases,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUpdateStatus,
  onUpdateProgress
}: {
  phase: ProjectPhase;
  index: number;
  totalPhases: number;
  onEdit: (phase: ProjectPhase) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onUpdateStatus: (id: string, status: ProjectPhase['status']) => void;
  onUpdateProgress: (id: string, progress: number) => void;
}) {
  const [showProgressEdit, setShowProgressEdit] = useState(false);
  const [tempProgress, setTempProgress] = useState(phase.progress);

  const getStatusColor = (status: ProjectPhase['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ProjectPhase['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'blocked': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: ProjectPhase['status']) => {
    switch (status) {
      case 'pending': return 'In Attesa';
      case 'in_progress': return 'In Corso';
      case 'completed': return 'Completata';
      case 'blocked': return 'Bloccata';
      default: return status;
    }
  };

  const statusOptions: ProjectPhase['status'][] = ['pending', 'in_progress', 'completed', 'blocked'];

  const handleProgressSubmit = () => {
    onUpdateProgress(phase.id, tempProgress);
    setShowProgressEdit(false);
  };

  // Calculate duration
  const startDate = new Date(phase.startDate);
  const endDate = new Date(phase.endDate);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mr-3 flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{phase.name}</h4>
            {phase.description && (
              <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(phase.startDate)} - {formatDate(phase.endDate)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{duration} giorni</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Euro className="h-4 w-4 mr-2" />
                <span>{formatCurrency(phase.budget)}</span>
                {phase.actualCost && (
                  <span className="ml-2 text-xs">
                    (Speso: {formatCurrency(phase.actualCost)})
                  </span>
                )}
              </div>
              <div className="flex items-center text-gray-600">
                <Target className="h-4 w-4 mr-2" />
                <span>
                  {showProgressEdit ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={tempProgress}
                        onChange={(e) => setTempProgress(parseInt(e.target.value))}
                        className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                      <button
                        onClick={handleProgressSubmit}
                        className="text-green-600 hover:text-green-800 text-xs"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setShowProgressEdit(false);
                          setTempProgress(phase.progress);
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowProgressEdit(true)}
                      className="hover:text-blue-600"
                    >
                      {phase.progress}%
                    </button>
                  )}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    phase.progress === 100 ? 'bg-green-500' :
                    phase.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  style={{ width: `${phase.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Dependencies */}
            {phase.dependencies.length > 0 && (
              <div className="mb-3">
                <span className="text-xs text-gray-500">
                  Dipende da: {phase.dependencies.length} fase/i
                </span>
              </div>
            )}

            {/* Assigned Contractors */}
            {phase.assignedContractors.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {phase.assignedContractors.map((contractor) => (
                  <span key={contractor} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    <Users className="h-3 w-3 inline mr-1" />
                    {contractor}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          {/* Move buttons */}
          <div className="flex flex-col">
            <button
              onClick={() => onMoveUp(phase.id)}
              disabled={index === 0}
              className={`p-1 text-gray-400 hover:text-gray-600 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => onMoveDown(phase.id)}
              disabled={index === totalPhases - 1}
              className={`p-1 text-gray-400 hover:text-gray-600 ${index === totalPhases - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <ArrowDown className="h-3 w-3" />
            </button>
          </div>

          {/* Action buttons */}
          <Button variant="ghost" size="sm" onClick={() => onEdit(phase)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(phase.id)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <select
            value={phase.status}
            onChange={(e) => onUpdateStatus(phase.id, e.target.value as ProjectPhase['status'])}
            className={`text-sm px-3 py-1 rounded-full border-0 font-medium cursor-pointer ${getStatusColor(phase.status)}`}
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-gray-500">
          Fase {index + 1} di {totalPhases}
        </div>
      </div>
    </div>
  );
}

export function ProjectPhases({
  phases,
  onUpdatePhases
}: {
  phases: ProjectPhase[];
  onUpdatePhases: (phases: ProjectPhase[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | undefined>();

  const handleSave = (formData: PhaseFormData) => {
    if (editingPhase) {
      // Update existing phase
      const updatedPhases = phases.map(phase =>
        phase.id === editingPhase.id
          ? {
              ...phase,
              ...formData,
              order: phase.order, // Keep existing order
              duration: Math.ceil(
                (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
              )
            }
          : phase
      );
      onUpdatePhases(updatedPhases);
    } else {
      // Create new phase
      const newPhase: ProjectPhase = {
        ...formData,
        id: generateId(),
        projectId: '', // Will be set by parent
        order: phases.length,
        status: 'pending',
        progress: 0,
        actualCost: 0,
        tasks: [],
        duration: Math.ceil(
          (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
        )
      };
      onUpdatePhases([...phases, newPhase]);
    }

    setShowForm(false);
    setEditingPhase(undefined);
  };

  const handleEdit = (phase: ProjectPhase) => {
    setEditingPhase(phase);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa fase?')) {
      const updatedPhases = phases
        .filter(phase => phase.id !== id)
        .map((phase, index) => ({ ...phase, order: index }));
      onUpdatePhases(updatedPhases);
    }
  };

  const handleMoveUp = (id: string) => {
    const currentIndex = phases.findIndex(phase => phase.id === id);
    if (currentIndex > 0) {
      const newPhases = [...phases];
      [newPhases[currentIndex], newPhases[currentIndex - 1]] =
      [newPhases[currentIndex - 1], newPhases[currentIndex]];

      // Update orders
      newPhases.forEach((phase, index) => {
        phase.order = index;
      });

      onUpdatePhases(newPhases);
    }
  };

  const handleMoveDown = (id: string) => {
    const currentIndex = phases.findIndex(phase => phase.id === id);
    if (currentIndex < phases.length - 1) {
      const newPhases = [...phases];
      [newPhases[currentIndex], newPhases[currentIndex + 1]] =
      [newPhases[currentIndex + 1], newPhases[currentIndex]];

      // Update orders
      newPhases.forEach((phase, index) => {
        phase.order = index;
      });

      onUpdatePhases(newPhases);
    }
  };

  const handleUpdateStatus = (id: string, status: ProjectPhase['status']) => {
    const updatedPhases = phases.map(phase =>
      phase.id === id
        ? {
            ...phase,
            status,
            progress: status === 'completed' ? 100 : phase.progress
          }
        : phase
    );
    onUpdatePhases(updatedPhases);
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    const updatedPhases = phases.map(phase =>
      phase.id === id
        ? {
            ...phase,
            progress: Math.max(0, Math.min(100, progress)),
            status: progress === 100 ? 'completed' :
                   progress > 0 ? 'in_progress' : phase.status
          }
        : phase
    );
    onUpdatePhases(updatedPhases);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Fasi del Progetto</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Fase
        </Button>
      </div>

      {phases.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna fase</h3>
          <p className="mt-1 text-sm text-gray-500">
            Inizia organizzando il progetto in fasi sequenziali.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Prima Fase
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{phases.length}</div>
              <div className="text-sm text-gray-600">Totale Fasi</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {phases.filter(p => p.status === 'in_progress').length}
              </div>
              <div className="text-sm text-blue-600">In Corso</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {phases.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-sm text-green-600">Completate</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {phases.length > 0 ? Math.round(phases.reduce((sum, p) => sum + p.progress, 0) / phases.length) : 0}%
              </div>
              <div className="text-sm text-orange-600">Progresso Medio</div>
            </div>
          </div>

          {/* Phases List */}
          <div className="space-y-4">
            {phases.map((phase, index) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                index={index}
                totalPhases={phases.length}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onUpdateStatus={handleUpdateStatus}
                onUpdateProgress={handleUpdateProgress}
              />
            ))}
          </div>
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <PhaseForm
          phase={editingPhase}
          phases={phases}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingPhase(undefined);
          }}
        />
      )}
    </div>
  );
}