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
  Target,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate, formatCurrency, generateId } from '@/lib/utils';
import { useContractors } from '@/hooks/useContractors';
import { useQuotes } from '@/hooks/useQuotes';
import QuoteSelector from './QuoteSelector';
import QuoteDetails from './QuoteDetails';
import type { ProjectPhase, Task, Quote } from '@/types';

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

function PhaseForm(props: {
  phase?: ProjectPhase;
  phases: ProjectPhase[];
  onSave: (data: PhaseFormData) => void;
  onCancel: () => void;
}) {
  const { phase, phases, onSave, onCancel } = props;
  const { data: contractors } = useContractors();

  // Debug log
  console.log('📋 PHASE FORM - Contractors loaded:', contractors.length);
  console.log('📋 PHASE FORM - First contractor:', contractors[0]);
  console.log('📋 PHASE FORM - Active contractors:', contractors.filter(c => c.status === 'active').length);

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

  const [selectedContractor, setSelectedContractor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addContractor = () => {
    console.log('➕ ADDING CONTRACTOR:', selectedContractor);
    console.log('➕ Current assigned:', formData.assignedContractors);
    console.log('➕ Selected contractor value:', selectedContractor);
    console.log('➕ Already included?', formData.assignedContractors.includes(selectedContractor));

    if (selectedContractor && !formData.assignedContractors.includes(selectedContractor)) {
      console.log('✅ Contractor added successfully');
      const newFormData = {
        ...formData,
        assignedContractors: [...formData.assignedContractors, selectedContractor]
      };
      console.log('✅ New formData.assignedContractors:', newFormData.assignedContractors);
      setFormData(newFormData);
      setSelectedContractor('');
    } else {
      console.log('❌ Contractor not added - already exists or empty');
      console.log('❌ selectedContractor:', selectedContractor);
      console.log('❌ isEmpty:', !selectedContractor);
      console.log('❌ alreadyExists:', formData.assignedContractors.includes(selectedContractor));
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
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedContractor}
                onChange={(e) => setSelectedContractor(e.target.value)}
              >
                <option value="">Seleziona fornitore...</option>
                {contractors
                  .filter(contractor => contractor.status === 'active' && !formData.assignedContractors.includes(contractor.name || contractor.companyName))
                  .map(contractor => (
                    <option key={contractor.id} value={contractor.name || contractor.companyName}>
                      {contractor.name || contractor.companyName} - {contractor.specializations.slice(0, 2).join(', ')}
                    </option>
                  ))}
              </select>
              <Button type="button" onClick={addContractor} disabled={!selectedContractor}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {contractors.length === 0 ? (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded mb-2">
                ⚠️ Nessun fornitore disponibile. Crea prima i fornitori nella sezione dedicata.
              </div>
            ) : (
              <div className="text-xs text-green-600 mb-1">
                ✅ {contractors.filter(c => c.status === 'active').length} fornitori attivi disponibili
              </div>
            )}
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
  onUpdateProgress,
  onRequestQuote,
  projectId,
  onViewQuote
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
  onRequestQuote?: (phase: ProjectPhase) => void;
  projectId?: string;
  onViewQuote?: (quote: Quote) => void;
}) {
  const [showProgressEdit, setShowProgressEdit] = useState(false);
  const [tempProgress, setTempProgress] = useState(phase.progress);
  const { data: quotes } = useQuotes();
  const { data: contractors } = useContractors();

  // Get quotes linked to this phase
  const phaseQuotes = quotes.filter(quote =>
    quote.projectId === projectId && quote.phaseId === phase.id
  );

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

  const getQuoteStatusBadge = (status: Quote['status']) => {
    const statusConfig = {
      draft: { label: 'Bozza', color: 'bg-gray-100 text-gray-600' },
      sent: { label: 'Inviato', color: 'bg-blue-100 text-blue-600' },
      received: { label: 'Ricevuto', color: 'bg-green-100 text-green-600' },
      under_review: { label: 'In Revisione', color: 'bg-yellow-100 text-yellow-600' },
      approved: { label: 'Approvato', color: 'bg-emerald-100 text-emerald-600' },
      rejected: { label: 'Rifiutato', color: 'bg-red-100 text-red-600' },
      expired: { label: 'Scaduto', color: 'bg-gray-100 text-gray-600' }
    };

    const config = statusConfig[status];
    return config;
  };

  const handleProgressSubmit = () => {
    onUpdateProgress(phase.id, tempProgress);
    setShowProgressEdit(false);
  };

  // Calculate duration
  const startDate = new Date(phase.startDate);
  const endDate = new Date(phase.endDate);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start flex-1">
          <div className="flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mr-3 flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{phase.name}</h4>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}>
                  {getStatusIcon(phase.status)}
                  <span className="ml-1">{getStatusLabel(phase.status)}</span>
                </span>
                {showProgressEdit ? (
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tempProgress}
                      onChange={(e) => setTempProgress(parseInt(e.target.value))}
                      className="w-14 px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-500">%</span>
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
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {phase.progress}%
                  </button>
                )}
              </div>
            </div>

            {phase.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{phase.description}</p>
            )}

            <div className="grid grid-cols-3 gap-3 text-xs mb-2">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-3 w-3 mr-1" />
                <span className="truncate">{formatDate(phase.startDate)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-3 w-3 mr-1" />
                <span>{duration}gg</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Euro className="h-3 w-3 mr-1" />
                <span className="truncate">{formatCurrency(phase.budget)}</span>
              </div>
            </div>

            {phase.assignedContractors.length > 0 && (
              <div className="flex items-center text-xs text-gray-600 mb-2">
                <Users className="h-3 w-3 mr-1" />
                <div className="flex flex-wrap gap-1">
                  {phase.assignedContractors.slice(0, 2).map((contractor, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                      {contractor}
                    </span>
                  ))}
                  {phase.assignedContractors.length > 2 && (
                    <span className="text-gray-500">+{phase.assignedContractors.length - 2}</span>
                  )}
                </div>
              </div>
            )}

            {phase.actualCost && (
              <div className="text-xs text-amber-600 mb-2">
                <span className="flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Speso: {formatCurrency(phase.actualCost)}
                  {phase.actualCost > phase.budget && (
                    <span className="ml-1 text-red-600 font-medium">
                      (Sforamento: {formatCurrency(phase.actualCost - phase.budget)})
                    </span>
                  )}
                </span>
              </div>
            )}

            {phase.dependencies && phase.dependencies.length > 0 && (
              <div className="text-xs text-gray-500 mb-2">
                <span className="flex items-center">
                  <Target className="h-3 w-3 mr-1" />
                  Dipendenze: {phase.dependencies.length}
                </span>
              </div>
            )}

            {/* Progress Bar - Compatta */}
            <div className="mb-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    phase.progress === 100 ? 'bg-green-500' :
                    phase.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  style={{ width: `${phase.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Preventivi Collegati */}
            {phaseQuotes.length > 0 && (
              <div className="mb-2 p-2 bg-green-50 rounded-md border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-green-700 flex items-center">
                    <Euro className="h-3 w-3 mr-1" />
                    Preventivi ({phaseQuotes.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {phaseQuotes.slice(0, 2).map((quote) => {
                    const contractor = contractors.find(c => c.id === quote.contractorId);
                    const statusConfig = getQuoteStatusBadge(quote.status);
                    return (
                      <div key={quote.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className="truncate font-medium text-gray-900">
                            {contractor?.name || contractor?.companyName || 'N/A'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-green-700">
                            €{quote.totalAmount.toLocaleString()}
                          </span>
                          {onViewQuote && (
                            <button
                              onClick={() => onViewQuote(quote)}
                              className="text-gray-400 hover:text-blue-600"
                              title="Visualizza dettagli"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {phaseQuotes.length > 2 && (
                    <div className="text-xs text-green-600 text-center">
                      +{phaseQuotes.length - 2} altri preventivi
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Status Change */}
            <div className="flex items-center justify-between">
              <select
                value={phase.status}
                onChange={(e) => onUpdateStatus(phase.id, e.target.value as ProjectPhase['status'])}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>

              <div className="text-xs text-gray-400">
                Inizio: {new Date(phase.startDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-1 ml-3">
          <Button variant="ghost" size="sm" onClick={() => onEdit(phase)} className="h-7 w-7 p-0">
            <Edit className="h-3 w-3" />
          </Button>
          {onRequestQuote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRequestQuote(phase)}
              className="h-7 w-7 p-0"
              title="Richiedi Preventivo"
            >
              <Euro className="h-3 w-3 text-green-600" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onDelete(phase.id)} className="h-7 w-7 p-0">
            <Trash2 className="h-3 w-3 text-red-600" />
          </Button>
          {index > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onMoveUp(phase.id)} className="h-7 w-7 p-0">
              <ArrowUp className="h-3 w-3" />
            </Button>
          )}
          {index < totalPhases - 1 && (
            <Button variant="ghost" size="sm" onClick={() => onMoveDown(phase.id)} className="h-7 w-7 p-0">
              <ArrowDown className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProjectPhases({
  phases,
  onUpdatePhases,
  onRequestQuote,
  projectId
}: {
  phases: ProjectPhase[];
  onUpdatePhases: (phases: ProjectPhase[]) => void;
  onRequestQuote?: (phase: ProjectPhase) => void;
  projectId?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | undefined>();
  const [showQuoteSelector, setShowQuoteSelector] = useState(false);
  const [selectedPhaseForQuote, setSelectedPhaseForQuote] = useState<ProjectPhase | undefined>();
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | undefined>();

  const handleSave = (formData: PhaseFormData) => {
    console.log('🔄 SAVING PHASE - FormData:', formData);
    console.log('🔄 FormData assignedContractors:', formData.assignedContractors);
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

  const handleRequestQuote = (phase: ProjectPhase) => {
    setSelectedPhaseForQuote(phase);
    setShowQuoteSelector(true);
  };

  const handleCreateNewQuote = () => {
    setShowQuoteSelector(false);
    if (onRequestQuote && selectedPhaseForQuote) {
      onRequestQuote(selectedPhaseForQuote);
    }
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowQuoteDetails(true);
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

          {/* Phases List with Vertical Scrolling */}
          <div className="max-h-96 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                onRequestQuote={handleRequestQuote}
                projectId={projectId}
                onViewQuote={handleViewQuote}
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

      {/* Quote Selector Modal */}
      {showQuoteSelector && selectedPhaseForQuote && projectId && (
        <QuoteSelector
          projectId={projectId}
          phase={selectedPhaseForQuote}
          onClose={() => {
            setShowQuoteSelector(false);
            setSelectedPhaseForQuote(undefined);
          }}
          onCreateNew={handleCreateNewQuote}
          onViewQuote={handleViewQuote}
        />
      )}

      {/* Quote Details Modal */}
      {showQuoteDetails && selectedQuote && (
        <QuoteDetails
          quote={selectedQuote}
          onClose={() => {
            setShowQuoteDetails(false);
            setSelectedQuote(undefined);
          }}
          onEdit={(quote) => {
            setShowQuoteDetails(false);
            // Navigate to quotes page with edit context
            if (onRequestQuote) {
              localStorage.setItem('editQuoteContext', JSON.stringify({ quoteId: quote.id }));
              onRequestQuote(selectedPhaseForQuote!);
            }
          }}
        />
      )}
    </div>
  );
}