'use client';

import { useState, useEffect } from 'react';
import { PaymentTerm, PaymentTermType, PaymentTemplate } from '@/types';
import { usePayments } from '@/hooks/usePayments';
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Copy,
  DollarSign,
  Calendar,
  Percent,
  ArrowUp,
  ArrowDown,
  BookTemplate
} from 'lucide-react';
import { generateId } from '@/lib/utils';

interface PaymentTermsManagerProps {
  quoteId: string;
  totalAmount: number;
  paymentTerms: PaymentTerm[];
  onPaymentTermsChange: (terms: PaymentTerm[]) => void;
}

export default function PaymentTermsManager({
  quoteId,
  totalAmount,
  paymentTerms,
  onPaymentTermsChange
}: PaymentTermsManagerProps) {
  const { paymentTemplates, addTemplate } = usePayments();
  const [editingTerm, setEditingTerm] = useState<PaymentTerm | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const paymentTypeConfig = {
    advance: { label: 'Acconto', color: 'bg-blue-100 text-blue-800', icon: DollarSign },
    progress: { label: 'SAL', color: 'bg-orange-100 text-orange-800', icon: Calendar },
    completion: { label: 'Saldo', color: 'bg-green-100 text-green-800', icon: Save },
    retention: { label: 'Ritenuta', color: 'bg-red-100 text-red-800', icon: Calendar },
    balance: { label: 'Residuo', color: 'bg-purple-100 text-purple-800', icon: DollarSign }
  };

  const triggerEventConfig = {
    order_confirmation: 'Conferma Ordine',
    delivery: 'Consegna',
    installation_start: 'Inizio Installazione',
    installation_complete: 'Fine Installazione',
    approval: 'Approvazione',
    custom_date: 'Data Specifica'
  };

  const calculateTermAmount = (term: PaymentTerm): number => {
    if (term.fixedAmount) return term.fixedAmount;
    if (term.percentage) return (totalAmount * term.percentage) / 100;
    return 0;
  };

  const getTotalPercentage = (): number => {
    return paymentTerms.reduce((sum, term) => {
      if (term.percentage) return sum + term.percentage;
      return sum;
    }, 0);
  };

  const getTotalFixedAmount = (): number => {
    return paymentTerms.reduce((sum, term) => {
      if (term.fixedAmount) return sum + term.fixedAmount;
      return sum;
    }, 0);
  };

  const addNewTerm = () => {
    const newTerm: PaymentTerm = {
      id: generateId(),
      quoteId,
      description: 'Nuovo pagamento',
      type: 'advance',
      percentage: 0,
      triggerEvent: 'order_confirmation',
      dueAfterDays: 0,
      vatIncluded: true,
      order: paymentTerms.length + 1,
      isActive: true
    };
    setEditingTerm(newTerm);
  };

  const saveTerm = (term: PaymentTerm) => {
    const updatedTerms = editingTerm?.id && paymentTerms.find(t => t.id === editingTerm.id)
      ? paymentTerms.map(t => t.id === term.id ? term : t)
      : [...paymentTerms, term];

    // Riordina i termini
    const reorderedTerms = updatedTerms.map((t, index) => ({ ...t, order: index + 1 }));

    onPaymentTermsChange(reorderedTerms);
    setEditingTerm(null);
  };

  const deleteTerm = (termId: string) => {
    if (confirm('Sei sicuro di voler eliminare questa condizione di pagamento?')) {
      const updatedTerms = paymentTerms
        .filter(t => t.id !== termId)
        .map((t, index) => ({ ...t, order: index + 1 }));
      onPaymentTermsChange(updatedTerms);
    }
  };

  const moveTerm = (termId: string, direction: 'up' | 'down') => {
    const currentIndex = paymentTerms.findIndex(t => t.id === termId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === paymentTerms.length - 1)
    ) {
      return;
    }

    const newTerms = [...paymentTerms];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newTerms[currentIndex], newTerms[targetIndex]] = [newTerms[targetIndex], newTerms[currentIndex]];

    // Aggiorna gli ordini
    const reorderedTerms = newTerms.map((t, index) => ({ ...t, order: index + 1 }));
    onPaymentTermsChange(reorderedTerms);
  };

  const applyTemplate = (template: PaymentTemplate) => {
    const newTerms: PaymentTerm[] = template.paymentTerms.map((termTemplate, index) => ({
      ...termTemplate,
      id: generateId(),
      quoteId,
      order: index + 1
    }));
    onPaymentTermsChange(newTerms);
    setShowTemplateModal(false);
  };

  const saveAsTemplate = () => {
    if (paymentTerms.length === 0) return;

    const templateName = prompt('Nome del template:');
    if (!templateName) return;

    const templateTerms = paymentTerms.map(({ id, quoteId, ...term }) => term);

    addTemplate({
      name: templateName,
      description: `Template creato da preventivo`,
      category: 'custom',
      isDefault: false,
      paymentTerms: templateTerms
    });

    alert('Template salvato con successo!');
  };

  return (
    <div className="space-y-6">
      {/* Header e Statistiche */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Condizioni di Pagamento</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
            <span>Totale Preventivo: €{totalAmount.toLocaleString()}</span>
            <span>•</span>
            <span>Percentuale Coperta: {getTotalPercentage()}%</span>
            <span>•</span>
            <span>Importo Fisso: €{getTotalFixedAmount().toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
          >
            <BookTemplate className="h-4 w-4" />
            Template
          </button>
          <button
            onClick={saveAsTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
            disabled={paymentTerms.length === 0}
          >
            <Save className="h-4 w-4" />
            Salva Template
          </button>
          <button
            onClick={addNewTerm}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Condizione
          </button>
        </div>
      </div>

      {/* Alert per controllo totale */}
      {getTotalPercentage() !== 100 && getTotalFixedAmount() !== totalAmount && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              ⚠️ La somma delle percentuali ({getTotalPercentage()}%) o degli importi fissi non corrisponde al 100% del preventivo
            </span>
          </div>
        </div>
      )}

      {/* Lista Condizioni */}
      <div className="space-y-3">
        {paymentTerms
          .sort((a, b) => a.order - b.order)
          .map((term, index) => {
            const config = paymentTypeConfig[term.type];
            const IconComponent = config.icon;
            const amount = calculateTermAmount(term);

            return (
              <div
                key={term.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium">
                    {term.order}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900">{term.description}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        <IconComponent className="h-3 w-3 mr-1" />
                        {config.label}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-bold text-green-700">€{amount.toLocaleString()}</span>
                      {term.percentage && <span className="ml-2">({term.percentage}%)</span>}
                      <span className="mx-2">•</span>
                      <span>{triggerEventConfig[term.triggerEvent]}</span>
                      {term.dueAfterDays > 0 && <span> + {term.dueAfterDays} gg</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveTerm(term.id, 'up')}
                    disabled={index === 0}
                    className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                    title="Sposta su"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveTerm(term.id, 'down')}
                    disabled={index === paymentTerms.length - 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                    title="Sposta giù"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingTerm(term)}
                    className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Modifica"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteTerm(term.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Elimina"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

        {paymentTerms.length === 0 && (
          <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
            <Calendar className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Nessuna condizione di pagamento definita</p>
            <p className="text-xs text-gray-500 mt-1">Aggiungi le condizioni di pagamento per questo preventivo</p>
          </div>
        )}
      </div>

      {/* Modal Modifica Condizione */}
      {editingTerm && (
        <PaymentTermEditModal
          term={editingTerm}
          totalAmount={totalAmount}
          onSave={saveTerm}
          onCancel={() => setEditingTerm(null)}
        />
      )}

      {/* Modal Template */}
      {showTemplateModal && (
        <TemplateModal
          templates={paymentTemplates}
          onApplyTemplate={applyTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  );
}

// Modal per modifica condizione pagamento
function PaymentTermEditModal({
  term,
  totalAmount,
  onSave,
  onCancel
}: {
  term: PaymentTerm;
  totalAmount: number;
  onSave: (term: PaymentTerm) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(term);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const calculatedAmount = formData.fixedAmount ||
    (formData.percentage ? (totalAmount * formData.percentage) / 100 : 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {term.id ? 'Modifica Condizione' : 'Nuova Condizione'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PaymentTermType }))}
              >
                <option value="advance">Acconto</option>
                <option value="progress">SAL</option>
                <option value="completion">Saldo</option>
                <option value="retention">Ritenuta</option>
                <option value="balance">Residuo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evento Trigger</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.triggerEvent}
                onChange={(e) => setFormData(prev => ({ ...prev, triggerEvent: e.target.value as any }))}
              >
                <option value="order_confirmation">Conferma Ordine</option>
                <option value="delivery">Consegna</option>
                <option value="installation_start">Inizio Installazione</option>
                <option value="installation_complete">Fine Installazione</option>
                <option value="approval">Approvazione</option>
                <option value="custom_date">Data Specifica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Percentuale (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.percentage || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  percentage: parseFloat(e.target.value) || undefined,
                  fixedAmount: undefined
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Importo Fisso (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.fixedAmount || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  fixedAmount: parseFloat(e.target.value) || undefined,
                  percentage: undefined
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giorni Dopo Evento</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.dueAfterDays || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, dueAfterDays: parseInt(e.target.value) || 0 }))}
              />
            </div>

            {formData.triggerEvent === 'custom_date' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Specifica</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.customDueDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, customDueDate: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condizioni Aggiuntive</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.conditions || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
              placeholder="Eventuali condizioni specifiche per questo pagamento..."
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={formData.vatIncluded}
                onChange={(e) => setFormData(prev => ({ ...prev, vatIncluded: e.target.checked }))}
              />
              <span className="ml-2 text-sm text-gray-700">IVA Inclusa</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <span className="ml-2 text-sm text-gray-700">Attivo</span>
            </label>
          </div>

          {/* Anteprima Calcolo */}
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="text-sm text-blue-800">
              <strong>Importo Calcolato: €{calculatedAmount.toLocaleString()}</strong>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal per selezione template
function TemplateModal({
  templates,
  onApplyTemplate,
  onClose
}: {
  templates: PaymentTemplate[];
  onApplyTemplate: (template: PaymentTemplate) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Seleziona Template</h3>
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onApplyTemplate(template)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="space-y-1">
                {template.paymentTerms.map((term, index) => (
                  <div key={index} className="text-xs text-gray-500 flex justify-between">
                    <span>{term.description}</span>
                    <span>{term.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="text-center py-8">
              <BookTemplate className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Nessun template disponibile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}