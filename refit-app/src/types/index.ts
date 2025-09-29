// BDS PROJECT MANAGER - TYPE DEFINITIONS

export interface Location {
  id: string;
  name: string;
  code: string;
  type: 'store' | 'office' | 'warehouse' | 'factory' | 'construction_site' | 'hotel' | 'restaurant' | 'other';
  subtype?: string; // flagship, standard, outlet per stores; headquarters, branch per offices
  address: {
    street: string;
    city: string;
    province: string;
    cap: string;
    country: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  surface: number; // mq
  floors?: number;
  status: 'active' | 'inactive' | 'under_renovation' | 'planned' | 'closed';
  manager: string;
  contacts: {
    phone?: string;
    email?: string;
    mobile?: string;
  };
  operatingHours?: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  locationId: string;
  name: string;
  description: string;
  type: 'renovation' | 'refit' | 'expansion' | 'maintenance';
  status: 'planning' | 'approved' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: {
    planned: number;
    approved: number;
    spent: number;
    remaining: number;
  };
  dates: {
    startPlanned: string;
    startActual?: string;
    endPlanned: string;
    endActual?: string;
    createdAt: string;
    updatedAt: string;
  };
  projectManager: string;
  team: string[];
  phases: ProjectPhase[];
  documents: Document[];
  photos: Photo[];
  notes: string;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  startDate: string;
  endDate: string;
  duration: number; // giorni
  dependencies: string[]; // IDs altre fasi
  assignedContractors: string[];
  budget: number;
  actualCost?: number;
  progress: number; // 0-100%
  tasks: Task[];
}

export interface Task {
  id: string;
  phaseId: string;
  name: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  assignee: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours?: number;
  notes: string;
}

export interface Contractor {
  id: string;
  companyName: string;
  vatNumber: string;
  address: {
    street: string;
    city: string;
    province: string;
    cap: string;
    country: string;
  };
  contacts: {
    phone: string;
    email: string;
    website?: string;
    referentName: string;
    referentPhone?: string;
    referentEmail?: string;
  };
  specializations: string[]; // 'electrical', 'plumbing', 'flooring', etc.
  certifications: Certification[];
  rating: {
    overall: number; // 1-5
    quality: number;
    punctuality: number;
    communication: number;
    price: number;
    reviewsCount: number;
  };
  projects: {
    completed: number;
    inProgress: number;
    totalValue: number;
  };
  documents: Document[];
  status: 'active' | 'inactive' | 'blacklisted';
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
}

export interface Quote {
  id: string;
  projectId: string;
  phaseId?: string;
  contractorId: string;
  quoteNumber: string;
  status: 'draft' | 'sent' | 'received' | 'under_review' | 'approved' | 'rejected' | 'expired';
  requestDate: string;
  responseDate?: string;
  validUntil: string;
  totalAmount: number;
  currency: string;
  items: QuoteItem[];
  terms: string;
  notes: string;
  documents: Document[];
  approval: {
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
  };
  paymentTerms: PaymentTerm[];
  payments: Payment[];
  paymentConfig: {
    vatRate?: number;
    withholdingTaxRate?: number;
    retentionRate?: number;
    paymentMethod?: PaymentMethod;
    bankDetails?: string;
  };
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string; // 'pz', 'mq', 'h', etc.
  category: string;
}

// Tipi per gestione pagamenti
export type PaymentTermType = 'advance' | 'progress' | 'completion' | 'retention' | 'balance';
export type PaymentMethod = 'bank_transfer' | 'check' | 'cash' | 'credit_card' | 'other';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export interface PaymentTerm {
  id: string;
  quoteId: string;
  description: string;
  type: PaymentTermType;
  percentage?: number;        // % del totale (es. 30%)
  fixedAmount?: number;      // Importo fisso
  dueAfterDays?: number;     // Giorni dopo evento trigger
  triggerEvent: 'order_confirmation' | 'delivery' | 'installation_start' | 'installation_complete' | 'approval' | 'custom_date';
  customDueDate?: string;    // Data specifica se triggerEvent è 'custom_date'
  conditions?: string;       // Condizioni specifiche
  vatIncluded: boolean;
  order: number;             // Ordine di pagamento
  isActive: boolean;
}

export interface Payment {
  id: string;
  quoteId: string;
  paymentTermId: string;
  plannedAmount: number;     // Importo pianificato
  paidAmount: number;        // Importo effettivamente pagato
  plannedDate: string;       // Data pianificata
  paymentDate?: string;      // Data effettiva pagamento
  status: PaymentStatus;
  method?: PaymentMethod;
  reference?: string;        // Numero bonifico, assegno, etc.
  invoiceNumber?: string;    // Numero fattura collegata
  notes?: string;
  fees?: number;            // Eventuali commissioni
  exchangeRate?: number;    // Tasso di cambio se valuta diversa
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTemplate {
  id: string;
  name: string;
  description: string;
  paymentTerms: Omit<PaymentTerm, 'id' | 'quoteId'>[];
  category: 'standard' | 'custom' | 'industry_specific';
  isDefault: boolean;
  createdAt: string;
}

// Categorie specifiche per documenti di progetto
export type ProjectDocumentCategory =
  // Documentazione Tecnica
  | 'technical_drawings'    // Disegni tecnici e planimetrie
  | 'technical_specs'       // Specifiche tecniche
  | 'technical_reports'     // Relazioni tecniche
  | 'structural_calcs'      // Calcoli strutturali
  | 'material_specs'        // Schede tecniche materiali

  // Documentazione Approvativa
  | 'municipal_permits'     // Permessi comunali
  | 'authorizations'        // Autorizzazioni
  | 'licenses'              // Licenze e concessioni
  | 'entity_opinions'       // Pareri enti
  | 'compliance_certs'      // Certificazioni di conformità

  // Documentazione Amministrativa
  | 'contracts'             // Contratti
  | 'specifications'        // Capitolati
  | 'site_minutes'          // Verbali di cantiere
  | 'official_comms'        // Comunicazioni ufficiali
  | 'correspondence'        // Corrispondenza

  // Documentazione Finanziaria
  | 'quotes_offers'         // Preventivi e offerte
  | 'invoices'              // Fatture
  | 'progress_reports'      // SAL (Stati Avanzamento Lavori)
  | 'payment_certs'         // Certificati di pagamento
  | 'variations'            // Varianti in corso d'opera

  // Documentazione di Controllo
  | 'inspection_reports'    // Verbali di sopralluogo
  | 'quality_reports'       // Report di controllo qualità
  | 'tests_approvals'       // Test e collaudi
  | 'non_compliance'        // Non conformità
  | 'corrective_actions'    // Azioni correttive

  // Documentazione Fotografica
  | 'photos_before'         // Foto ante operam
  | 'photos_during'         // Foto in corso d'opera
  | 'photos_after'          // Foto post operam
  | 'photos_progress'       // Foto per SAL
  | 'photos_damage'         // Documentazione danni

  // Altri documenti
  | 'other';

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'invoice' | 'quote' | 'certification' | 'permit' | 'plan' | 'photo' | 'other';
  category: string;
  projectCategory?: ProjectDocumentCategory; // Categoria specifica per documenti di progetto
  size: number; // bytes
  mimeType: string;
  url: string; // base64 o blob URL per localStorage
  uploadedBy: string;
  uploadedAt: string;
  relatedTo: {
    type: 'project' | 'contractor' | 'location' | 'quote';
    id: string;
  };
  tags: string[];
  version: number;
  isActive: boolean;
}

export interface Photo {
  id: string;
  projectId: string;
  phaseId?: string;
  title: string;
  description: string;
  url: string; // base64 per localStorage
  thumbnailUrl: string;
  timestamp: string;
  location?: {
    area: string;
    coordinates?: { lat: number; lng: number; }
  };
  type: 'before' | 'during' | 'after' | 'issue' | 'progress';
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'project_manager' | 'supervisor' | 'viewer';
  permissions: Permission[];
  avatar?: string;
  phone?: string;
  department: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  resource: string; // 'projects', 'contractors', 'stores', etc.
  actions: string[]; // 'create', 'read', 'update', 'delete'
}

// Storage Keys
export const STORAGE_KEYS = {
  LOCATIONS: 'refit_locations',
  PROJECTS: 'refit_projects',
  CONTRACTORS: 'refit_contractors',
  QUOTES: 'refit_quotes',
  DOCUMENTS: 'refit_documents',
  PHOTOS: 'refit_photos',
  USERS: 'refit_users',
  CURRENT_USER: 'refit_current_user',
  APP_SETTINGS: 'refit_app_settings',
  BACKUP_DATA: 'refit_backup',
  PAYMENT_TEMPLATES: 'refit_payment_templates',
  PAYMENTS: 'refit_payments'
} as const;

// Utility Types
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type EntityType = 'location' | 'project' | 'contractor' | 'quote' | 'document' | 'photo' | 'user';
export type ProjectStatus = Project['status'];
export type Priority = Project['priority'];
export type ContractorStatus = Contractor['status'];