'use client';

import { useState, useMemo } from 'react';
import { Document, ProjectDocumentCategory } from '@/types';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentUpload from './DocumentUpload';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  FileText,
  FolderOpen,
  X
} from 'lucide-react';
import {
  PROJECT_DOCUMENT_CATEGORIES,
  PROJECT_DOCUMENT_GROUPS,
  getCategoryConfig,
  getCategoryLabel,
  getCategoryIcon,
  getCategoryColors
} from '@/lib/documentCategories';

interface ProjectDocumentsProps {
  projectId: string;
  documents: Document[];
  onUpdateDocuments: (documents: Document[]) => void;
}

export default function ProjectDocuments({ projectId, documents, onUpdateDocuments }: ProjectDocumentsProps) {
  const { addDocument, updateDocument, deleteDocument } = useDocuments();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProjectDocumentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [uploadCategory, setUploadCategory] = useState<ProjectDocumentCategory>('other');

  // Filtra documenti del progetto
  const projectDocuments = useMemo(() => {
    return documents.filter(doc =>
      doc.relatedTo.type === 'project' &&
      doc.relatedTo.id === projectId &&
      doc.isActive
    );
  }, [documents, projectId]);

  // Applica filtri
  const filteredDocuments = useMemo(() => {
    let filtered = projectDocuments;

    // Filtro per categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.projectCategory === selectedCategory);
    }

    // Filtro per ricerca
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.projectCategory && getCategoryLabel(doc.projectCategory).toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [projectDocuments, selectedCategory, searchQuery]);

  // Raggruppa documenti per categoria
  const documentsByCategory = useMemo(() => {
    const grouped: Record<string, Document[]> = {};

    filteredDocuments.forEach(doc => {
      const category = doc.projectCategory || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(doc);
    });

    return grouped;
  }, [filteredDocuments]);

  // Statistiche
  const stats = useMemo(() => {
    const totalSize = projectDocuments.reduce((sum, doc) => sum + doc.size, 0);
    const categoryStats: Record<string, number> = {};

    projectDocuments.forEach(doc => {
      const category = doc.projectCategory || 'other';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    return {
      total: projectDocuments.length,
      totalSize,
      categoryStats
    };
  }, [projectDocuments]);

  const handleUploadComplete = (newDocuments: Document[]) => {
    const updatedProjectDocuments = newDocuments.map(doc => ({
      ...doc,
      projectCategory: uploadCategory,
      relatedTo: {
        type: 'project' as const,
        id: projectId
      }
    }));

    updatedProjectDocuments.forEach(doc => {
      addDocument(doc);
    });

    onUpdateDocuments([...documents, ...updatedProjectDocuments]);
    setShowUpload(false);
  };

  const handleDeleteDocument = (docId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo documento?')) {
      deleteDocument(docId);
      onUpdateDocuments(documents.filter(doc => doc.id !== docId));
    }
  };

  const handleDownloadDocument = (document: Document) => {
    try {
      const base64Data = document.url.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: document.mimeType });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Errore durante il download del documento');
    }
  };

  const handleViewDocument = (document: Document) => {
    setViewingDocument(document);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (mimeType.includes('image')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (mimeType.includes('word')) return <FileText className="h-5 w-5 text-blue-600" />;
    if (mimeType.includes('excel')) return <FileText className="h-5 w-5 text-green-600" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header e Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documenti del Progetto</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <span>{stats.total} documenti</span>
            <span>•</span>
            <span>{formatFileSize(stats.totalSize)}</span>
          </div>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Documenti
        </button>
      </div>

      {/* Filtri */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca documenti..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as ProjectDocumentCategory | 'all')}
        >
          <option value="all">Tutte le categorie</option>
          {Object.entries(PROJECT_DOCUMENT_GROUPS).map(([group, categories]) => (
            <optgroup key={group} label={group}>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Lista Documenti */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun documento</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || selectedCategory !== 'all'
              ? 'Nessun documento corrisponde ai filtri selezionati.'
              : 'Inizia caricando il primo documento del progetto.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(documentsByCategory).map(([categoryId, categoryDocs]) => {
            const config = getCategoryConfig(categoryId as ProjectDocumentCategory);
            if (!config) return null;

            const IconComponent = config.icon;

            return (
              <div key={categoryId} className={`border rounded-lg p-4 ${config.bgColor}`}>
                <h4 className={`font-medium flex items-center mb-3 ${config.color}`}>
                  <IconComponent className="h-5 w-5 mr-2" />
                  {config.label} ({categoryDocs.length})
                </h4>
                <div className="space-y-2">
                  {categoryDocs.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getFileIcon(document.mimeType)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {document.name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{formatFileSize(document.size)}</span>
                            <span>•</span>
                            <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                            {document.tags.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{document.tags.slice(0, 2).join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDocument(document)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded"
                          title="Visualizza"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(document)}
                          className="p-2 text-gray-400 hover:text-green-600 rounded"
                          title="Scarica"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded"
                          title="Elimina"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Upload */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Carica Documenti
                </h3>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria Documento
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as ProjectDocumentCategory)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(PROJECT_DOCUMENT_GROUPS).map(([group, categories]) => (
                    <optgroup key={group} label={group}>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {getCategoryConfig(uploadCategory)?.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {getCategoryConfig(uploadCategory)?.description}
                  </p>
                )}
              </div>

              <DocumentUpload
                relatedTo={{
                  type: 'project',
                  id: projectId
                }}
                onUploadComplete={handleUploadComplete}
                category={getCategoryLabel(uploadCategory)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal View Document */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewingDocument.name}
                </h3>
                <button
                  onClick={() => setViewingDocument(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Dimensione: {formatFileSize(viewingDocument.size)}</span>
                  <span>•</span>
                  <span>Caricato: {new Date(viewingDocument.uploadedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Categoria: {viewingDocument.projectCategory ? getCategoryLabel(viewingDocument.projectCategory) : 'Non categorizzato'}</span>
                </div>
              </div>

              {viewingDocument.mimeType.includes('image') ? (
                <img
                  src={viewingDocument.url}
                  alt={viewingDocument.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : viewingDocument.mimeType.includes('pdf') ? (
                <embed
                  src={viewingDocument.url}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Anteprima non disponibile per questo tipo di file</p>
                  <button
                    onClick={() => handleDownloadDocument(viewingDocument)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2 inline" />
                    Scarica per visualizzare
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}