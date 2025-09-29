'use client';

import { useState, useMemo } from 'react';
import { Payment, PaymentStatus, PaymentMethod, PaymentTerm } from '@/types';
import { usePayments } from '@/hooks/usePayments';
import {
  Plus,
  Edit,
  Check,
  X,
  Clock,
  AlertTriangle,
  CreditCard,
  Banknote,
  DollarSign,
  Calendar,
  Eye,
  Download,
  Filter
} from 'lucide-react';
import { generateId, formatCurrency, formatDate } from '@/lib/utils';

interface PaymentTrackingProps {
  quoteId: string;
  paymentTerms: PaymentTerm[];
  totalAmount: number;
}

export default function PaymentTracking({ quoteId, paymentTerms, totalAmount }: PaymentTrackingProps) {
  const { payments, addPayment, updatePayment, calculatePaymentSchedule, getPaymentStats } = usePayments();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');

  // Filtra i pagamenti per questo preventivo
  const quotePayments = useMemo(() => {
    return payments.filter(p => p.quoteId === quoteId);
  }, [payments, quoteId]);

  // Genera il piano pagamenti se non esistono pagamenti
  const scheduledPayments = useMemo(() => {
    if (quotePayments.length > 0) return [];
    return calculatePaymentSchedule(totalAmount, paymentTerms);
  }, [quotePayments.length, totalAmount, paymentTerms, calculatePaymentSchedule]);

  // Combina pagamenti esistenti e schedulati
  const allPayments = useMemo(() => {
    const existing = quotePayments;
    const scheduled = scheduledPayments.filter(sp =>
      !existing.some(ep => ep.paymentTermId === sp.paymentTermId)
    );
    return [...existing, ...scheduled].sort((a, b) =>
      new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
    );
  }, [quotePayments, scheduledPayments]);

  // Filtra per status
  const filteredPayments = useMemo(() => {
    if (statusFilter === 'all') return allPayments;
    return allPayments.filter(p => p.status === statusFilter);
  }, [allPayments, statusFilter]);

  // Statistiche
  const stats = getPaymentStats(quoteId);

  const getStatusConfig = (status: PaymentStatus) => {
    const configs = {
      pending: { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      partial: { label: 'Parziale', color: 'bg-blue-100 text-blue-800', icon: AlertTriangle },
      paid: { label: 'Pagato', color: 'bg-green-100 text-green-800', icon: Check },
      overdue: { label: 'Scaduto', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      cancelled: { label: 'Annullato', color: 'bg-gray-100 text-gray-800', icon: X }
    };
    return configs[status];
  };

  const getMethodIcon = (method?: PaymentMethod) => {
    switch (method) {
      case 'bank_transfer': return <Banknote className="h-4 w-4" />;
      case 'credit_card': return <CreditCard className="h-4 w-4" />;
      case 'cash': return <DollarSign className="h-4 w-4" />;
      case 'check': return <CreditCard className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const isOverdue = (payment: Payment) => {
    const today = new Date();
    const dueDate = new Date(payment.plannedDate);
    return payment.status === 'pending' && dueDate < today;
  };

  const handleAddPayment = (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    addPayment(paymentData);
    setShowAddPayment(false);
  };

  const handleUpdatePayment = (paymentId: string, updates: Partial<Payment>) => {
    updatePayment(paymentId, updates);
    setEditingPayment(null);
  };

  const markAsPaid = (payment: Payment, paidAmount?: number) => {
    const amount = paidAmount || payment.plannedAmount;
    const status: PaymentStatus = amount >= payment.plannedAmount ? 'paid' : 'partial';

    updatePayment(payment.id, {
      paidAmount: amount,
      status,
      paymentDate: new Date().toISOString()
    });
  };

  const generateSchedule = () => {
    const schedule = calculatePaymentSchedule(totalAmount, paymentTerms);
    schedule.forEach(payment => {
      addPayment({
        ...payment,
        quoteId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header e Statistiche */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tracking Pagamenti</h3>
          <div className="grid grid-cols-4 gap-4 mt-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">€{stats.totalPlanned.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Totale Pianificato</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">€{stats.totalPaid.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Totale Incassato</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">€{stats.totalPending.toLocaleString()}</div>
              <div className="text-xs text-gray-600">In Attesa</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">€{stats.totalOverdue.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Scaduto</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {quotePayments.length === 0 && paymentTerms.length > 0 && (
            <button
              onClick={generateSchedule}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Genera Piano
            </button>
          )}
          <button
            onClick={() => setShowAddPayment(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Registra Pagamento
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {stats.totalPlanned > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso Pagamenti</span>
            <span>{stats.paymentRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(stats.paymentRate, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Filtri */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tutti i pagamenti</option>
            <option value="pending">In Attesa</option>
            <option value="partial">Parziali</option>
            <option value="paid">Pagati</option>
            <option value="overdue">Scaduti</option>
            <option value="cancelled">Annullati</option>
          </select>
        </div>
      </div>

      {/* Lista Pagamenti */}
      <div className="space-y-3">
        {filteredPayments.map((payment) => {
          const paymentTerm = paymentTerms.find(pt => pt.id === payment.paymentTermId);
          const statusConfig = getStatusConfig(payment.status);
          const IconComponent = statusConfig.icon;
          const overdueStatus = isOverdue(payment);

          return (
            <div
              key={payment.id}
              className={`flex items-center justify-between p-4 border rounded-lg ${
                overdueStatus ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
              } hover:bg-gray-50`}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  {getMethodIcon(payment.method)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {paymentTerm?.description || 'Pagamento'}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      <IconComponent className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </span>
                    {overdueStatus && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Scaduto
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-bold">€{payment.plannedAmount.toLocaleString()}</span>
                    {payment.paidAmount > 0 && (
                      <span className="text-green-600 ml-2">
                        (Pagato: €{payment.paidAmount.toLocaleString()})
                      </span>
                    )}
                    <span className="mx-2">•</span>
                    <span>Scadenza: {formatDate(payment.plannedDate)}</span>
                    {payment.paymentDate && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Pagato: {formatDate(payment.paymentDate)}</span>
                      </>
                    )}
                    {payment.reference && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Rif: {payment.reference}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {payment.status === 'pending' && (
                  <button
                    onClick={() => markAsPaid(payment)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                    title="Segna come pagato"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={() => setEditingPayment(payment)}
                  className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Modifica"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredPayments.length === 0 && (
          <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
            <DollarSign className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {statusFilter === 'all' ? 'Nessun pagamento registrato' : 'Nessun pagamento per questo filtro'}
            </p>
            {paymentTerms.length > 0 && quotePayments.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Genera il piano pagamenti dalle condizioni definite
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal Aggiungi Pagamento */}
      {showAddPayment && (
        <PaymentFormModal
          quoteId={quoteId}
          paymentTerms={paymentTerms}
          onSave={handleAddPayment}
          onCancel={() => setShowAddPayment(false)}
        />
      )}

      {/* Modal Modifica Pagamento */}
      {editingPayment && (
        <PaymentEditModal
          payment={editingPayment}
          paymentTerms={paymentTerms}
          onSave={(updates) => handleUpdatePayment(editingPayment.id, updates)}
          onCancel={() => setEditingPayment(null)}
        />
      )}
    </div>
  );
}

// Modal per aggiungere nuovo pagamento
function PaymentFormModal({
  quoteId,
  paymentTerms,
  onSave,
  onCancel
}: {
  quoteId: string;
  paymentTerms: PaymentTerm[];
  onSave: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    paymentTermId: '',
    plannedAmount: 0,
    paidAmount: 0,
    plannedDate: new Date().toISOString().split('T')[0],
    paymentDate: '',
    status: 'pending' as PaymentStatus,
    method: 'bank_transfer' as PaymentMethod,
    reference: '',
    invoiceNumber: '',
    notes: ''
  });

  const selectedTerm = paymentTerms.find(pt => pt.id === formData.paymentTermId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> = {
      quoteId,
      paymentTermId: formData.paymentTermId,
      plannedAmount: formData.plannedAmount,
      paidAmount: formData.paidAmount,
      plannedDate: formData.plannedDate,
      paymentDate: formData.paymentDate || undefined,
      status: formData.status,
      method: formData.method,
      reference: formData.reference || undefined,
      invoiceNumber: formData.invoiceNumber || undefined,
      notes: formData.notes || undefined
    };

    onSave(payment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Registra Nuovo Pagamento</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condizione di Pagamento</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.paymentTermId}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentTermId: e.target.value }))}
            >
              <option value="">Seleziona condizione...</option>
              {paymentTerms.map(term => (
                <option key={term.id} value={term.id}>
                  {term.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Importo Pianificato (€)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.plannedAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, plannedAmount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Importo Pagato (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.paidAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Scadenza</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.plannedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, plannedDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Pagamento</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PaymentStatus }))}
              >
                <option value="pending">In Attesa</option>
                <option value="partial">Parziale</option>
                <option value="paid">Pagato</option>
                <option value="overdue">Scaduto</option>
                <option value="cancelled">Annullato</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metodo</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.method}
                onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as PaymentMethod }))}
              >
                <option value="bank_transfer">Bonifico</option>
                <option value="check">Assegno</option>
                <option value="cash">Contanti</option>
                <option value="credit_card">Carta di Credito</option>
                <option value="other">Altro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Riferimento</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Numero bonifico, assegno, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numero Fattura</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
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
              Registra Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal per modificare pagamento esistente
function PaymentEditModal({
  payment,
  paymentTerms,
  onSave,
  onCancel
}: {
  payment: Payment;
  paymentTerms: PaymentTerm[];
  onSave: (updates: Partial<Payment>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    paidAmount: payment.paidAmount,
    paymentDate: payment.paymentDate ? payment.paymentDate.split('T')[0] : '',
    status: payment.status,
    method: payment.method || 'bank_transfer' as PaymentMethod,
    reference: payment.reference || '',
    invoiceNumber: payment.invoiceNumber || '',
    notes: payment.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: Partial<Payment> = {
      paidAmount: formData.paidAmount,
      paymentDate: formData.paymentDate || undefined,
      status: formData.status,
      method: formData.method,
      reference: formData.reference || undefined,
      invoiceNumber: formData.invoiceNumber || undefined,
      notes: formData.notes || undefined,
      updatedAt: new Date().toISOString()
    };

    onSave(updates);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Modifica Pagamento</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600">
              <strong>Importo Pianificato:</strong> €{payment.plannedAmount.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Importo Pagato (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.paidAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Pagamento</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PaymentStatus }))}
              >
                <option value="pending">In Attesa</option>
                <option value="partial">Parziale</option>
                <option value="paid">Pagato</option>
                <option value="overdue">Scaduto</option>
                <option value="cancelled">Annullato</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metodo</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.method}
                onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as PaymentMethod }))}
              >
                <option value="bank_transfer">Bonifico</option>
                <option value="check">Assegno</option>
                <option value="cash">Contanti</option>
                <option value="credit_card">Carta di Credito</option>
                <option value="other">Altro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Riferimento</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Numero bonifico, assegno, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numero Fattura</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
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
              Salva Modifiche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}