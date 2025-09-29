'use client';

import { useState, useRef } from 'react';
import { Document } from '@/types';
import { useDocuments } from '@/hooks/useDocuments';
import {
  Upload,
  File,
  FileText,
  Image,
  FileCheck,
  Trash2,
  Download,
  Eye,
  X,
  Plus
} from 'lucide-react';

interface DocumentUploadProps {
  relatedTo: {
    type: Document['relatedTo']['type'];
    id: string;
  };
  onDocumentsChange?: (documents: Document[]) => void;
  allowedTypes?: string[];
  maxSizeBytes?: number;
  showTitle?: boolean;
}

export default function DocumentUpload({
  relatedTo,
  onDocumentsChange,
  allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.xlsx', '.xls'],
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  showTitle = true
}: DocumentUploadProps) {
  const { addDocument, deleteDocument, getDocumentsByRelated } = useDocuments();
  const [documents, setDocuments] = useState<Document[]>(() =>
    getDocumentsByRelated(relatedTo.type, relatedTo.id)
  );
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (mimeType.includes('image')) return <Image className="h-6 w-6 text-blue-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileCheck className="h-6 w-6 text-blue-600" />;
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return <FileCheck className="h-6 w-6 text-green-600" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File troppo grande. Massimo ${formatFileSize(maxSizeBytes)}`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return `Tipo file non supportato. Formati consentiti: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    const newDocuments: Document[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          alert(`${file.name}: ${validationError}`);
          continue;
        }

        // Convert to base64
        const base64 = await convertFileToBase64(file);

        // Create document
        const newDocument = addDocument({
          name: file.name,
          type: 'quote', // Default type for quotes
          category: file.type.includes('pdf') ? 'Preventivo' : 'Allegato',
          size: file.size,
          mimeType: file.type,
          url: base64,
          uploadedBy: 'Current User', // TODO: Get from auth context
          uploadedAt: new Date().toISOString(),
          relatedTo,
          tags: [],
          version: 1,
          isActive: true
        });

        newDocuments.push(newDocument);
      }

      // Update local state
      const updatedDocuments = [...documents, ...newDocuments];
      setDocuments(updatedDocuments);

      // Notify parent component
      if (onDocumentsChange) {
        onDocumentsChange(updatedDocuments);
      }

    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Errore durante il caricamento dei file');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo documento?')) {
      deleteDocument(documentId);
      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      setDocuments(updatedDocuments);

      if (onDocumentsChange) {
        onDocumentsChange(updatedDocuments);
      }
    }
  };

  const handleDownloadDocument = (document: Document) => {
    try {
      // Create a blob from base64
      const base64Data = document.url.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: document.mimeType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Errore durante il download del documento');
    }
  };

  const handleViewDocument = (document: Document) => {
    // Open document in new tab
    const newWindow = window.open();
    if (newWindow) {
      if (document.mimeType.includes('pdf')) {
        newWindow.document.write(`
          <html>
            <head><title>${document.name}</title></head>
            <body style="margin: 0;">
              <embed src="${document.url}" type="application/pdf" width="100%" height="100%" />
            </body>
          </html>
        `);
      } else if (document.mimeType.includes('image')) {
        newWindow.document.write(`
          <html>
            <head><title>${document.name}</title></head>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0;">
              <img src="${document.url}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
            </body>
          </html>
        `);
      } else {
        // For other file types, trigger download
        handleDownloadDocument(document);
        newWindow.close();
      }
    }
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <h4 className="text-lg font-medium text-gray-900">Documenti</h4>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />

        <p className="text-sm text-gray-600 mb-2">
          Trascina i file qui o{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium"
            disabled={uploading}
          >
            seleziona dal computer
          </button>
        </p>

        <p className="text-xs text-gray-500">
          Formati supportati: {allowedTypes.join(', ')} • Max {formatFileSize(maxSizeBytes)}
        </p>

        {uploading && (
          <div className="mt-4">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              Caricamento in corso...
            </div>
          </div>
        )}
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">
            Documenti caricati ({documents.length})
          </h5>

          <div className="space-y-2">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(document.mimeType)}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {document.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatFileSize(document.size)}</span>
                      <span>•</span>
                      <span>{document.category}</span>
                      <span>•</span>
                      <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleViewDocument(document)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    title="Visualizza"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDownloadDocument(document)}
                    className="p-1 text-gray-400 hover:text-green-600 rounded"
                    title="Scarica"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteDocument(document.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Elimina"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}