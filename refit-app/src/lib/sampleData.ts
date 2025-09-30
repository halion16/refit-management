import {
  Location,
  Project,
  Contractor,
  Quote,
  User,
  STORAGE_KEYS,
  PaymentTerm,
  Payment
} from '@/types';
import { sampleAppointments } from './sampleAppointments';

// Utility per generare ID unici
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Dati di esempio - Locations (Negozi e Sedi)
export const sampleLocations: Location[] = [
  {
    id: 'loc-001',
    name: 'Flagship Store Milano Duomo',
    code: 'MIL-001',
    type: 'store',
    subtype: 'flagship',
    address: {
      street: 'Via Dante, 7',
      city: 'Milano',
      province: 'MI',
      cap: '20121',
      country: 'Italia'
    },
    coordinates: {
      lat: 45.4642,
      lng: 9.1900
    },
    surface: 450,
    floors: 2,
    status: 'active',
    manager: 'Marco Rossi',
    contacts: {
      phone: '+39 02 1234567',
      email: 'milano.duomo@example.com',
      mobile: '+39 333 1234567'
    },
    operatingHours: {
      monday: { open: '09:00', close: '19:30' },
      tuesday: { open: '09:00', close: '19:30' },
      wednesday: { open: '09:00', close: '19:30' },
      thursday: { open: '09:00', close: '19:30' },
      friday: { open: '09:00', close: '19:30' },
      saturday: { open: '09:00', close: '20:00' },
      sunday: { open: '10:00', close: '19:00' }
    },
    description: 'Store principale nel cuore di Milano, situato in zona pedonale con alta affluenza',
    tags: ['flagship', 'centro-storico', 'alta-affluenza'],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-12-01T10:30:00Z'
  },
  {
    id: 'loc-002',
    name: 'Store Roma Via del Corso',
    code: 'ROM-001',
    type: 'store',
    subtype: 'standard',
    address: {
      street: 'Via del Corso, 156',
      city: 'Roma',
      province: 'RM',
      cap: '00186',
      country: 'Italia'
    },
    coordinates: {
      lat: 41.9028,
      lng: 12.4964
    },
    surface: 320,
    floors: 1,
    status: 'under_renovation',
    manager: 'Giulia Bianchi',
    contacts: {
      phone: '+39 06 7654321',
      email: 'roma.corso@example.com',
      mobile: '+39 335 7654321'
    },
    operatingHours: {
      monday: { open: '10:00', close: '19:00' },
      tuesday: { open: '10:00', close: '19:00' },
      wednesday: { open: '10:00', close: '19:00' },
      thursday: { open: '10:00', close: '19:00' },
      friday: { open: '10:00', close: '19:00' },
      saturday: { open: '10:00', close: '20:00' },
      sunday: { open: '11:00', close: '19:00' }
    },
    description: 'Store strategico in via dello shopping romano, attualmente in ristrutturazione',
    tags: ['centro-storico', 'shopping', 'ristrutturazione'],
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-12-01T16:45:00Z'
  },
  {
    id: 'loc-003',
    name: 'Outlet Serravalle',
    code: 'SER-001',
    type: 'store',
    subtype: 'outlet',
    address: {
      street: 'Via della Moda, 1',
      city: 'Serravalle Scrivia',
      province: 'AL',
      cap: '15069',
      country: 'Italia'
    },
    surface: 280,
    floors: 1,
    status: 'active',
    manager: 'Alessandro Verdi',
    contacts: {
      phone: '+39 0143 123456',
      email: 'serravalle@example.com'
    },
    description: 'Punto vendita nell\'outlet più grande d\'Europa',
    tags: ['outlet', 'discount', 'volume'],
    createdAt: '2024-03-05T11:00:00Z',
    updatedAt: '2024-11-28T09:15:00Z'
  },
  {
    id: 'loc-004',
    name: 'Sede Centrale Milano',
    code: 'HQ-001',
    type: 'office',
    subtype: 'headquarters',
    address: {
      street: 'Via Brera, 45',
      city: 'Milano',
      province: 'MI',
      cap: '20121',
      country: 'Italia'
    },
    surface: 1200,
    floors: 3,
    status: 'active',
    manager: 'Direttore Generale',
    contacts: {
      phone: '+39 02 9876543',
      email: 'sede@example.com'
    },
    description: 'Sede centrale con uffici direzionali, amministrativi e showroom',
    tags: ['headquarters', 'uffici', 'showroom'],
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-11-30T17:00:00Z'
  }
];

// Dati di esempio - Contractors (Fornitori)
export const sampleContractors: Contractor[] = [
  {
    id: 'cont-001',
    companyName: 'Edilizia Moderna S.r.l.',
    vatNumber: 'IT12345678901',
    address: {
      street: 'Via dei Costruttori, 25',
      city: 'Milano',
      province: 'MI',
      cap: '20127',
      country: 'Italia'
    },
    contacts: {
      phone: '+39 02 5555001',
      email: 'info@ediliziamoderna.it',
      website: 'www.ediliziamoderna.it',
      referentName: 'Ing. Roberto Costruttori',
      referentPhone: '+39 335 1111001',
      referentEmail: 'r.costruttori@ediliziamoderna.it'
    },
    specializations: ['interior_design', 'electrical', 'plumbing', 'flooring'],
    certifications: [
      {
        id: 'cert-001',
        name: 'Certificazione SOA',
        issuedBy: 'Organismo di Attestazione',
        number: 'SOA-2024-001',
        issueDate: '2024-01-15T00:00:00Z',
        expiryDate: '2027-01-15T00:00:00Z'
      }
    ],
    rating: {
      overall: 4.5,
      quality: 4.7,
      punctuality: 4.3,
      communication: 4.6,
      price: 4.2,
      reviewsCount: 24
    },
    projects: {
      completed: 18,
      inProgress: 3,
      totalValue: 450000
    },
    documents: [],
    status: 'active',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-11-30T14:20:00Z'
  },
  {
    id: 'cont-002',
    companyName: 'Impianti Tech Solutions',
    vatNumber: 'IT98765432109',
    address: {
      street: 'Via Tecnologica, 12',
      city: 'Roma',
      province: 'RM',
      cap: '00185',
      country: 'Italia'
    },
    contacts: {
      phone: '+39 06 7777002',
      email: 'contatti@impiantitech.it',
      website: 'www.impiantitech.it',
      referentName: 'Dott. Marco Impianti',
      referentPhone: '+39 347 2222002',
      referentEmail: 'm.impianti@impiantitech.it'
    },
    specializations: ['electrical', 'hvac', 'security_systems', 'automation'],
    certifications: [
      {
        id: 'cert-002',
        name: 'Certificazione Impianti Elettrici',
        issuedBy: 'Camera di Commercio',
        number: 'IE-2024-002',
        issueDate: '2024-02-01T00:00:00Z',
        expiryDate: '2026-02-01T00:00:00Z'
      }
    ],
    rating: {
      overall: 4.8,
      quality: 4.9,
      punctuality: 4.7,
      communication: 4.8,
      price: 4.6,
      reviewsCount: 31
    },
    projects: {
      completed: 25,
      inProgress: 2,
      totalValue: 380000
    },
    documents: [],
    status: 'active',
    createdAt: '2024-02-05T15:30:00Z',
    updatedAt: '2024-11-29T11:45:00Z'
  },
  {
    id: 'cont-003',
    companyName: 'Design & Arredi Plus',
    vatNumber: 'IT55667788990',
    address: {
      street: 'Corso Design, 88',
      city: 'Milano',
      province: 'MI',
      cap: '20123',
      country: 'Italia'
    },
    contacts: {
      phone: '+39 02 3333003',
      email: 'info@designarredi.it',
      referentName: 'Arch. Sofia Designer',
      referentPhone: '+39 339 3333003',
      referentEmail: 's.designer@designarredi.it'
    },
    specializations: ['interior_design', 'furniture', 'lighting', 'decoration'],
    certifications: [],
    rating: {
      overall: 4.2,
      quality: 4.5,
      punctuality: 3.9,
      communication: 4.3,
      price: 4.0,
      reviewsCount: 16
    },
    projects: {
      completed: 12,
      inProgress: 4,
      totalValue: 210000
    },
    documents: [],
    status: 'active',
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-11-25T16:30:00Z'
  }
];

// Dati di esempio - Projects (Progetti)
export const sampleProjects: Project[] = [
  {
    id: 'proj-001',
    locationId: 'loc-002',
    name: 'Ristrutturazione Store Roma Via del Corso',
    description: 'Ristrutturazione completa del negozio con nuovo layout, impianti elettrici e climatizzazione',
    type: 'renovation',
    status: 'in_progress',
    priority: 'high',
    budget: {
      planned: 180000,
      approved: 175000,
      spent: 95000,
      remaining: 80000
    },
    dates: {
      startPlanned: '2024-11-01T08:00:00Z',
      startActual: '2024-11-05T08:30:00Z',
      endPlanned: '2024-12-20T18:00:00Z',
      createdAt: '2024-10-15T14:00:00Z',
      updatedAt: '2024-12-01T09:30:00Z'
    },
    projectManager: 'Ing. Laura Progetti',
    team: ['Marco Operativo', 'Giulia Bianchi', 'Alessandro Tecnico'],
    phases: [
      {
        id: 'phase-001',
        projectId: 'proj-001',
        name: 'Demolizione e Preparazione',
        description: 'Rimozione arredi esistenti, demolizione tramezzi non portanti, preparazione cantiere',
        order: 1,
        status: 'completed',
        startDate: '2024-11-05T08:00:00Z',
        endDate: '2024-11-15T17:00:00Z',
        duration: 10,
        dependencies: [],
        assignedContractors: ['cont-001'],
        budget: 25000,
        actualCost: 23500,
        progress: 100,
        tasks: [
          {
            id: 'task-001',
            phaseId: 'phase-001',
            name: 'Rimozione arredi',
            description: 'Smontaggio e rimozione di tutti gli arredi esistenti',
            status: 'completed',
            assignee: 'Marco Operativo',
            startDate: '2024-11-05T08:00:00Z',
            endDate: '2024-11-07T17:00:00Z',
            estimatedHours: 20,
            actualHours: 18,
            notes: 'Completato in anticipo'
          }
        ]
      },
      {
        id: 'phase-002',
        projectId: 'proj-001',
        name: 'Impianti Elettrici e Climatizzazione',
        description: 'Installazione nuovo impianto elettrico, illuminazione LED, sistema di climatizzazione',
        order: 2,
        status: 'in_progress',
        startDate: '2024-11-16T08:00:00Z',
        endDate: '2024-11-30T17:00:00Z',
        duration: 14,
        dependencies: ['phase-001'],
        assignedContractors: ['cont-002'],
        budget: 45000,
        actualCost: 38000,
        progress: 75,
        tasks: [
          {
            id: 'task-002',
            phaseId: 'phase-002',
            name: 'Impianto elettrico',
            description: 'Installazione quadri, cavi e punti luce',
            status: 'in_progress',
            assignee: 'Dott. Marco Impianti',
            startDate: '2024-11-16T08:00:00Z',
            endDate: '2024-11-25T17:00:00Z',
            estimatedHours: 60,
            actualHours: 45,
            notes: 'Progredendo bene'
          }
        ]
      },
      {
        id: 'phase-003',
        projectId: 'proj-001',
        name: 'Interior Design e Allestimento',
        description: 'Pavimentazione, tinteggiatura, installazione arredi e allestimento finale',
        order: 3,
        status: 'pending',
        startDate: '2024-12-01T08:00:00Z',
        endDate: '2024-12-15T17:00:00Z',
        duration: 14,
        dependencies: ['phase-002'],
        assignedContractors: ['cont-003'],
        budget: 55000,
        progress: 0,
        tasks: []
      }
    ],
    documents: [],
    photos: [],
    notes: 'Progetto strategico per il rilancio del punto vendita romano. Particolare attenzione al rispetto dei tempi per riapertura prima delle festività.'
  },
  {
    id: 'proj-002',
    locationId: 'loc-001',
    name: 'Upgrade Tecnologico Flagship Milano',
    description: 'Installazione sistema POS avanzato, illuminazione smart e sistema audio/video',
    type: 'refit',
    status: 'planning',
    priority: 'medium',
    budget: {
      planned: 85000,
      approved: 80000,
      spent: 0,
      remaining: 80000
    },
    dates: {
      startPlanned: '2025-01-15T09:00:00Z',
      endPlanned: '2025-02-28T18:00:00Z',
      createdAt: '2024-11-20T10:00:00Z',
      updatedAt: '2024-11-30T15:45:00Z'
    },
    projectManager: 'Dott.ssa Tech Manager',
    team: ['Marco Rossi', 'Tecnico IT'],
    phases: [
      {
        id: 'phase-004',
        projectId: 'proj-002',
        name: 'Analisi e Progettazione',
        description: 'Studio layout esistente, progettazione interventi, ottenimento permessi',
        order: 1,
        status: 'pending',
        startDate: '2025-01-15T09:00:00Z',
        endDate: '2025-01-25T17:00:00Z',
        duration: 10,
        dependencies: [],
        assignedContractors: ['cont-002'],
        budget: 15000,
        progress: 0,
        tasks: []
      }
    ],
    documents: [],
    photos: [],
    notes: 'Progetto di modernizzazione per migliorare l\'esperienza cliente nel flagship store'
  },
  {
    id: 'proj-003',
    locationId: 'loc-003',
    name: 'Espansione Spazio Vendita Outlet',
    description: 'Ampliamento area vendita con creazione di nuova sezione accessori',
    type: 'expansion',
    status: 'approved',
    priority: 'low',
    budget: {
      planned: 65000,
      approved: 65000,
      spent: 0,
      remaining: 65000
    },
    dates: {
      startPlanned: '2025-03-01T08:00:00Z',
      endPlanned: '2025-04-15T18:00:00Z',
      createdAt: '2024-11-25T11:30:00Z',
      updatedAt: '2024-11-28T14:20:00Z'
    },
    projectManager: 'Arch. Outlet Manager',
    team: ['Alessandro Verdi'],
    phases: [],
    documents: [],
    photos: [],
    notes: 'Progetto approvato, in attesa di conferma date esecutive'
  }
];

// Dati di esempio - Quotes (Preventivi)
export const sampleQuotes: Quote[] = [
  {
    id: 'quote-001',
    projectId: 'proj-001',
    phaseId: 'phase-001',
    contractorId: 'cont-001',
    quoteNumber: 'PREV-2024-001',
    status: 'approved',
    requestDate: '2024-10-20T10:00:00Z',
    responseDate: '2024-10-25T15:30:00Z',
    validUntil: '2024-11-25T23:59:59Z',
    totalAmount: 25000,
    currency: 'EUR',
    items: [
      {
        id: 'item-001',
        description: 'Demolizione tramezzi non portanti',
        quantity: 1,
        unitPrice: 8000,
        totalPrice: 8000,
        unit: 'corpo',
        category: 'Demolizioni'
      },
      {
        id: 'item-002',
        description: 'Rimozione pavimentazione esistente',
        quantity: 320,
        unitPrice: 25,
        totalPrice: 8000,
        unit: 'mq',
        category: 'Demolizioni'
      },
      {
        id: 'item-003',
        description: 'Smaltimento materiali',
        quantity: 1,
        unitPrice: 4500,
        totalPrice: 4500,
        unit: 'corpo',
        category: 'Smaltimento'
      },
      {
        id: 'item-004',
        description: 'Pulizia e preparazione cantiere',
        quantity: 1,
        unitPrice: 4500,
        totalPrice: 4500,
        unit: 'corpo',
        category: 'Preparazione'
      }
    ],
    terms: 'Lavori da eseguire secondo capitolato tecnico. Garanzia 24 mesi su manodopera.',
    notes: 'Include fornitura di tutti i materiali e attrezzature necessarie',
    documents: [],
    approval: {
      approvedBy: 'Ing. Laura Progetti',
      approvedAt: '2024-10-28T09:15:00Z'
    },
    paymentTerms: [
      {
        id: 'term-001',
        quoteId: 'quote-001',
        description: 'Acconto 30%',
        type: 'advance',
        percentage: 30,
        triggerEvent: 'order_confirmation',
        dueAfterDays: 0,
        vatIncluded: true,
        order: 1,
        isActive: true
      },
      {
        id: 'term-002',
        quoteId: 'quote-001',
        description: 'Saldo 70%',
        type: 'balance',
        percentage: 70,
        triggerEvent: 'installation_complete',
        dueAfterDays: 0,
        vatIncluded: true,
        order: 2,
        isActive: true
      }
    ],
    payments: [
      {
        id: 'pay-001',
        quoteId: 'quote-001',
        paymentTermId: 'term-001',
        plannedAmount: 7500,
        paidAmount: 7500,
        plannedDate: '2024-11-01T00:00:00Z',
        paymentDate: '2024-11-01T14:30:00Z',
        status: 'paid',
        method: 'bank_transfer',
        reference: 'BON-2024-001234',
        invoiceNumber: 'FAT-2024-001',
        createdAt: '2024-11-01T14:30:00Z',
        updatedAt: '2024-11-01T14:30:00Z'
      },
      {
        id: 'pay-002',
        quoteId: 'quote-001',
        paymentTermId: 'term-002',
        plannedAmount: 17500,
        paidAmount: 17500,
        plannedDate: '2024-11-15T00:00:00Z',
        paymentDate: '2024-11-16T10:15:00Z',
        status: 'paid',
        method: 'bank_transfer',
        reference: 'BON-2024-001567',
        invoiceNumber: 'FAT-2024-015',
        createdAt: '2024-11-16T10:15:00Z',
        updatedAt: '2024-11-16T10:15:00Z'
      }
    ],
    paymentConfig: {
      vatRate: 22,
      paymentMethod: 'bank_transfer'
    }
  },
  {
    id: 'quote-002',
    projectId: 'proj-001',
    phaseId: 'phase-002',
    contractorId: 'cont-002',
    quoteNumber: 'PREV-2024-002',
    status: 'approved',
    requestDate: '2024-10-22T14:00:00Z',
    responseDate: '2024-10-27T11:20:00Z',
    validUntil: '2024-12-27T23:59:59Z',
    totalAmount: 45000,
    currency: 'EUR',
    items: [
      {
        id: 'item-005',
        description: 'Quadro elettrico generale',
        quantity: 1,
        unitPrice: 3500,
        totalPrice: 3500,
        unit: 'pz',
        category: 'Impianti Elettrici'
      },
      {
        id: 'item-006',
        description: 'Punti luce LED',
        quantity: 45,
        unitPrice: 180,
        totalPrice: 8100,
        unit: 'pz',
        category: 'Illuminazione'
      },
      {
        id: 'item-007',
        description: 'Impianto climatizzazione',
        quantity: 1,
        unitPrice: 28000,
        totalPrice: 28000,
        unit: 'corpo',
        category: 'Climatizzazione'
      },
      {
        id: 'item-008',
        description: 'Canalizzazioni e cavi',
        quantity: 1,
        unitPrice: 5400,
        totalPrice: 5400,
        unit: 'corpo',
        category: 'Impianti Elettrici'
      }
    ],
    terms: 'Conformità normative CEI. Certificazione impianti inclusa. Garanzia 36 mesi.',
    notes: 'Impianti predisposti per futuro sistema di videosorveglianza',
    documents: [],
    approval: {
      approvedBy: 'Ing. Laura Progetti',
      approvedAt: '2024-10-30T16:45:00Z'
    },
    paymentTerms: [
      {
        id: 'term-003',
        quoteId: 'quote-002',
        description: 'Acconto 40%',
        type: 'advance',
        percentage: 40,
        triggerEvent: 'order_confirmation',
        dueAfterDays: 0,
        vatIncluded: true,
        order: 1,
        isActive: true
      },
      {
        id: 'term-004',
        quoteId: 'quote-002',
        description: 'SAL 30%',
        type: 'progress',
        percentage: 30,
        triggerEvent: 'installation_start',
        dueAfterDays: 7,
        vatIncluded: true,
        order: 2,
        isActive: true
      },
      {
        id: 'term-005',
        quoteId: 'quote-002',
        description: 'Saldo 30%',
        type: 'completion',
        percentage: 30,
        triggerEvent: 'installation_complete',
        dueAfterDays: 30,
        vatIncluded: true,
        order: 3,
        isActive: true
      }
    ],
    payments: [
      {
        id: 'pay-003',
        quoteId: 'quote-002',
        paymentTermId: 'term-003',
        plannedAmount: 18000,
        paidAmount: 18000,
        plannedDate: '2024-11-05T00:00:00Z',
        paymentDate: '2024-11-05T09:20:00Z',
        status: 'paid',
        method: 'bank_transfer',
        reference: 'BON-2024-001890',
        invoiceNumber: 'FAT-2024-002',
        createdAt: '2024-11-05T09:20:00Z',
        updatedAt: '2024-11-05T09:20:00Z'
      },
      {
        id: 'pay-004',
        quoteId: 'quote-002',
        paymentTermId: 'term-004',
        plannedAmount: 13500,
        paidAmount: 13500,
        plannedDate: '2024-11-23T00:00:00Z',
        paymentDate: '2024-11-25T15:10:00Z',
        status: 'paid',
        method: 'bank_transfer',
        reference: 'BON-2024-002134',
        invoiceNumber: 'FAT-2024-025',
        createdAt: '2024-11-25T15:10:00Z',
        updatedAt: '2024-11-25T15:10:00Z'
      },
      {
        id: 'pay-005',
        quoteId: 'quote-002',
        paymentTermId: 'term-005',
        plannedAmount: 13500,
        paidAmount: 0,
        plannedDate: '2024-12-30T00:00:00Z',
        status: 'pending',
        createdAt: '2024-11-30T00:00:00Z',
        updatedAt: '2024-11-30T00:00:00Z'
      }
    ],
    paymentConfig: {
      vatRate: 22,
      paymentMethod: 'bank_transfer'
    }
  },
  {
    id: 'quote-003',
    projectId: 'proj-001',
    phaseId: 'phase-003',
    contractorId: 'cont-003',
    quoteNumber: 'PREV-2024-003',
    status: 'under_review',
    requestDate: '2024-11-25T09:00:00Z',
    responseDate: '2024-11-28T14:30:00Z',
    validUntil: '2025-01-28T23:59:59Z',
    totalAmount: 55000,
    currency: 'EUR',
    items: [
      {
        id: 'item-009',
        description: 'Pavimentazione LVT Premium',
        quantity: 320,
        unitPrice: 85,
        totalPrice: 27200,
        unit: 'mq',
        category: 'Pavimenti'
      },
      {
        id: 'item-010',
        description: 'Tinteggiatura pareti e soffitti',
        quantity: 1,
        unitPrice: 8500,
        totalPrice: 8500,
        unit: 'corpo',
        category: 'Finiture'
      },
      {
        id: 'item-011',
        description: 'Arredamento modulare',
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
        unit: 'corpo',
        category: 'Arredamento'
      },
      {
        id: 'item-012',
        description: 'Installazione e allestimento',
        quantity: 1,
        unitPrice: 4300,
        totalPrice: 4300,
        unit: 'corpo',
        category: 'Installazione'
      }
    ],
    terms: 'Materiali di prima scelta. Garanzia 24 mesi su difetti di fabbricazione.',
    notes: 'Preventivo include progettazione layout e rendering 3D',
    documents: [],
    approval: {},
    paymentTerms: [
      {
        id: 'term-006',
        quoteId: 'quote-003',
        description: 'Acconto 50%',
        type: 'advance',
        percentage: 50,
        triggerEvent: 'order_confirmation',
        dueAfterDays: 0,
        vatIncluded: true,
        order: 1,
        isActive: true
      },
      {
        id: 'term-007',
        quoteId: 'quote-003',
        description: 'Saldo 50%',
        type: 'completion',
        percentage: 50,
        triggerEvent: 'installation_complete',
        dueAfterDays: 15,
        vatIncluded: true,
        order: 2,
        isActive: true
      }
    ],
    payments: [],
    paymentConfig: {
      vatRate: 22,
      paymentMethod: 'bank_transfer'
    }
  }
];

// User di esempio
export const sampleUsers: User[] = [
  {
    id: 'user-001',
    firstName: 'Laura',
    lastName: 'Progetti',
    email: 'l.progetti@example.com',
    role: 'project_manager',
    permissions: [
      { resource: 'projects', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'contractors', actions: ['read', 'update'] },
      { resource: 'quotes', actions: ['create', 'read', 'update'] }
    ],
    phone: '+39 335 1234567',
    department: 'Project Management',
    isActive: true,
    lastLogin: '2024-12-01T08:30:00Z',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-12-01T08:30:00Z'
  }
];

// Funzione per inizializzare i dati se non esistono
export function initializeSampleData(): void {
  try {
    // Controlla se esistono già dati
    const existingLocations = localStorage.getItem(STORAGE_KEYS.LOCATIONS);

    if (!existingLocations || JSON.parse(existingLocations).length === 0) {
      console.log('🔄 Inizializzazione dati di esempio...');

      // Salva tutti i dati di esempio
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(sampleLocations));
      localStorage.setItem(STORAGE_KEYS.CONTRACTORS, JSON.stringify(sampleContractors));
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(sampleProjects));
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(sampleQuotes));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sampleUsers));
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(sampleAppointments));

      // Imposta utente corrente
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sampleUsers[0]));

      console.log('✅ Dati di esempio inizializzati con successo!');
      console.log(`📍 ${sampleLocations.length} locations`);
      console.log(`🏗️ ${sampleProjects.length} progetti`);
      console.log(`👷 ${sampleContractors.length} fornitori`);
      console.log(`📋 ${sampleQuotes.length} preventivi`);
      console.log(`💰 ${sampleQuotes.reduce((acc, q) => acc + q.payments.length, 0)} pagamenti`);
    } else {
      console.log('ℹ️ Dati già presenti, non sovrascrivo');
    }
  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione dei dati:', error);
  }
}

// Funzione per resettare tutti i dati (solo per sviluppo)
export function resetAllData(): void {
  if (confirm('⚠️ Sei sicuro di voler cancellare tutti i dati esistenti e reinizializzare i dati di esempio?')) {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    initializeSampleData();
    window.location.reload();
  }
}