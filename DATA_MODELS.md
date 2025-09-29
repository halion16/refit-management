# MODELLI DATI - REFIT MANAGEMENT APP

## STRUTTURA DATI LOCALSTORAGE

### 1. PUNTI VENDITA (stores)
```typescript
interface Store {
  id: string;
  name: string;
  code: string;
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
  type: 'flagship' | 'standard' | 'outlet' | 'corner';
  status: 'active' | 'closed' | 'renovation';
  manager: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. PROGETTI REFIT (projects)
```typescript
interface Project {
  id: string;
  storeId: string;
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

interface ProjectPhase {
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

interface Task {
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
```

### 3. FORNITORI/DITTE (contractors)
```typescript
interface Contractor {
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

interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
}
```

### 4. PREVENTIVI (quotes)
```typescript
interface Quote {
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
}

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string; // 'pz', 'mq', 'h', etc.
  category: string;
}
```

### 5. DOCUMENTI (documents)
```typescript
interface Document {
  id: string;
  name: string;
  type: 'contract' | 'invoice' | 'quote' | 'certification' | 'permit' | 'plan' | 'photo' | 'other';
  category: string;
  size: number; // bytes
  mimeType: string;
  url: string; // base64 o blob URL per localStorage
  uploadedBy: string;
  uploadedAt: string;
  relatedTo: {
    type: 'project' | 'contractor' | 'store' | 'quote';
    id: string;
  };
  tags: string[];
  version: number;
  isActive: boolean;
}
```

### 6. FOTO (photos)
```typescript
interface Photo {
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
```

### 7. UTENTI (users)
```typescript
interface User {
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

interface Permission {
  resource: string; // 'projects', 'contractors', 'stores', etc.
  actions: string[]; // 'create', 'read', 'update', 'delete'
}
```

## STRUTTURA KEYS LOCALSTORAGE

```typescript
const STORAGE_KEYS = {
  STORES: 'refit_stores',
  PROJECTS: 'refit_projects',
  CONTRACTORS: 'refit_contractors',
  QUOTES: 'refit_quotes',
  DOCUMENTS: 'refit_documents',
  PHOTOS: 'refit_photos',
  USERS: 'refit_users',
  CURRENT_USER: 'refit_current_user',
  APP_SETTINGS: 'refit_app_settings',
  BACKUP_DATA: 'refit_backup'
} as const;
```

## DATA RELATIONSHIPS

```
Store (1) -> (N) Projects
Project (1) -> (N) Phases
Project (1) -> (N) Quotes
Project (1) -> (N) Documents
Project (1) -> (N) Photos
Phase (1) -> (N) Tasks
Contractor (1) -> (N) Quotes
Contractor (1) -> (N) Documents
Quote (1) -> (N) QuoteItems
```

## UTILITY FUNCTIONS

### Data Validation
- Schema validation per ogni modello
- Validazione date e numeri
- Controllo integrità referenze

### Migration Ready
- IDs compatibili con database
- Timestamps ISO format
- Struttura relazionale mantenuta
- Foreign keys simulate

### Export/Import
- Backup completo JSON
- Export selettivo per progetto
- Import con validazione
- Merge conflict resolution

---

**Documento creato:** 2025-09-29
**Versione:** 1.0
**Compatibilità:** Database migration ready