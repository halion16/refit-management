'use client';

import { useState } from 'react';
import {
  X,
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  Calendar,
  Euro,
  Award,
  Shield,
  FileText,
  Edit,
  Plus,
  Trash2,
  Download,
  Upload,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ContractorRating } from '@/components/ContractorRating';
import { formatDate, formatCurrency, generateId } from '@/lib/utils';
import { useProjects } from '@/hooks/useLocalStorage';
import type { Contractor, Certification, Project, ProjectPhase } from '@/types';

interface ContractorDetailsProps {
  contractor: Contractor;
  onClose: () => void;
  onEdit: (contractor: Contractor) => void;
  onUpdateContractor: (contractor: Contractor) => void;
}

function CertificationForm({
  certification,
  onSave,
  onCancel
}: {
  certification?: Certification;
  onSave: (data: Omit<Certification, 'id'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: certification?.name || '',
    issuedBy: certification?.issuedBy || '',
    number: certification?.number || '',
    issueDate: certification?.issueDate || '',
    expiryDate: certification?.expiryDate || '',
    documentUrl: certification?.documentUrl || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {certification ? 'Modifica Certificazione' : 'Nuova Certificazione'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Certificazione *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emittente *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.issuedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, issuedBy: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numero *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Rilascio *</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Scadenza *</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Documento</label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.documentUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, documentUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit">
              {certification ? 'Salva Modifiche' : 'Aggiungi Certificazione'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ContractorDetails({ contractor, onClose, onEdit, onUpdateContractor }: ContractorDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'certifications' | 'projects' | 'documents'>('overview');
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | undefined>();
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Get projects data
  const { data: projects } = useProjects();

  // Find projects where this contractor is assigned
  const getAssignedProjects = () => {
    const assignedProjects: { project: Project, phases: ProjectPhase[] }[] = [];

    projects.forEach(project => {
      const assignedPhases = project.phases.filter(phase =>
        phase.assignedContractors.includes(contractor.name || contractor.companyName)
      );

      if (assignedPhases.length > 0) {
        assignedProjects.push({ project, phases: assignedPhases });
      }
    });

    return assignedProjects;
  };

  const assignedProjects = getAssignedProjects();

  const getStatusColor = (status: Contractor['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blacklisted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Contractor['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      case 'blacklisted': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleSaveCertification = (certData: Omit<Certification, 'id'>) => {
    const newCertification: Certification = {
      ...certData,
      id: editingCertification?.id || generateId()
    };

    const updatedCertifications = editingCertification
      ? contractor.certifications.map(cert =>
          cert.id === editingCertification.id ? newCertification : cert
        )
      : [...contractor.certifications, newCertification];

    const updatedContractor = {
      ...contractor,
      certifications: updatedCertifications,
      updatedAt: new Date().toISOString()
    };

    onUpdateContractor(updatedContractor);
    setShowCertificationForm(false);
    setEditingCertification(undefined);
  };

  const handleDeleteCertification = (certId: string) => {
    if (confirm('Sei sicuro di voler eliminare questa certificazione?')) {
      const updatedContractor = {
        ...contractor,
        certifications: contractor.certifications.filter(cert => cert.id !== certId),
        updatedAt: new Date().toISOString()
      };
      onUpdateContractor(updatedContractor);
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const threMonthsFromNow = new Date();
    threMonthsFromNow.setMonth(today.getMonth() + 3);
    return expiry <= threMonthsFromNow;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h2 className="text-2xl font-semibold text-gray-900">{contractor.name || contractor.companyName}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contractor.status)}`}>
                  {getStatusIcon(contractor.status)}
                  <span className="ml-1">
                    {contractor.status === 'active' ? 'Attivo' :
                     contractor.status === 'inactive' ? 'Inattivo' : 'Blacklist'}
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  P.IVA: {contractor.vatNumber}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {contractor.address.city}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => onEdit(contractor)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Button>
              <Button variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Panoramica', icon: Users },
              { id: 'certifications', label: 'Certificazioni', icon: Shield },
              { id: 'projects', label: 'Progetti', icon: Building2 },
              { id: 'documents', label: 'Documenti', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informazioni di Contatto</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-3" />
                      <div>
                        <p className="font-medium">{contractor.address.street}</p>
                        <p>{contractor.address.cap} {contractor.address.city}</p>
                      </div>
                    </div>
                    {contractor.contacts.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-3" />
                        <span>{contractor.contacts.phone}</span>
                      </div>
                    )}
                    {contractor.contacts.email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-3" />
                        <span>{contractor.contacts.email}</span>
                      </div>
                    )}
                    {contractor.contacts.website && (
                      <div className="flex items-center text-gray-600">
                        <Globe className="h-4 w-4 mr-3" />
                        <a
                          href={contractor.contacts.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {contractor.contacts.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Referente</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-3" />
                      <span className="font-medium">{contractor.contacts.referentName}</span>
                    </div>
                    {contractor.contacts.referentPhone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-3" />
                        <span>{contractor.contacts.referentPhone}</span>
                      </div>
                    )}
                    {contractor.contacts.referentEmail && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-3" />
                        <span>{contractor.contacts.referentEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Valutazioni</h3>
                  <Button onClick={() => setShowRatingModal(true)}>
                    <Star className="h-4 w-4 mr-2" />
                    Valuta Fornitore
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Qualità</span>
                      <span className="text-lg font-semibold">{contractor.rating.quality.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center">
                      {renderStars(contractor.rating.quality)}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Puntualità</span>
                      <span className="text-lg font-semibold">{contractor.rating.punctuality.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center">
                      {renderStars(contractor.rating.punctuality)}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Comunicazione</span>
                      <span className="text-lg font-semibold">{contractor.rating.communication.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center">
                      {renderStars(contractor.rating.communication)}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Prezzo</span>
                      <span className="text-lg font-semibold">{contractor.rating.price.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center">
                      {renderStars(contractor.rating.price)}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg md:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">Valutazione Media</span>
                      <span className="text-lg font-semibold text-blue-900">{contractor.rating.overall.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center">
                      {renderStars(contractor.rating.overall)}
                      <span className="ml-2 text-xs text-blue-600">
                        ({contractor.rating.reviewsCount} recensioni)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specializzazioni</h3>
                <div className="flex flex-wrap gap-2">
                  {contractor.specializations.map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg"
                    >
                      <Award className="h-3 w-3 mr-1" />
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiche Progetti</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm text-green-600">Progetti Completati</p>
                        <p className="text-2xl font-semibold text-green-900">{contractor.projects.completed}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-orange-600" />
                      <div className="ml-3">
                        <p className="text-sm text-orange-600">In Corso</p>
                        <p className="text-2xl font-semibold text-orange-900">{contractor.projects.inProgress}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Euro className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm text-blue-600">Valore Totale</p>
                        <p className="text-2xl font-semibold text-blue-900">
                          {formatCurrency(contractor.projects.totalValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Certificazioni</h3>
                <Button onClick={() => setShowCertificationForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Certificazione
                </Button>
              </div>

              {contractor.certifications.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna certificazione</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Inizia aggiungendo la prima certificazione per questo fornitore.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contractor.certifications.map((cert) => (
                    <div key={cert.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                          <p className="text-sm text-gray-600">{cert.issuedBy}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCertification(cert);
                              setShowCertificationForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCertification(cert.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Numero:</span>
                          <span className="font-medium">{cert.number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rilasciata:</span>
                          <span>{formatDate(cert.issueDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Scadenza:</span>
                          <span className={isExpiringSoon(cert.expiryDate) ? 'text-red-600 font-medium' : ''}>
                            {formatDate(cert.expiryDate)}
                            {isExpiringSoon(cert.expiryDate) && (
                              <AlertTriangle className="h-3 w-3 inline ml-1" />
                            )}
                          </span>
                        </div>
                      </div>

                      {cert.documentUrl && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <a
                            href={cert.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Scarica documento
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Progetti Assegnati</h3>
                <div className="text-sm text-gray-600">
                  {assignedProjects.length} {assignedProjects.length === 1 ? 'progetto' : 'progetti'}
                </div>
              </div>

              {assignedProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun progetto assegnato</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Questo fornitore non è ancora assegnato a nessuna fase di progetto.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedProjects.map(({ project, phases }) => (
                    <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      {/* Project Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(project.dates.startPlanned)} - {formatDate(project.dates.endPlanned)}
                            </span>
                            <span className="flex items-center">
                              <Euro className="h-3 w-3 mr-1" />
                              Budget: {formatCurrency(project.budget.approved)}
                            </span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status === 'completed' ? 'Completato' :
                           project.status === 'in_progress' ? 'In corso' :
                           project.status === 'planning' ? 'Pianificazione' :
                           project.status}
                        </span>
                      </div>

                      {/* Assigned Phases */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-3">
                          Fasi assegnate ({phases.length})
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {phases.map(phase => (
                            <div key={phase.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="text-sm font-medium text-gray-900">{phase.name}</h6>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    phase.status === 'blocked' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {phase.status === 'completed' ? 'Completata' :
                                     phase.status === 'in_progress' ? 'In corso' :
                                     phase.status === 'blocked' ? 'Bloccata' :
                                     'In attesa'}
                                  </span>
                                  <span className="text-xs text-gray-500">{phase.progress}%</span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">
                                  Budget: {formatCurrency(phase.budget)}
                                </span>
                                {phase.actualCost && (
                                  <span className={`text-xs font-medium ${
                                    phase.actualCost > phase.budget ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    Speso: {formatCurrency(phase.actualCost)}
                                  </span>
                                )}
                              </div>
                              {/* Progress Bar */}
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div
                                    className={`h-1 rounded-full transition-all duration-300 ${
                                      phase.progress === 100 ? 'bg-green-500' :
                                      phase.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                    style={{ width: `${phase.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Documenti</h3>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Carica Documento
                </Button>
              </div>

              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Gestione documenti</h3>
                <p className="mt-1 text-sm text-gray-500">
                  La gestione documenti sarà implementata nella prossima versione.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certification Form Modal */}
      {showCertificationForm && (
        <CertificationForm
          certification={editingCertification}
          onSave={handleSaveCertification}
          onCancel={() => {
            setShowCertificationForm(false);
            setEditingCertification(undefined);
          }}
        />
      )}

      {/* Contractor Rating Modal */}
      {showRatingModal && (
        <ContractorRating
          contractor={contractor}
          onClose={() => setShowRatingModal(false)}
          onUpdateContractor={onUpdateContractor}
        />
      )}
    </div>
  );
}