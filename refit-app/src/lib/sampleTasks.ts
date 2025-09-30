import { TaskEnhanced } from '@/types';

// Sample Enhanced Tasks Data
export const sampleTasks: TaskEnhanced[] = [
  {
    id: 'task-001',
    title: 'Completare demolizione pareti interne',
    description: 'Demolire tutte le pareti divisorie del negozio secondo progetto',
    projectId: 'proj-001', // Milano Centro Refit
    phaseId: 'phase-001-01', // Demolizione e Preparazione
    assignedTo: ['user-001'],
    status: 'in_progress',
    type: 'construction',
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], // +3 giorni
    estimatedHours: 16,
    actualHours: 8,
    remainingHours: 8,
    progressPercentage: 50,
    tags: ['demolizione', 'strutturale'],
    labels: ['urgente'],
    checklist: [
      { id: 'cl-001', title: 'Rimuovere pareti divisorie zona vendita', completed: true },
      { id: 'cl-002', title: 'Rimuovere controsoffitto esistente', completed: true },
      { id: 'cl-003', title: 'Smaltire materiali demoliti', completed: false },
      { id: 'cl-004', title: 'Pulizia finale area', completed: false }
    ],
    reminder: {
      enabled: true,
      daysBefore: 1,
      sent: false
    },
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'task-002',
    title: 'Installazione impianto elettrico',
    description: 'Realizzare nuovo impianto elettrico secondo schema progettuale',
    projectId: 'proj-001',
    phaseId: 'phase-001-02', // Impianti
    assignedTo: ['user-002'],
    contractorId: 'cont-002', // Elettrica SRL
    status: 'pending',
    type: 'electrical',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    estimatedHours: 40,
    progressPercentage: 0,
    dependencies: ['task-001'], // Dipende dalla demolizione
    tags: ['elettrico', 'impianti'],
    labels: ['critico'],
    checklist: [
      { id: 'cl-005', title: 'Tracciare percorsi cavi', completed: false },
      { id: 'cl-006', title: 'Installare tubazioni', completed: false },
      { id: 'cl-007', title: 'Posare cavi', completed: false },
      { id: 'cl-008', title: 'Montare quadro elettrico', completed: false },
      { id: 'cl-009', title: 'Test e collaudo', completed: false }
    ],
    reminder: {
      enabled: true,
      daysBefore: 2
    },
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'task-003',
    title: 'Verifica conformità antincendio',
    description: 'Controllo conformità impianti e strutture alle norme antincendio',
    projectId: 'proj-001',
    assignedTo: ['user-003'],
    status: 'pending',
    type: 'inspection',
    priority: 'high',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    estimatedHours: 4,
    progressPercentage: 0,
    dependencies: ['task-002'], // Dopo impianti
    tags: ['sicurezza', 'certificazioni'],
    approvalRequired: true,
    reminder: {
      enabled: true,
      daysBefore: 3
    },
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'task-004',
    title: 'Ordine arredi negozio',
    description: 'Ordinare espositori, scaffalature e bancone cassa',
    projectId: 'proj-002', // Serravalle Designer Outlet
    assignedTo: ['user-001'],
    status: 'in_progress',
    type: 'procurement',
    priority: 'medium',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    estimatedHours: 8,
    actualHours: 3,
    remainingHours: 5,
    progressPercentage: 40,
    tags: ['arredi', 'acquisti'],
    checklist: [
      { id: 'cl-010', title: 'Selezionare fornitore', completed: true },
      { id: 'cl-011', title: 'Richiedere preventivo', completed: true },
      { id: 'cl-012', title: 'Approvazione budget', completed: false },
      { id: 'cl-013', title: 'Emettere ordine', completed: false }
    ],
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-005',
    title: 'Tinteggiatura pareti',
    description: 'Pittura pareti con colori corporate',
    projectId: 'proj-002',
    assignedTo: ['user-002'],
    contractorId: 'cont-001', // Ristrutturazioni SRL
    status: 'pending',
    type: 'finishing',
    priority: 'low',
    dueDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
    estimatedHours: 24,
    progressPercentage: 0,
    tags: ['finiture', 'pittura'],
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'task-006',
    title: 'Setup sistema POS',
    description: 'Installazione e configurazione sistema punto vendita',
    projectId: 'proj-003', // Roma Eur Office
    assignedTo: ['user-003'],
    status: 'under_review',
    type: 'technology',
    priority: 'high',
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    estimatedHours: 12,
    actualHours: 10,
    remainingHours: 2,
    progressPercentage: 85,
    tags: ['tecnologia', 'retail'],
    checklist: [
      { id: 'cl-014', title: 'Installare hardware POS', completed: true },
      { id: 'cl-015', title: 'Configurare software', completed: true },
      { id: 'cl-016', title: 'Test transazioni', completed: true },
      { id: 'cl-017', title: 'Formazione personale', completed: false }
    ],
    approvalRequired: true,
    createdBy: 'user-003',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-007',
    title: 'Installazione insegne esterne',
    description: 'Montaggio insegne luminose facciata negozio',
    projectId: 'proj-001',
    assignedTo: ['user-002'],
    contractorId: 'cont-003', // Insegne Luminose SRL
    status: 'on_hold',
    type: 'signage',
    priority: 'medium',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    estimatedHours: 16,
    progressPercentage: 0,
    blockedBy: ['task-003'], // Bloccato da certificazioni
    tags: ['insegne', 'esterno'],
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'task-008',
    title: 'Documentazione finale progetto',
    description: 'Raccolta certificazioni, collaudi e documentazione as-built',
    projectId: 'proj-002',
    assignedTo: ['user-001'],
    status: 'pending',
    type: 'documentation',
    priority: 'medium',
    dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    estimatedHours: 20,
    progressPercentage: 0,
    tags: ['documentazione', 'finale'],
    checklist: [
      { id: 'cl-018', title: 'Certificato conformità impianti', completed: false },
      { id: 'cl-019', title: 'Planimetrie as-built', completed: false },
      { id: 'cl-020', title: 'Manuali uso e manutenzione', completed: false },
      { id: 'cl-021', title: 'Certificato agibilità', completed: false }
    ],
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'task-009',
    title: 'Installazione climatizzazione',
    description: 'Realizzazione impianto climatizzazione completo',
    projectId: 'proj-001',
    assignedTo: ['user-002'],
    contractorId: 'cont-004', // Climatech SRL
    status: 'completed',
    type: 'hvac',
    priority: 'high',
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    estimatedHours: 32,
    actualHours: 35,
    progressPercentage: 100,
    tags: ['climatizzazione', 'impianti'],
    checklist: [
      { id: 'cl-022', title: 'Installare split interni', completed: true },
      { id: 'cl-023', title: 'Installare unità esterna', completed: true },
      { id: 'cl-024', title: 'Collegamento tubazioni', completed: true },
      { id: 'cl-025', title: 'Test e messa in funzione', completed: true },
      { id: 'cl-026', title: 'Certificazione impianto', completed: true }
    ],
    approvalRequired: true,
    approvedBy: 'user-001',
    approvedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'task-010',
    title: 'Verifica budget progetto',
    description: 'Controllo scostamenti budget e previsione chiusura',
    projectId: 'proj-003',
    assignedTo: ['user-001'],
    status: 'in_progress',
    type: 'administrative',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], // Domani
    estimatedHours: 4,
    actualHours: 2,
    remainingHours: 2,
    progressPercentage: 50,
    tags: ['budget', 'amministrazione'],
    labels: ['scadenza-imminente'],
    reminder: {
      enabled: true,
      daysBefore: 0,
      sent: false
    },
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];