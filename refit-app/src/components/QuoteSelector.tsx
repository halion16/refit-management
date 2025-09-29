'use client';

import { useState, useMemo } from 'react';
import { Quote, ProjectPhase, Contractor } from '@/types';
import { useQuotes } from '@/hooks/useQuotes';
import { useContractors } from '@/hooks/useContractors';
import {
  X,
  Plus,
  Link,
  Eye,
  Euro,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Search
} from 'lucide-react';

interface QuoteSelectorProps {
  projectId: string;
  phase?: ProjectPhase;
  onClose: () => void;
  onCreateNew: () => void;
  onSelectExisting?: (quote: Quote) => void;
  onViewQuote?: (quote: Quote) => void;
}

export default function QuoteSelector({
  projectId,
  phase,
  onClose,
  onCreateNew,
  onSelectExisting,
  onViewQuote
}: QuoteSelectorProps) {
  const { data: quotes, updateQuote } = useQuotes();
  const { data: contractors } = useContractors();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContractor, setSelectedContractor] = useState<string>('');

  // Preventivi esistenti per questo progetto/fase
  const existingQuotes = useMemo(() => {
    return quotes.filter(quote => {
      const matchesProject = quote.projectId === projectId;
      const matchesPhase = !phase || quote.phaseId === phase.id;
      return matchesProject && matchesPhase;
    });
  }, [quotes, projectId, phase]);

  // Preventivi disponibili da altri progetti (per riutilizzo)
  const availableQuotes = useMemo(() => {
    return quotes.filter(quote => {
      if (quote.projectId === projectId && (!phase || quote.phaseId === phase.id)) {
        return false; // Escludi quelli già collegati
      }

      const contractor = contractors.find(c => c.id === quote.contractorId);
      const matchesSearch = !searchTerm ||
        (contractor?.name || contractor?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quote.quoteNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesContractor = !selectedContractor || quote.contractorId === selectedContractor;

      return matchesSearch && matchesContractor;
    });
  }, [quotes, projectId, phase, contractors, searchTerm, selectedContractor]);

  const getStatusBadge = (status: Quote['status']) => {
    const statusConfig = {
      draft: { label: 'Bozza', color: 'bg-gray-100 text-gray-800', icon: Clock },
      sent: { label: 'Inviato', color: 'bg-blue-100 text-blue-800', icon: Clock },
      received: { label: 'Ricevuto', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      under_review: { label: 'In Revisione', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      approved: { label: 'Approvato', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
      rejected: { label: 'Rifiutato', color: 'bg-red-100 text-red-800', icon: X },
      expired: { label: 'Scaduto', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const handleLinkExistingQuote = (quote: Quote) => {
    if (confirm('Vuoi collegare questo preventivo al progetto/fase corrente?')) {
      // Aggiorna il preventivo per collegarlo alla fase corrente
      updateQuote(quote.id, {
        projectId: projectId,
        phaseId: phase?.id
      });

      if (onSelectExisting) {
        onSelectExisting({
          ...quote,
          projectId: projectId,
          phaseId: phase?.id
        });
      }

      onClose();
    }
  };

  const getContractor = (contractorId: string) => {
    return contractors.find(c => c.id === contractorId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Gestione Preventivi
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {phase ? `Fase: ${phase.name}` : 'Intero progetto'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Azioni Principali */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={onCreateNew}
              className="flex items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
            >
              <div className="text-center">
                <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-medium text-blue-900">Nuovo Preventivo</h3>
                <p className="text-sm text-blue-600">Crea un preventivo da zero</p>
              </div>
            </button>

            <div className="flex items-center justify-center p-6 border-2 border-gray-200 rounded-lg bg-gray-50">
              <div className="text-center">
                <Link className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-700">Collega Esistente</h3>
                <p className="text-sm text-gray-600">Seleziona un preventivo dalla lista sotto</p>
              </div>
            </div>
          </div>

          {/* Preventivi Già Collegati */}
          {existingQuotes.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                📎 Preventivi Collegati ({existingQuotes.length})
              </h3>
              <div className="space-y-3">
                {existingQuotes.map((quote) => {
                  const contractor = getContractor(quote.contractorId);
                  return (
                    <div
                      key={quote.id}
                      className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                          <Euro className="h-5 w-5 text-green-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {quote.quoteNumber || `PREV-${quote.id.slice(-6)}`}
                            </h4>
                            {getStatusBadge(quote.status)}
                          </div>

                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{contractor?.name || contractor?.companyName}</span>
                            <span className="mx-2">•</span>
                            <span className="font-bold text-green-700">€{quote.totalAmount.toFixed(2)}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(quote.requestDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {onViewQuote && (
                          <button
                            onClick={() => onViewQuote(quote)}
                            className="p-2 text-gray-500 hover:text-blue-600 rounded"
                            title="Visualizza dettagli"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtri per Preventivi Disponibili */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              🔗 Collega Preventivo Esistente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca per fornitore o numero..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <select
                value={selectedContractor}
                onChange={(e) => setSelectedContractor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tutti i fornitori</option>
                {contractors.map(contractor => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name || contractor.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista Preventivi Disponibili */}
          <div className="space-y-3">
            {availableQuotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Euro className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">Nessun preventivo disponibile</p>
                <p className="text-sm">Crea un nuovo preventivo per iniziare</p>
              </div>
            ) : (
              availableQuotes.map((quote) => {
                const contractor = getContractor(quote.contractorId);
                return (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                        <Euro className="h-5 w-5 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {quote.quoteNumber || `PREV-${quote.id.slice(-6)}`}
                          </h4>
                          {getStatusBadge(quote.status)}
                        </div>

                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{contractor?.name || contractor?.companyName}</span>
                          <span className="mx-2">•</span>
                          <span className="font-bold text-blue-600">€{quote.totalAmount.toFixed(2)}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(quote.requestDate).toLocaleDateString()}</span>
                          {quote.projectId && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                Da altro progetto
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {onViewQuote && (
                        <button
                          onClick={() => onViewQuote(quote)}
                          className="p-2 text-gray-500 hover:text-blue-600 rounded"
                          title="Visualizza dettagli"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleLinkExistingQuote(quote)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                        title="Collega a questa fase"
                      >
                        <Link className="h-3 w-3" />
                        Collega
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}