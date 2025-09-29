'use client';

import { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Clock,
  Tag,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLocations } from '@/hooks/useLocalStorage';
import { formatDate, generateId } from '@/lib/utils';
import type { Location } from '@/types';

interface LocationFormData {
  name: string;
  code: string;
  type: Location['type'];
  subtype: string;
  address: {
    street: string;
    city: string;
    province: string;
    cap: string;
    country: string;
  };
  surface: number;
  floors: number;
  status: Location['status'];
  manager: string;
  contacts: {
    phone: string;
    email: string;
    mobile: string;
  };
  description: string;
  tags: string[];
}

const initialFormData: LocationFormData = {
  name: '',
  code: '',
  type: 'store',
  subtype: '',
  address: {
    street: '',
    city: '',
    province: '',
    cap: '',
    country: 'Italia'
  },
  surface: 0,
  floors: 1,
  status: 'active',
  manager: '',
  contacts: {
    phone: '',
    email: '',
    mobile: ''
  },
  description: '',
  tags: []
};

function LocationForm({
  location,
  onSave,
  onCancel
}: {
  location?: Location;
  onSave: (data: LocationFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<LocationFormData>(
    location ? {
      name: location.name,
      code: location.code,
      type: location.type,
      subtype: location.subtype || '',
      address: location.address,
      surface: location.surface,
      floors: location.floors || 1,
      status: location.status,
      manager: location.manager,
      contacts: location.contacts,
      description: location.description || '',
      tags: location.tags
    } : initialFormData
  );

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const typeOptions = [
    { value: 'store', label: 'Negozio' },
    { value: 'office', label: 'Ufficio' },
    { value: 'warehouse', label: 'Magazzino' },
    { value: 'factory', label: 'Fabbrica' },
    { value: 'construction_site', label: 'Cantiere' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'restaurant', label: 'Ristorante' },
    { value: 'other', label: 'Altro' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Attivo' },
    { value: 'inactive', label: 'Inattivo' },
    { value: 'under_renovation', label: 'In ristrutturazione' },
    { value: 'planned', label: 'Pianificato' },
    { value: 'closed', label: 'Chiuso' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {location ? 'Modifica Location' : 'Nuova Location'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Codice *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Location['type'] }))}
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sottotipo</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="es. Flagship, Branch, ecc."
                value={formData.subtype}
                onChange={(e) => setFormData(prev => ({ ...prev, subtype: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Location['status'] }))}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Indirizzo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Via *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address.street}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Città *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provincia *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address.province}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, province: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CAP *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address.cap}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, cap: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paese</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address.country}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, country: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (mq) *</label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.surface}
                onChange={(e) => setFormData(prev => ({ ...prev, surface: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Piani</label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.floors}
                onChange={(e) => setFormData(prev => ({ ...prev, floors: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.manager}
                onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
              />
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Contatti</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contacts.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contacts: { ...prev.contacts, phone: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contacts.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contacts: { ...prev.contacts, email: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.contacts.mobile}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contacts: { ...prev.contacts, mobile: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Aggiungi tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit">
              {location ? 'Salva Modifiche' : 'Crea Location'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LocationCard({ location, onEdit, onDelete, onView }: {
  location: Location;
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
  onView: (location: Location) => void;
}) {
  const getStatusColor = (status: Location['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'under_renovation': return 'bg-orange-100 text-orange-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Location['status']) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'inactive': return 'Inattivo';
      case 'under_renovation': return 'In ristrutturazione';
      case 'planned': return 'Pianificato';
      case 'closed': return 'Chiuso';
      default: return status;
    }
  };

  const getTypeLabel = (type: Location['type']) => {
    switch (type) {
      case 'store': return 'Negozio';
      case 'office': return 'Ufficio';
      case 'warehouse': return 'Magazzino';
      case 'factory': return 'Fabbrica';
      case 'construction_site': return 'Cantiere';
      case 'hotel': return 'Hotel';
      case 'restaurant': return 'Ristorante';
      case 'other': return 'Altro';
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
          <p className="text-sm text-gray-600">{location.code}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onView(location)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(location)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(location.id)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Building2 className="h-4 w-4 mr-2" />
          {getTypeLabel(location.type)} {location.subtype && `(${location.subtype})`}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          {location.address.city}, {location.address.province}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          {location.manager}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(location.status)}`}>
            {getStatusLabel(location.status)}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            {location.surface} mq
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {formatDate(location.updatedAt)}
        </div>
      </div>

      {location.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {location.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
          {location.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{location.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function Locations() {
  const { data: locations, addItem, updateItem, deleteItem, loading, error } = useLocations();
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const handleSave = (formData: LocationFormData) => {
    const locationData = {
      ...formData,
      id: editingLocation?.id || generateId(),
      createdAt: editingLocation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingLocation) {
      updateItem(editingLocation.id, locationData);
    } else {
      addItem(locationData);
    }

    setShowForm(false);
    setEditingLocation(undefined);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa location?')) {
      deleteItem(id);
    }
  };

  const handleView = (location: Location) => {
    // TODO: Implementare vista dettagliata
    alert(`Visualizzazione dettagli per: ${location.name}`);
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.address.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || location.status === filterStatus;
    const matchesType = filterType === 'all' || location.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600">Gestisci tutte le locations dei tuoi progetti</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuova Location
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per nome, codice o città..."
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
          <option value="active">Attivo</option>
          <option value="inactive">Inattivo</option>
          <option value="under_renovation">In ristrutturazione</option>
          <option value="planned">Pianificato</option>
          <option value="closed">Chiuso</option>
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tutti i tipi</option>
          <option value="store">Negozio</option>
          <option value="office">Ufficio</option>
          <option value="warehouse">Magazzino</option>
          <option value="factory">Fabbrica</option>
          <option value="construction_site">Cantiere</option>
          <option value="hotel">Hotel</option>
          <option value="restaurant">Ristorante</option>
          <option value="other">Altro</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Totale</p>
              <p className="text-lg font-semibold">{locations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-green-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Attive</p>
              <p className="text-lg font-semibold">{locations.filter(l => l.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-orange-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">In ristrutturazione</p>
              <p className="text-lg font-semibold">{locations.filter(l => l.status === 'under_renovation').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Superficie totale</p>
              <p className="text-lg font-semibold">{locations.reduce((sum, l) => sum + l.surface, 0)} mq</p>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      {filteredLocations.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna location</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterStatus !== 'all' || filterType !== 'all'
              ? 'Nessuna location corrisponde ai filtri selezionati.'
              : 'Inizia creando la tua prima location.'
            }
          </p>
          {!searchQuery && filterStatus === 'all' && filterType === 'all' && (
            <div className="mt-6">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuova Location
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <LocationForm
          location={editingLocation}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingLocation(undefined);
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