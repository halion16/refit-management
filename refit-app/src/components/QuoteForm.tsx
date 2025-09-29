'use client';

import { useState, useEffect } from 'react';
import { Quote, QuoteItem, Project, ProjectPhase, Contractor, Document } from '@/types';
import { useProjects } from '@/hooks/useProjects';
import { useContractors } from '@/hooks/useContractors';
import DocumentUpload from './DocumentUpload';

interface QuoteFormProps {
  quote?: Quote;
  onSave: (quote: Omit<Quote, 'id'>) => void;
  onCancel: () => void;
  projectId?: string;
  phaseId?: string;
}

export default function QuoteForm({ quote, onSave, onCancel, projectId, phaseId }: QuoteFormProps) {
  const { data: projects } = useProjects();
  const { data: contractors } = useContractors();

  const [formData, setFormData] = useState({
    projectId: projectId || quote?.projectId || '',
    phaseId: phaseId || quote?.phaseId || '',
    contractorId: quote?.contractorId || '',
    quoteNumber: quote?.quoteNumber || '',
    status: quote?.status || 'draft' as const,
    requestDate: quote?.requestDate || new Date().toISOString().split('T')[0],
    responseDate: quote?.responseDate || '',
    validUntil: quote?.validUntil || '',
    totalAmount: quote?.totalAmount || 0,
    currency: quote?.currency || 'EUR',
    terms: quote?.terms || '',
    notes: quote?.notes || ''
  });

  const [items, setItems] = useState<QuoteItem[]>(quote?.items || []);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [documents, setDocuments] = useState<Document[]>(quote?.documents || []);

  useEffect(() => {
    if (formData.projectId) {
      const project = projects.find(p => p.id === formData.projectId);
      if (project) {
        setPhases(project.phases);
      }
    }
  }, [formData.projectId, projects]);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [items]);

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      unit: 'pz',
      category: ''
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        updated.totalPrice = updated.quantity * updated.unitPrice;
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectId || !formData.contractorId) {
      alert('Seleziona progetto e fornitore');
      return;
    }

    const quoteData: Omit<Quote, 'id'> = {
      ...formData,
      items,
      documents,
      approval: quote?.approval || {}
    };

    onSave(quoteData);
  };

  const selectedProject = projects.find(p => p.id === formData.projectId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {quote ? 'Modifica Preventivo' : 'Nuovo Preventivo'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dati Generali */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progetto *
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value, phaseId: '' })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleziona progetto</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fase (opzionale)
              </label>
              <select
                value={formData.phaseId}
                onChange={(e) => setFormData({ ...formData, phaseId: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!formData.projectId}
              >
                <option value="">Tutto il progetto</option>
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>
                    {phase.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornitore *
              </label>
              <select
                value={formData.contractorId}
                onChange={(e) => setFormData({ ...formData, contractorId: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleziona fornitore</option>
                {contractors.map(contractor => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name || contractor.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numero Preventivo
              </label>
              <input
                type="text"
                value={formData.quoteNumber}
                onChange={(e) => setFormData({ ...formData, quoteNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Es. PREV-2024-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Richiesta *
              </label>
              <input
                type="date"
                value={formData.requestDate}
                onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Risposta
              </label>
              <input
                type="date"
                value={formData.responseDate}
                onChange={(e) => setFormData({ ...formData, responseDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valido Fino Al
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stato
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Quote['status'] })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Bozza</option>
                <option value="sent">Inviato</option>
                <option value="received">Ricevuto</option>
                <option value="under_review">In Revisione</option>
                <option value="approved">Approvato</option>
                <option value="rejected">Rifiutato</option>
                <option value="expired">Scaduto</option>
              </select>
            </div>
          </div>

          {/* Voci di Preventivo */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Voci di Preventivo</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Aggiungi Voce
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-md">
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Descrizione
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Descrizione lavoro/materiale"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Q.tà
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Unità
                    </label>
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="pz">pz</option>
                      <option value="mq">mq</option>
                      <option value="ml">ml</option>
                      <option value="h">h</option>
                      <option value="gg">gg</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Prezzo Unit.
                    </label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => updateItem(item.id, { category: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Es. Manodopera"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Totale
                    </label>
                    <div className="p-2 bg-gray-100 rounded-md text-sm font-medium">
                      €{item.totalPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Rimuovi voce"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Totale Preventivo:</span>
                <span className="text-xl font-bold text-blue-600">€{formData.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Note e Condizioni */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condizioni
              </label>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Condizioni di pagamento, garanzie, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Note aggiuntive..."
              />
            </div>
          </div>

          {/* Documenti */}
          <div>
            <DocumentUpload
              relatedTo={{
                type: 'quote',
                id: quote?.id || 'new-quote'
              }}
              onDocumentsChange={setDocuments}
              allowedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xlsx', '.xls']}
              maxSizeBytes={20 * 1024 * 1024} // 20MB for quotes
              showTitle={true}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {quote ? 'Aggiorna' : 'Crea'} Preventivo
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}