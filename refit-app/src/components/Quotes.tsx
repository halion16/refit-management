'use client';

import { useState, useMemo, useEffect } from 'react';
import { Quote, Project, Contractor } from '@/types';
import { useQuotes } from '@/hooks/useQuotes';
import { useProjects } from '@/hooks/useProjects';
import { useContractors } from '@/hooks/useContractors';
import QuoteForm from './QuoteForm';
import QuoteComparison from './QuoteComparison';
import QuoteDetails from './QuoteDetails';
import { FileText, Download } from 'lucide-react';

export default function Quotes() {
  const { data: quotes, addQuote, updateQuote, deleteQuote } = useQuotes();
  const { data: projects } = useProjects();
  const { data: contractors } = useContractors();

  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [formContext, setFormContext] = useState<{projectId?: string, phaseId?: string}>({});
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonQuotes, setComparisonQuotes] = useState<Quote[]>([]);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [selectedQuoteForDetails, setSelectedQuoteForDetails] = useState<Quote | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<Quote['status'] | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Check for quote form context on mount
  useEffect(() => {
    const context = localStorage.getItem('quoteFormContext');
    const editContext = localStorage.getItem('editQuoteContext');

    if (context) {
      try {
        const parsedContext = JSON.parse(context);
        setFormContext(parsedContext);
        setShowForm(true);
        // Clear the context after using it
        localStorage.removeItem('quoteFormContext');
      } catch (error) {
        console.error('Error parsing quote form context:', error);
      }
    }

    if (editContext) {
      try {
        const parsedEditContext = JSON.parse(editContext);
        const quoteToEdit = quotes.find(q => q.id === parsedEditContext.quoteId);
        if (quoteToEdit) {
          setEditingQuote(quoteToEdit);
          setShowForm(true);
        }
        // Clear the context after using it
        localStorage.removeItem('editQuoteContext');
      } catch (error) {
        console.error('Error parsing edit quote context:', error);
      }
    }
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      const contractor = contractors.find(c => c.id === quote.contractorId);
      const project = projects.find(p => p.id === quote.projectId);

      const matchesProject = !selectedProject || quote.projectId === selectedProject;
      const matchesStatus = !selectedStatus || quote.status === selectedStatus;
      const matchesSearch = !searchTerm ||
        (contractor?.name || contractor?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quote.quoteNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesProject && matchesStatus && matchesSearch;
    });
  }, [quotes, contractors, projects, selectedProject, selectedStatus, searchTerm]);

  const handleSaveQuote = (quoteData: Omit<Quote, 'id'>) => {
    if (editingQuote) {
      updateQuote(editingQuote.id, quoteData);
    } else {
      addQuote(quoteData);
    }
    setShowForm(false);
    setEditingQuote(null);
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setShowForm(true);
  };

  const handleDeleteQuote = (quote: Quote) => {
    if (confirm('Sei sicuro di voler eliminare questo preventivo?')) {
      deleteQuote(quote.id);
    }
  };

  const handleViewQuoteDetails = (quote: Quote) => {
    setSelectedQuoteForDetails(quote);
    setShowQuoteDetails(true);
  };

  const handleCompareQuotes = (projectId: string, phaseId?: string) => {
    const quotesToCompare = quotes.filter(quote => {
      return quote.projectId === projectId &&
             (!phaseId || quote.phaseId === phaseId);
    });

    if (quotesToCompare.length < 2) {
      alert('Servono almeno 2 preventivi per fare un confronto');
      return;
    }

    setComparisonQuotes(quotesToCompare);
    setShowComparison(true);
  };

  const getContractor = (contractorId: string) => {
    return contractors.find(c => c.id === contractorId);
  };

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
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

  const groupedQuotes = useMemo(() => {
    const groups: { [key: string]: Quote[] } = {};

    filteredQuotes.forEach(quote => {
      const project = getProject(quote.projectId);

      // NEW: Gestione preventivi multi-fase
      let groupKey = project?.name || 'Progetto sconosciuto';

      if (quote.phaseIds && quote.phaseIds.length > 0) {
        if (quote.phaseIds.length === 1) {
          // Preventivo singola fase
          const phase = project?.phases.find(p => p.id === quote.phaseIds[0]);
          groupKey += phase ? ` - ${phase.name}` : '';
        } else {
          // Preventivo multi-fase
          groupKey += ` - Multi-fase (${quote.phaseIds.length} fasi)`;
        }
      } else if (quote.phaseId) {
        // DEPRECATED: Backward compatibility
        const phase = project?.phases.find(p => p.id === quote.phaseId);
        groupKey += phase ? ` - ${phase.name}` : '';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(quote);
    });

    return groups;
  }, [filteredQuotes, projects]);

  const statsData = useMemo(() => {
    return {
      total: quotes.length,
      pending: quotes.filter(q => q.status === 'sent' || q.status === 'under_review').length,
      approved: quotes.filter(q => q.status === 'approved').length,
      totalValue: quotes.filter(q => q.status === 'approved').reduce((sum, q) => sum + q.totalAmount, 0),
      averageValue: quotes.length > 0 ? quotes.reduce((sum, q) => sum + q.totalAmount, 0) / quotes.length : 0
    };
  }, [quotes]);

  return (
    <div className="space-y-6">
      {/* Header e Statistiche */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preventivi</h1>
          <p className="text-gray-600">Gestisci e confronta i preventivi dei progetti</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nuovo Preventivo
        </button>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{statsData.total}</div>
          <div className="text-sm text-gray-600">Totale Preventivi</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{statsData.pending}</div>
          <div className="text-sm text-gray-600">In Attesa</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{statsData.approved}</div>
          <div className="text-sm text-gray-600">Approvati</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">€{statsData.totalValue.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Valore Approvato</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">€{statsData.averageValue.toFixed(0)}</div>
          <div className="text-sm text-gray-600">Valore Medio</div>
        </div>
      </div>

      {/* Filtri */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cerca
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Fornitore, progetto, numero..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progetto
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tutti i progetti</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stato
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Quote['status'] | '')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tutti gli stati</option>
              <option value="draft">Bozza</option>
              <option value="sent">Inviato</option>
              <option value="received">Ricevuto</option>
              <option value="under_review">In Revisione</option>
              <option value="approved">Approvato</option>
              <option value="rejected">Rifiutato</option>
              <option value="expired">Scaduto</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedProject('');
                setSelectedStatus('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Reset Filtri
            </button>
          </div>
        </div>
      </div>

      {/* Lista Preventivi Raggruppati */}
      <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
        {Object.entries(groupedQuotes).map(([groupName, groupQuotes]) => (
          <div key={groupName} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">{groupName}</h3>
                <div className="flex gap-2">
                  <span className="text-sm text-gray-600">
                    {groupQuotes.length} preventivi
                  </span>
                  {groupQuotes.length >= 2 && (
                    <button
                      onClick={() => {
                        const project = projects.find(p => groupQuotes[0] && p.id === groupQuotes[0].projectId);
                        const phase = project?.phases.find(p => p.id === groupQuotes[0]?.phaseId);
                        handleCompareQuotes(groupQuotes[0].projectId, phase?.id);
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    >
                      📊 Confronta
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {groupQuotes.map(quote => {
                const contractor = getContractor(quote.contractorId);
                const project = getProject(quote.projectId);
                const expired = isExpired(quote);

                return (
                  <div key={quote.id} className={`p-4 ${expired ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {quote.quoteNumber || `PREV-${quote.id.slice(-6)}`}
                          </h4>
                          {getStatusBadge(quote.status)}
                          {expired && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              ⚠️ Scaduto
                            </span>
                          )}
                        </div>

                        {/* NEW: Fasi del preventivo */}
                        {quote.phaseIds && quote.phaseIds.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              Fasi incluse ({quote.phaseIds.length})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {quote.phaseIds.map(phaseId => {
                                const phase = project?.phases.find(p => p.id === phaseId);
                                return (
                                  <span
                                    key={phaseId}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {phase?.name || 'Fase sconosciuta'}
                                  </span>
                                );
                              })}
                            </div>
                            {quote.phaseBreakdown && quote.phaseBreakdown.length > 0 && (
                              <div className="mt-1 text-xs text-gray-500">
                                Breakdown dettagliato disponibile nei dettagli
                              </div>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Fornitore</div>
                            <div className="text-sm text-gray-900">
                              {contractor?.name || contractor?.companyName || 'N/A'}
                            </div>
                            {contractor?.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span
                                    key={star}
                                    className={`text-xs ${
                                      star <= contractor.rating.overall ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  >
                                    ⭐
                                  </span>
                                ))}
                                <span className="text-xs text-gray-500">
                                  ({contractor.rating.reviewsCount})
                                </span>
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-700">Importo</div>
                            <div className="text-lg font-bold text-gray-900">
                              €{quote.totalAmount.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {quote.items.length} voci
                              {quote.documents && quote.documents.length > 0 && (
                                <>
                                  <span> • </span>
                                  <span className="inline-flex items-center">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {quote.documents.length} doc.
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-700">Date</div>
                            <div className="text-sm text-gray-900">
                              Richiesta: {new Date(quote.requestDate).toLocaleDateString()}
                            </div>
                            {quote.responseDate && (
                              <div className="text-sm text-gray-600">
                                Risposta: {new Date(quote.responseDate).toLocaleDateString()}
                              </div>
                            )}
                            {quote.validUntil && (
                              <div className={`text-sm ${expired ? 'text-red-600' : 'text-gray-600'}`}>
                                Scade: {new Date(quote.validUntil).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-700">Condizioni</div>
                            <div className="text-sm text-gray-600">
                              {quote.terms ? quote.terms.slice(0, 50) + '...' : 'Nessuna condizione'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleViewQuoteDetails(quote)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                        >
                          Dettagli
                        </button>
                        <button
                          onClick={() => handleEditQuote(quote)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          Modifica
                        </button>
                        {quote.status === 'received' && (
                          <button
                            onClick={() => updateQuote(quote.id, { status: 'approved' })}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                          >
                            Approva
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteQuote(quote)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredQuotes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <div className="text-lg font-medium">Nessun preventivo trovato</div>
            <div className="text-sm">
              {quotes.length === 0
                ? 'Crea il tuo primo preventivo per iniziare'
                : 'Prova a modificare i filtri di ricerca'
              }
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <QuoteForm
          quote={editingQuote || undefined}
          onSave={handleSaveQuote}
          onCancel={() => {
            setShowForm(false);
            setEditingQuote(null);
            setFormContext({});
          }}
          projectId={formContext.projectId}
          phaseId={formContext.phaseId}
        />
      )}

      {showComparison && (
        <QuoteComparison
          quotes={comparisonQuotes}
          onClose={() => setShowComparison(false)}
          onSelectQuote={(quote) => {
            updateQuote(quote.id, { status: 'approved' });
            setShowComparison(false);
          }}
        />
      )}

      {showQuoteDetails && selectedQuoteForDetails && (
        <QuoteDetails
          quote={selectedQuoteForDetails}
          onClose={() => {
            setShowQuoteDetails(false);
            setSelectedQuoteForDetails(null);
          }}
          onEdit={(quote) => {
            setShowQuoteDetails(false);
            setSelectedQuoteForDetails(null);
            handleEditQuote(quote);
          }}
          onApprove={(quote) => {
            updateQuote(quote.id, { status: 'approved' });
            setShowQuoteDetails(false);
            setSelectedQuoteForDetails(null);
          }}
          onReject={(quote) => {
            updateQuote(quote.id, { status: 'rejected' });
            setShowQuoteDetails(false);
            setSelectedQuoteForDetails(null);
          }}
        />
      )}
    </div>
  );
}