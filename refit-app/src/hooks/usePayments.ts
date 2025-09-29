import { useState, useEffect } from 'react';
import { Payment, PaymentTerm, PaymentTemplate, STORAGE_KEYS } from '@/types';
import { generateId } from '@/lib/utils';

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentTemplates, setPaymentTemplates] = useState<PaymentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load payments
      const storedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (storedPayments) {
        setPayments(JSON.parse(storedPayments));
      }

      // Load payment templates
      const storedTemplates = localStorage.getItem(STORAGE_KEYS.PAYMENT_TEMPLATES);
      if (storedTemplates) {
        setPaymentTemplates(JSON.parse(storedTemplates));
      } else {
        // Create default templates if none exist
        const defaultTemplates = createDefaultPaymentTemplates();
        setPaymentTemplates(defaultTemplates);
        localStorage.setItem(STORAGE_KEYS.PAYMENT_TEMPLATES, JSON.stringify(defaultTemplates));
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePayments = (newPayments: Payment[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(newPayments));
      setPayments(newPayments);
    } catch (error) {
      console.error('Error saving payments:', error);
    }
  };

  const saveTemplates = (newTemplates: PaymentTemplate[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENT_TEMPLATES, JSON.stringify(newTemplates));
      setPaymentTemplates(newTemplates);
    } catch (error) {
      console.error('Error saving payment templates:', error);
    }
  };

  // Payment management
  const addPayment = (paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedPayments = [...payments, newPayment];
    savePayments(updatedPayments);
    return newPayment;
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    const updatedPayments = payments.map(payment =>
      payment.id === id
        ? { ...payment, ...updates, updatedAt: new Date().toISOString() }
        : payment
    );
    savePayments(updatedPayments);
  };

  const deletePayment = (id: string) => {
    const updatedPayments = payments.filter(payment => payment.id !== id);
    savePayments(updatedPayments);
  };

  // Payment calculation utilities
  const calculatePaymentSchedule = (
    quoteTotal: number,
    paymentTerms: PaymentTerm[],
    orderDate?: string,
    deliveryDate?: string,
    installationStartDate?: string,
    installationCompleteDate?: string,
    approvalDate?: string
  ): Payment[] => {
    const schedule: Payment[] = [];
    const now = new Date();

    paymentTerms
      .filter(term => term.isActive)
      .sort((a, b) => a.order - b.order)
      .forEach(term => {
        let plannedDate = new Date();
        let plannedAmount = 0;

        // Calculate amount
        if (term.percentage) {
          plannedAmount = (quoteTotal * term.percentage) / 100;
        } else if (term.fixedAmount) {
          plannedAmount = term.fixedAmount;
        }

        // Calculate due date based on trigger event
        switch (term.triggerEvent) {
          case 'order_confirmation':
            plannedDate = orderDate ? new Date(orderDate) : now;
            break;
          case 'delivery':
            plannedDate = deliveryDate ? new Date(deliveryDate) : now;
            break;
          case 'installation_start':
            plannedDate = installationStartDate ? new Date(installationStartDate) : now;
            break;
          case 'installation_complete':
            plannedDate = installationCompleteDate ? new Date(installationCompleteDate) : now;
            break;
          case 'approval':
            plannedDate = approvalDate ? new Date(approvalDate) : now;
            break;
          case 'custom_date':
            plannedDate = term.customDueDate ? new Date(term.customDueDate) : now;
            break;
        }

        // Add due days if specified
        if (term.dueAfterDays) {
          plannedDate.setDate(plannedDate.getDate() + term.dueAfterDays);
        }

        const payment: Payment = {
          id: generateId(),
          quoteId: term.quoteId,
          paymentTermId: term.id,
          plannedAmount,
          paidAmount: 0,
          plannedDate: plannedDate.toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        schedule.push(payment);
      });

    return schedule;
  };

  const getPaymentsByQuote = (quoteId: string) => {
    return payments.filter(payment => payment.quoteId === quoteId);
  };

  const getOverduePayments = () => {
    const now = new Date();
    return payments.filter(payment =>
      payment.status === 'pending' &&
      new Date(payment.plannedDate) < now
    );
  };

  const getPaymentStats = (quoteId?: string) => {
    const relevantPayments = quoteId
      ? payments.filter(p => p.quoteId === quoteId)
      : payments;

    const totalPlanned = relevantPayments.reduce((sum, p) => sum + p.plannedAmount, 0);
    const totalPaid = relevantPayments.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalPending = relevantPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.plannedAmount, 0);
    const totalOverdue = getOverduePayments()
      .filter(p => !quoteId || p.quoteId === quoteId)
      .reduce((sum, p) => sum + p.plannedAmount, 0);

    return {
      totalPlanned,
      totalPaid,
      totalPending,
      totalOverdue,
      paymentRate: totalPlanned > 0 ? (totalPaid / totalPlanned) * 100 : 0
    };
  };

  // Template management
  const addTemplate = (templateData: Omit<PaymentTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: PaymentTemplate = {
      ...templateData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    const updatedTemplates = [...paymentTemplates, newTemplate];
    saveTemplates(updatedTemplates);
    return newTemplate;
  };

  const updateTemplate = (id: string, updates: Partial<PaymentTemplate>) => {
    const updatedTemplates = paymentTemplates.map(template =>
      template.id === id ? { ...template, ...updates } : template
    );
    saveTemplates(updatedTemplates);
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = paymentTemplates.filter(template => template.id !== id);
    saveTemplates(updatedTemplates);
  };

  return {
    payments,
    paymentTemplates,
    loading,
    // Payment methods
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByQuote,
    getOverduePayments,
    getPaymentStats,
    calculatePaymentSchedule,
    // Template methods
    addTemplate,
    updateTemplate,
    deleteTemplate,
    // Utility
    refresh: loadData
  };
};

// Default payment templates
function createDefaultPaymentTemplates(): PaymentTemplate[] {
  return [
    {
      id: generateId(),
      name: 'Standard 30-70',
      description: 'Acconto 30% all\'ordine, saldo 70% a consegna',
      category: 'standard',
      isDefault: true,
      createdAt: new Date().toISOString(),
      paymentTerms: [
        {
          description: 'Acconto 30%',
          type: 'advance',
          percentage: 30,
          triggerEvent: 'order_confirmation',
          dueAfterDays: 0,
          vatIncluded: true,
          order: 1,
          isActive: true
        },
        {
          description: 'Saldo 70%',
          type: 'balance',
          percentage: 70,
          triggerEvent: 'delivery',
          dueAfterDays: 0,
          vatIncluded: true,
          order: 2,
          isActive: true
        }
      ]
    },
    {
      id: generateId(),
      name: 'Progressivo 50-25-25',
      description: 'Acconto 50%, SAL 25%, saldo 25%',
      category: 'standard',
      isDefault: false,
      createdAt: new Date().toISOString(),
      paymentTerms: [
        {
          description: 'Acconto 50%',
          type: 'advance',
          percentage: 50,
          triggerEvent: 'order_confirmation',
          dueAfterDays: 0,
          vatIncluded: true,
          order: 1,
          isActive: true
        },
        {
          description: 'SAL 25%',
          type: 'progress',
          percentage: 25,
          triggerEvent: 'installation_start',
          dueAfterDays: 0,
          vatIncluded: true,
          order: 2,
          isActive: true
        },
        {
          description: 'Saldo 25%',
          type: 'completion',
          percentage: 25,
          triggerEvent: 'installation_complete',
          dueAfterDays: 30,
          vatIncluded: true,
          order: 3,
          isActive: true
        }
      ]
    },
    {
      id: generateId(),
      name: 'Pagamento Unico',
      description: '100% a 30 giorni dalla consegna',
      category: 'standard',
      isDefault: false,
      createdAt: new Date().toISOString(),
      paymentTerms: [
        {
          description: 'Pagamento unico',
          type: 'completion',
          percentage: 100,
          triggerEvent: 'delivery',
          dueAfterDays: 30,
          vatIncluded: true,
          order: 1,
          isActive: true
        }
      ]
    }
  ];
}