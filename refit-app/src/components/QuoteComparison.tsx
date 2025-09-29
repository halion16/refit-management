'use client';

import { useState, useMemo } from 'react';
import { Quote, Contractor, Project, ProjectPhase } from '@/types';
import { useContractors } from '@/hooks/useContractors';
import { useProjects } from '@/hooks/useProjects';

interface QuoteComparisonProps {
  quotes: Quote[];
  onClose: () => void;
  onSelectQuote?: (quote: Quote) => void;
}

export default function QuoteComparison({ quotes, onClose, onSelectQuote }: QuoteComparisonProps) {
  const { data: contractors } = useContractors();
  const { data: projects } = useProjects();
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'date'>('price');
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');

  const sortedQuotes = useMemo(() => {
    return [...quotes].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.totalAmount - b.totalAmount;
        case 'rating':
          const contractorA = contractors.find(c => c.id === a.contractorId);
          const contractorB = contractors.find(c => c.id === b.contractorId);
          return (contractorB?.rating?.overall || 0) - (contractorA?.rating?.overall || 0);
        case 'date':
          return new Date(b.responseDate || b.requestDate).getTime() - new Date(a.responseDate || a.requestDate).getTime();
        default:
          return 0;
      }
    });
  }, [quotes, sortBy, contractors]);

  const getContractor = (contractorId: string) => {
    return contractors.find(c => c.id === contractorId);
  };

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const getPhase = (projectId: string, phaseId?: string) => {
    if (!phaseId) return null;
    const project = getProject(projectId);
    return project?.phases.find(p => p.id === phaseId);
  };

  const getStatusBadge = (status: Quote['status']) => {
    const statusConfig = {
      draft: { label: 'Bozza', color: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Inviato', color: 'bg-blue-100 text-blue-800' },
      received: { label: 'Ricevuto', color: 'bg-green-100 text-green-800' },
      under_review: { label: 'In Revisione', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approvato', color: 'bg-emerald-100 text-emerald-800' },
      rejected: { label: 'Rifiutato', color: 'bg-red-100 text-red-800' },
      expired: { label: 'Scaduto', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const isExpired = (quote: Quote) => {
    if (!quote.validUntil) return false;
    return new Date(quote.validUntil) < new Date();
  };

  const calculateSavings = (quotes: Quote[]) => {
    if (quotes.length < 2) return null;
    const prices = quotes.map(q => q.totalAmount).sort((a, b) => a - b);
    const lowest = prices[0];
    const highest = prices[prices.length - 1];
    return highest - lowest;
  };

  const savings = calculateSavings(sortedQuotes);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Confronto Preventivi</h2>
              <p className="text-sm text-gray-600 mt-1">
                {quotes.length} preventivi • {savings && `Risparmio potenziale: €${savings.toFixed(2)}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Ordina per:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="price">Prezzo</option>
                  <option value="rating">Valutazione</option>
                  <option value="date">Data</option>
                </select>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tabella Comparativa */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Fornitore
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Preventivo
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Prezzo
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Valutazione
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Stato
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Scadenza
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedQuotes.map((quote, index) => {
                  const contractor = getContractor(quote.contractorId);
                  const project = getProject(quote.projectId);
                  const phase = getPhase(quote.projectId, quote.phaseId);
                  const expired = isExpired(quote);
                  const isLowest = index === 0 && sortBy === 'price';

                  return (
                    <tr
                      key={quote.id}
                      className={`
                        ${selectedQuoteId === quote.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        ${expired ? 'opacity-60' : ''}
                        ${isLowest ? 'bg-green-50' : ''}
                      `}
                    >
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="selectedQuote"
                            value={quote.id}
                            checked={selectedQuoteId === quote.id}
                            onChange={(e) => setSelectedQuoteId(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {contractor?.name || contractor?.companyName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {contractor?.specializations?.slice(0, 2).join(', ')}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="border border-gray-200 px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {quote.quoteNumber || `PREV-${quote.id.slice(-6)}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {project?.name}
                            {phase && ` • ${phase.name}`}
                          </div>
                          <div className="text-xs text-gray-400">
                            {quote.responseDate ? `Risposta: ${new Date(quote.responseDate).toLocaleDateString()}` :
                             `Richiesta: ${new Date(quote.requestDate).toLocaleDateString()}`}
                          </div>
                        </div>
                      </td>

                      <td className="border border-gray-200 px-4 py-3">
                        <div className={`text-lg font-bold ${isLowest ? 'text-green-600' : 'text-gray-900'}`}>
                          €{quote.totalAmount.toFixed(2)}
                        </div>
                        {isLowest && (
                          <div className="text-xs text-green-600 font-medium">
                            💰 MIGLIORE OFFERTA
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {quote.items.length} voci
                        </div>
                      </td>

                      <td className="border border-gray-200 px-4 py-3">
                        {contractor?.rating ? (
                          <div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span
                                  key={star}
                                  className={`text-sm ${
                                    star <= contractor.rating.overall ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ⭐
                                </span>
                              ))}
                              <span className="text-sm text-gray-600 ml-1">
                                ({contractor.rating.reviewsCount})
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Progetti: {contractor.projects?.completed || 0}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Nessuna valutazione</span>
                        )}
                      </td>

                      <td className="border border-gray-200 px-4 py-3">
                        {getStatusBadge(quote.status)}
                        {expired && (
                          <div className="text-xs text-red-500 mt-1">⚠️ Scaduto</div>
                        )}
                      </td>

                      <td className="border border-gray-200 px-4 py-3">
                        {quote.validUntil ? (
                          <div className={`text-sm ${expired ? 'text-red-600' : 'text-gray-700'}`}>
                            {new Date(quote.validUntil).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Non specificata</span>
                        )}
                      </td>

                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {/* Dettagli preventivo */}}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Dettagli
                          </button>
                          {quote.status === 'received' && (
                            <button
                              onClick={() => {/* Approva preventivo */}}
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Approva
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Analisi Dettagliata */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💰 Analisi Prezzi</h4>
              <div className="space-y-1 text-sm">
                <div>Più basso: €{Math.min(...quotes.map(q => q.totalAmount)).toFixed(2)}</div>
                <div>Più alto: €{Math.max(...quotes.map(q => q.totalAmount)).toFixed(2)}</div>
                <div>Media: €{(quotes.reduce((sum, q) => sum + q.totalAmount, 0) / quotes.length).toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">⭐ Valutazioni</h4>
              <div className="space-y-1 text-sm">
                {contractors
                  .filter(c => quotes.some(q => q.contractorId === c.id))
                  .sort((a, b) => (b.rating?.overall || 0) - (a.rating?.overall || 0))
                  .slice(0, 3)
                  .map(contractor => (
                    <div key={contractor.id}>
                      {(contractor.name || contractor.companyName)?.slice(0, 15)}: {contractor.rating?.overall || 0}/5
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">📊 Statistiche</h4>
              <div className="space-y-1 text-sm">
                <div>Ricevuti: {quotes.filter(q => q.status === 'received').length}</div>
                <div>In revisione: {quotes.filter(q => q.status === 'under_review').length}</div>
                <div>Scaduti: {quotes.filter(q => isExpired(q)).length}</div>
              </div>
            </div>
          </div>

          {/* Azioni */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            {selectedQuoteId && onSelectQuote && (
              <button
                onClick={() => {
                  const selectedQuote = quotes.find(q => q.id === selectedQuoteId);
                  if (selectedQuote) onSelectQuote(selectedQuote);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Seleziona Preventivo
              </button>
            )}
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