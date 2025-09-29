'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  Edit,
  Eye,
  Trash2,
  Award,
  Calendar,
  Euro,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Building2,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ContractorDetails } from '@/components/ContractorDetails';
import { ContractorRating } from '@/components/ContractorRating';
import { useContractors } from '@/hooks/useLocalStorage';
import { formatDate, formatCurrency, generateId } from '@/lib/utils';
import type { Contractor, Certification } from '@/types';

interface ContractorFormData {
  name: string;
  type: Contractor['type'];
  vatNumber: string;
  contact: {
    address: string;
    city: string;
    zipCode: string;
    phone?: string;
    email?: string;
    website?: string;
    referentName: string;
    referentPhone?: string;
    referentEmail?: string;
  };
  specializations: string[];
  status: Contractor['status'];
}

const initialFormData: ContractorFormData = {
  name: '',
  type: 'individual',
  vatNumber: '',
  contact: {
    address: '',
    city: '',
    zipCode: '',
    referentName: ''
  },
  specializations: [],
  status: 'active'
};

function ContractorForm({
  contractor,
  onSave,
  onCancel
}: {
  contractor?: Contractor;
  onSave: (data: ContractorFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<ContractorFormData>(
    contractor ? {
      name: contractor.companyName,
      type: contractor.type,
      vatNumber: contractor.vatNumber,
      contact: contractor.contacts,
      specializations: contractor.specializations,
      status: contractor.status
    } : initialFormData
  );

  const [newSpecialization, setNewSpecialization] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addSpecialization = () => {
    const trimmedSpec = newSpecialization.trim();
    if (trimmedSpec && !formData.specializations.includes(trimmedSpec)) {
      // Capitalizza la prima lettera se è una specializzazione personalizzata
      const formattedSpec = trimmedSpec.charAt(0).toUpperCase() + trimmedSpec.slice(1);

      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, formattedSpec]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== spec)
    }));
  };

  const specializationOptions = [
    'Elettrico', 'Idraulico', 'Pavimentazione', 'Pittura', 'Muratura',
    'Cartongesso', 'Infissi', 'Climatizzazione', 'Carpenteria', 'Serramentistica',
    'Impermeabilizzazione', 'Isolamento termico', 'Sicurezza', 'Pulizie industriali'
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {contractor ? 'Modifica Fornitore' : 'Nuovo Fornitore'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ragione Sociale *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.vatNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, vatNumber: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Contractor['type'] }))}
              >
                <option value="individual">Ditta Individuale</option>
                <option value="company">Società</option>
                <option value="cooperative">Cooperativa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Contractor['status'] }))}
              >
                <option value="active">Attivo</option>
                <option value="inactive">Inattivo</option>
                <option value="blacklisted">Blacklist</option>
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Informazioni di Contatto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contact.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, address: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CAP *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contact.zipCode}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, zipCode: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Città *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contact.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, city: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contact.phone || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contact.email || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sito Web</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contact.website || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, website: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Referente *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contact.referentName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, referentName: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono Referente</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contact.referentPhone || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, referentPhone: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Referente</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contact.referentEmail || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, referentEmail: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Specializzazioni</h3>
            <div>
              <div className="flex gap-2 mb-2">
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                >
                  <option value="">Seleziona specializzazione</option>
                  {specializationOptions
                    .filter(opt => !formData.specializations.includes(opt))
                    .map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
                <Button type="button" onClick={addSpecialization} disabled={!newSpecialization}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center text-sm text-gray-500 mb-2">oppure</div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Inserisci nuova specializzazione personalizzata..."
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                />
                <Button type="button" onClick={addSpecialization} disabled={!newSpecialization.trim()}>
                  <Plus className="h-4 w-4" />
                  Aggiungi
                </Button>
              </div>
              {newSpecialization.trim() && !specializationOptions.includes(newSpecialization.trim()) && (
                <div className="text-xs text-blue-600 mb-2 italic">
                  ✨ Verrà creata una nuova specializzazione: "{newSpecialization.trim().charAt(0).toUpperCase() + newSpecialization.trim().slice(1)}"
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                  >
                    <Award className="h-3 w-3 mr-1" />
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(spec)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit">
              {contractor ? 'Salva Modifiche' : 'Crea Fornitore'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContractorCard({
  contractor,
  onEdit,
  onDelete,
  onView,
  onRate
}: {
  contractor: Contractor;
  onEdit: (contractor: Contractor) => void;
  onDelete: (id: string) => void;
  onView: (contractor: Contractor) => void;
  onRate: (contractor: Contractor) => void;
}) {
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

  const getStatusLabel = (status: Contractor['status']) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'inactive': return 'Inattivo';
      case 'blacklisted': return 'Blacklist';
      default: return status;
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{contractor.companyName}</h3>
          <p className="text-sm text-gray-600">P.IVA: {contractor.vatNumber}</p>
        </div>
        <div className="flex space-x-2 ml-4">
          <Button variant="ghost" size="sm" onClick={() => onRate(contractor)} title="Valuta fornitore">
            <Star className="h-4 w-4 text-yellow-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onView(contractor)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(contractor)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(contractor.id)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          {contractor.address.city}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          {contractor.contacts.referentName}
        </div>

        {contractor.contacts.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            {contractor.contacts.phone}
          </div>
        )}

        {contractor.contacts.email && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            {contractor.contacts.email}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Valutazione</span>
          <span className="font-medium">{contractor.rating.overall.toFixed(1)}</span>
        </div>
        <div className="flex items-center space-x-1">
          {renderStars(contractor.rating.overall)}
          <span className="text-xs text-gray-500 ml-2">
            ({contractor.rating.reviewsCount} recensioni)
          </span>
        </div>
      </div>

      {/* Specializations */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {contractor.specializations.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
            >
              <Award className="h-3 w-3 mr-1" />
              {spec}
            </span>
          ))}
          {contractor.specializations.length > 3 && (
            <span className="text-xs text-gray-500">
              +{contractor.specializations.length - 3} altre
            </span>
          )}
        </div>
      </div>

      {/* Projects Stats */}
      <div className="mb-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Progetti completati:</span>
          <span className="font-medium">{contractor.projects.completed}</span>
        </div>
        <div className="flex justify-between">
          <span>Valore totale:</span>
          <span className="font-medium">{formatCurrency(contractor.projects.totalValue)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contractor.status)}`}>
          {getStatusIcon(contractor.status)}
          <span className="ml-1">{getStatusLabel(contractor.status)}</span>
        </span>
        <div className="text-xs text-gray-500">
          {formatDate(contractor.updatedAt)}
        </div>
      </div>
    </div>
  );
}

export function Contractors() {
  const { data: contractors, addItem, updateItem, deleteItem, loading, error } = useContractors();
  const [showForm, setShowForm] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | undefined>();
  const [viewingContractor, setViewingContractor] = useState<Contractor | undefined>();
  const [ratingContractor, setRatingContractor] = useState<Contractor | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialization, setFilterSpecialization] = useState('all');

  const handleSave = (formData: ContractorFormData) => {
    const contractorData = {
      ...formData,
      certifications: editingContractor?.certifications || [],
      rating: editingContractor?.rating || {
        overall: 0,
        quality: 0,
        punctuality: 0,
        communication: 0,
        price: 0,
        reviewsCount: 0
      },
      projects: editingContractor?.projects || {
        completed: 0,
        inProgress: 0,
        totalValue: 0
      },
      documents: editingContractor?.documents || [],
      id: editingContractor?.id || generateId(),
      createdAt: editingContractor?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingContractor) {
      updateItem(editingContractor.id, contractorData);
    } else {
      addItem(contractorData);
    }

    setShowForm(false);
    setEditingContractor(undefined);
  };

  const handleEdit = (contractor: Contractor) => {
    setEditingContractor(contractor);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo fornitore?')) {
      deleteItem(id);
    }
  };

  const handleView = (contractor: Contractor) => {
    setViewingContractor(contractor);
  };

  const handleRate = (contractor: Contractor) => {
    setRatingContractor(contractor);
  };

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contractor.vatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contractor.contacts.referentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contractor.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || contractor.status === filterStatus;
    const matchesSpecialization = filterSpecialization === 'all' ||
                                 contractor.specializations.includes(filterSpecialization);

    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  // Get all unique specializations for filter (both predefined and custom)
  const allSpecializations = Array.from(new Set(contractors.flatMap(c => c.specializations))).sort();

  // Statistics
  const totalContractors = contractors.length;
  const activeContractors = contractors.filter(c => c.status === 'active').length;
  const avgRating = contractors.length > 0
    ? contractors.reduce((sum, c) => sum + c.rating.overall, 0) / contractors.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fornitori</h1>
          <p className="text-gray-600">Gestisci la tua rete di fornitori qualificati</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Fornitore
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Totale Fornitori</p>
              <p className="text-lg font-semibold">{totalContractors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Attivi</p>
              <p className="text-lg font-semibold">{activeContractors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Rating Medio</p>
              <p className="text-lg font-semibold">{avgRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Specializzazioni</p>
              <p className="text-lg font-semibold">{allSpecializations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca fornitori..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tutti gli stati</option>
          <option value="active">Attivi</option>
          <option value="inactive">Inattivi</option>
          <option value="blacklisted">Blacklist</option>
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterSpecialization}
          onChange={(e) => setFilterSpecialization(e.target.value)}
        >
          <option value="all">Tutte le specializzazioni</option>
          {allSpecializations.map(spec => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      {/* Contractors Grid */}
      {filteredContractors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun fornitore</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterStatus !== 'all' || filterSpecialization !== 'all'
              ? 'Nessun fornitore corrisponde ai filtri selezionati.'
              : 'Inizia aggiungendo il tuo primo fornitore.'
            }
          </p>
          {!searchQuery && filterStatus === 'all' && filterSpecialization === 'all' && (
            <div className="mt-6">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Fornitore
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContractors.map((contractor) => (
            <ContractorCard
              key={contractor.id}
              contractor={contractor}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onRate={handleRate}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ContractorForm
          contractor={editingContractor}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingContractor(undefined);
          }}
        />
      )}

      {/* Contractor Details Modal */}
      {viewingContractor && (
        <ContractorDetails
          contractor={viewingContractor}
          onClose={() => setViewingContractor(undefined)}
          onEdit={(contractor) => {
            setViewingContractor(undefined);
            setEditingContractor(contractor);
            setShowForm(true);
          }}
          onUpdateContractor={(updatedContractor) => {
            updateItem(updatedContractor.id, updatedContractor);
            setViewingContractor(updatedContractor);
          }}
        />
      )}

      {/* Contractor Rating Modal */}
      {ratingContractor && (
        <ContractorRating
          contractor={ratingContractor}
          onClose={() => setRatingContractor(undefined)}
          onUpdateContractor={(updatedContractor) => {
            updateItem(updatedContractor.id, updatedContractor);
            setRatingContractor(undefined);
          }}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Errore: {error}
        </div>
      )}
    </div>
  );
}