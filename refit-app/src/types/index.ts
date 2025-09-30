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
  phaseId?: string; // DEPRECATED: mantenuto per backward compatibility
  phaseIds: string[]; // NEW: array di fasi per preventivi multi-fase
  contractorId: string;
  quoteNumber: string;
  status: 'draft' | 'sent' | 'received' | 'under_review' | 'approved' | 'rejected' | 'expired';
  requestDate: string;
  responseDate?: string;
  validUntil: string;
  totalAmount: number; // Calcolato automaticamente dalla somma delle fasi
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
  // NEW: breakdown per fase
  phaseBreakdown?: QuotePhaseBreakdown[];
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string; // 'pz', 'mq', 'h', etc.
  category: string;
  phaseId?: string; // NEW: collegamento opzionale alla fase specifica
}

// NEW: Breakdown del preventivo per fase
export interface QuotePhaseBreakdown {
  phaseId: string;
  phaseName: string;
  items: QuoteItem[];
  subtotal: number;
  notes?: string;
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
  PAYMENTS: 'refit_payments',
  APPOINTMENTS: 'refit_appointments',
  TASKS_ENHANCED: 'refit_tasks_enhanced',
  TASK_TEMPLATES: 'refit_task_templates'
} as const;

// Utility Types
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type EntityType = 'location' | 'project' | 'contractor' | 'quote' | 'document' | 'photo' | 'user';
export type ProjectStatus = Project['status'];
export type Priority = Project['priority'];
export type ContractorStatus = Contractor['status'];
// ==================== APPOINTMENTS & TASKS SYSTEM ====================

export type AppointmentType =
  | 'meeting'
  | 'site_visit'
  | 'client_call'
  | 'inspection'
  | 'deadline'
  | 'milestone'
  | 'contractor_meeting'
  | 'internal_review'
  | 'other';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Participant {
  type: 'internal' | 'external';
  userId?: string; // Se interno, riferimento a User
  name: string;
  email: string;
  role?: string;
  required: boolean;
  confirmed?: boolean;
}

export interface AppointmentLocation {
  type: 'physical' | 'virtual';
  address?: string;
  locationId?: string; // Riferimento a Location se fisica
  meetingLink?: string;
  roomNumber?: string;
  notes?: string;
}

export interface AppointmentReminder {
  enabled: boolean;
  minutesBefore: number; // 15, 30, 60, 1440 (1 giorno), etc.
  sent?: boolean;
  sentAt?: string;
}

export interface AppointmentRecurrence {
  type: RecurrenceType;
  interval: number; // ogni X giorni/settimane/mesi
  endDate?: string;
  endAfterOccurrences?: number;
  daysOfWeek?: number[]; // 0-6 (domenica-sabato) per ricorrenza settimanale
  dayOfMonth?: number; // 1-31 per ricorrenza mensile
}

export interface Appointment {
  id: string;
  projectId?: string; // Collegamento opzionale al progetto
  phaseId?: string;   // Collegamento opzionale alla fase
  locationId?: string; // Collegamento opzionale alla location

  title: string;
  description?: string;
  type: AppointmentType;

  // Date e orari
  scheduledDate: string; // YYYY-MM-DD
  startTime: string;     // HH:MM
  endTime: string;       // HH:MM
  allDay?: boolean;

  // Location dell'appuntamento
  location?: AppointmentLocation;

  // Partecipanti
  participants: Participant[];
  organizer: string; // userId dell'organizzatore

  // Status e priorità
  status: AppointmentStatus;
  priority: 'low' | 'medium' | 'high';

  // Reminder
  reminder?: AppointmentReminder;

  // Ricorrenza
  recurrence?: AppointmentRecurrence;
  parentAppointmentId?: string; // Se è ricorrente, riferimento al parent

  // Documenti e note
  documents?: string[]; // Array di document IDs
  notes?: string;
  agenda?: string;
  outcomes?: string; // Note post-meeting

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

// Task avanzati (estende il Task base esistente)
export type TaskType = 'task' | 'milestone' | 'review' | 'approval' | 'checkpoint';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskEnhanced extends Task {
  // Campi aggiuntivi rispetto al Task base
  type: TaskType;
  priority: TaskPriority;

  // Date avanzate
  dueDate?: string;
  reminderDate?: string;
  completedAt?: string;

  // Effort tracking
  estimatedHours: number;
  actualHours?: number;
  remainingHours?: number;
  progressPercentage: number; // 0-100

  // Dipendenze e relazioni
  dependencies?: string[]; // IDs di altri task che devono essere completati prima
  blockedBy?: string[];    // IDs di task che bloccano questo
  blocks?: string[];       // IDs di task bloccati da questo
  relatedTasks?: string[]; // Altri task correlati

  // Categorizzazione
  tags?: string[];
  labels?: string[];

  // Reminder e notifiche
  reminder?: {
    enabled: boolean;
    daysBefore: number;
    sent?: boolean;
  };

  // Checklist sotto-task
  checklist?: TaskChecklistItem[];

  // Collegamenti
  appointmentId?: string; // Collegamento a un appuntamento
  contractorId?: string;  // Contractor responsabile

  // Attachments
  attachments?: string[]; // Document IDs

  // Approvazione (per task tipo 'approval')
  approvalRequired?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface TaskChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

// Template per task ricorrenti
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  estimatedHours: number;
  checklist?: Omit<TaskChecklistItem, 'id' | 'completed' | 'completedBy' | 'completedAt'>[];
  tags?: string[];
  category: 'standard' | 'custom';
  projectType?: Project['type']; // Tipo di progetto per cui è adatto
  phaseType?: string; // Tipo di fase
  createdAt: string;
}

// ============================================================================
// TEAM MANAGEMENT TYPES
// ============================================================================

export type TeamMemberRole = 'manager' | 'coordinator' | 'technician' | 'contractor' | 'viewer';
export type TeamMemberStatus = 'active' | 'inactive' | 'vacation';

export type Permission =
  | 'view_projects'
  | 'edit_projects'
  | 'delete_projects'
  | 'manage_team'
  | 'manage_budget'
  | 'manage_documents'
  | 'manage_tasks'
  | 'view_reports'
  | 'edit_settings';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamMemberRole;
  department?: string;
  skills: string[]; // 'electrical', 'plumbing', 'carpentry', 'painting', etc.
  availability: {
    hoursPerWeek: number;
    vacation?: { start: string; end: string }[];
  };
  workload: {
    currentTasks: number;
    totalHours: number;
    utilizationRate: number; // 0-100%
  };
  performance: {
    tasksCompleted: number;
    onTimeCompletion: number; // percentage 0-100
    averageRating: number; // 1-5
  };
  contacts: {
    phone?: string;
    mobile?: string;
  };
  status: TeamMemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TeamRole {
  id: string;
  name: string;
  permissions: Permission[];
  canAssignTasks: boolean;
  canEditBudget: boolean;
  canDeleteProjects: boolean;
  canManageTeam: boolean;
  color: string; // For UI visualization
}

export interface TeamMemberActivity {
  id: string;
  memberId: string;
  type: 'task_completed' | 'task_assigned' | 'project_joined' | 'comment_added' | 'document_uploaded';
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Storage keys for team data
export const TEAM_STORAGE_KEYS = {
  MEMBERS: 'refit_team_members',
  ROLES: 'refit_team_roles',
  ACTIVITY: 'refit_team_activity',
} as const;

// ============================================================================
// NOTIFICATION SYSTEM TYPES
// ============================================================================

export type NotificationType =
  | 'task_assigned'
  | 'task_completed'
  | 'task_overdue'
  | 'project_update'
  | 'deadline_approaching'
  | 'budget_alert'
  | 'team_mention'
  | 'document_uploaded'
  | 'comment_added'
  | 'appointment_reminder'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    projectId?: string;
    taskId?: string;
    userId?: string;
    documentId?: string;
    [key: string]: any;
  };
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    [K in NotificationType]: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

export const NOTIFICATION_STORAGE_KEYS = {
  NOTIFICATIONS: 'refit_notifications',
  PREFERENCES: 'refit_notification_preferences',
  LAST_CHECK: 'refit_notifications_last_check',
} as const;
