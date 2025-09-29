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
    phaseId: phaseId || quote?.phaseId || '', // DEPRECATED: manteniamo per backward compatibility
    phaseIds: quote?.phaseIds || (phaseId ? [phaseId] : []), // NEW: array di fasi
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

  // Gestione percentuali per breakdown fasi
  const [phasePercentages, setPhasePercentages] = useState<Record<string, number>>(() => {
    if (quote?.phaseBreakdown) {
      const percentages: Record<string, number> = {};
      quote.phaseBreakdown.forEach(breakdown => {
        percentages[breakdown.phaseId] = quote.totalAmount > 0
          ? Math.round((breakdown.subtotal / quote.totalAmount) * 100)
          : 0;
      });
      return percentages;
    }
    return {};
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

  // Auto-distribuzione equa delle percentuali quando cambiano le fasi selezionate
  useEffect(() => {
    if (formData.phaseIds.length > 1) {
      const equalPercentage = Math.floor(100 / formData.phaseIds.length);
      const remainder = 100 - (equalPercentage * formData.phaseIds.length);

      const newPercentages: Record<string, number> = {};
      formData.phaseIds.forEach((phaseId, index) => {
        // Aggiungi il resto alla prima fase
        newPercentages[phaseId] = equalPercentage + (index === 0 ? remainder : 0);
      });

      setPhasePercentages(newPercentages);
    } else {
      setPhasePercentages({});
    }
  }, [formData.phaseIds]);

  // Funzione per aggiornare le percentuali
  const updatePhasePercentage = (phaseId: string, percentage: number) => {
    setPhasePercentages(prev => ({
      ...prev,
      [phaseId]: Math.max(0, Math.min(100, percentage))
    }));
  };

  // Calcola il totale delle percentuali
  const getTotalPercentage = () => {
    return Object.values(phasePercentages).reduce((sum, perc) => sum + perc, 0);
  };

  // Funzione per normalizzare le percentuali al 100%
  const normalizePercentages = () => {
    const total = getTotalPercentage();
    if (total === 0) return;

    const normalizedPercentages: Record<string, number> = {};
    Object.entries(phasePercentages).forEach(([phaseId, percentage]) => {
      normalizedPercentages[phaseId] = Math.round((percentage / total) * 100);
    });

    setPhasePercentages(normalizedPercentages);
  };

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

    // Validazione percentuali per preventivi multi-fase
    if (formData.phaseIds.length > 1) {
      const totalPercentage = getTotalPercentage();
      if (totalPercentage !== 100) {
        alert(`Le percentuali devono sommare al 100%. Attualmente: ${totalPercentage}%. Usa il pulsante "Normalizza" per correggere automaticamente.`);
        return;
      }
    }

    // Crea phaseBreakdown automatico se ci sono più fasi selezionate
    const phaseBreakdown = formData.phaseIds.length > 1 ?
      formData.phaseIds.map(phaseId => {
        const phase = phases.find(p => p.id === phaseId);
        const percentage = phasePercentages[phaseId] || 0;
        const subtotal = Math.round((formData.totalAmount * percentage) / 100 * 100) / 100; // Arrotonda a centesimi

        return {
          phaseId,
          phaseName: phase?.name || 'Fase sconosciuta',
          items: [{
            id: `auto-${phaseId}`,
            description: `Lavori per ${phase?.name || 'Fase sconosciuta'} (${percentage}% del totale)`,
            quantity: 1,
            unitPrice: subtotal,
            totalPrice: subtotal,
            unit: 'forfait',
            category: 'Lavori',
            phaseId: phaseId
          }],
          subtotal: subtotal,
          notes: `Valorizzazione automatica: ${percentage}% del totale preventivo`
        };
      }) : undefined;

    const quoteData: Omit<Quote, 'id'> = {
      ...formData,
      // Assicura che phaseIds sia sempre popolato
      phaseIds: formData.phaseIds,
      // Mantieni phaseId per backward compatibility
      phaseId: formData.phaseIds[0] || '',
      items,
      documents,
      phaseBreakdown,
      approval: quote?.approval || {},
      // Inizializza campi per pagamenti se non presenti
      paymentTerms: quote?.paymentTerms || [],
      payments: quote?.payments || [],
      paymentConfig: quote?.paymentConfig || {
        vatRate: 22,
        paymentMethod: 'bank_transfer'
      }
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fasi del Progetto
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                {!formData.projectId ? (
                  <p className="text-sm text-gray-500">Seleziona prima un progetto</p>
                ) : phases.length === 0 ? (
                  <p className="text-sm text-gray-500">Nessuna fase disponibile</p>
                ) : (
                  <>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.phaseIds.length === phases.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Seleziona tutte le fasi
                            setFormData({
                              ...formData,
                              phaseIds: phases.map(p => p.id),
                              phaseId: phases[0]?.id || '' // backward compatibility
                            });
                          } else {
                            // Deseleziona tutte
                            setFormData({
                              ...formData,
                              phaseIds: [],
                              phaseId: ''
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium">Tutte le fasi</span>
                    </label>
                    <hr className="border-gray-200" />
                    {phases.map(phase => (
                      <label key={phase.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.phaseIds.includes(phase.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newPhaseIds = [...formData.phaseIds, phase.id];
                              setFormData({
                                ...formData,
                                phaseIds: newPhaseIds,
                                phaseId: newPhaseIds[0] // backward compatibility
                              });
                            } else {
                              const newPhaseIds = formData.phaseIds.filter(id => id !== phase.id);
                              setFormData({
                                ...formData,
                                phaseIds: newPhaseIds,
                                phaseId: newPhaseIds[0] || ''
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{phase.name}</span>
                        <span className="text-xs text-gray-500">
                          (€{phase.budget?.toLocaleString() || 'N/A'})
                        </span>
                      </label>
                    ))}
                  </>
                )}
              </div>
              {formData.phaseIds.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  {formData.phaseIds.length} fase{formData.phaseIds.length !== 1 ? 'i' : ''} selezionat{formData.phaseIds.length !== 1 ? 'e' : 'a'}
                </p>
              )}
            </div>

            {/* Gestione Percentuali per Fasi Multiple - Layout Compatto */}
            {formData.phaseIds.length > 1 && (
              <div className="md:col-span-2">
                <div className="border border-gray-200 rounded-lg p-3 bg-blue-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Ripartizione Percentuale ({formData.phaseIds.length} fasi)
                    </h4>
                    <button
                      type="button"
                      onClick={normalizePercentages}
                      className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      title="Normalizza al 100%"
                    >
                      Normalizza
                    </button>
                  </div>

                  {/* Container con scrolling per molte fasi */}
                  <div className="max-h-60 overflow-y-auto space-y-2 mb-3">
                    {formData.phaseIds.map(phaseId => {
                      const phase = phases.find(p => p.id === phaseId);
                      const percentage = phasePercentages[phaseId] || 0;
                      const calculatedAmount = Math.round((formData.totalAmount * percentage) / 100 * 100) / 100;

                      return (
                        <div key={phaseId} className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {phase?.name || 'Fase sconosciuta'}
                            </div>
                            <div className="text-gray-500">
                              Budget: €{phase?.budget?.toLocaleString() || 'N/A'}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={percentage}
                              onChange={(e) => updatePhasePercentage(phaseId, parseInt(e.target.value) || 0)}
                              className="w-12 text-center px-1 py-1 border border-gray-300 rounded text-xs"
                            />
                            <span className="text-gray-600">%</span>
                          </div>

                          <div className="text-right min-w-[60px] flex-shrink-0">
                            <div className="font-medium text-gray-900">
                              €{calculatedAmount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Riepilogo compatto */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 bg-white rounded px-3 py-2">
                    <span className="text-sm font-medium text-gray-700">Totale:</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        getTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getTotalPercentage()}%
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        €{formData.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {getTotalPercentage() !== 100 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                      ⚠️ Le percentuali devono sommare al 100%. Usa "Normalizza" per correggere.
                    </div>
                  )}
                </div>
              </div>
            )}

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