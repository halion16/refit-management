import { Appointment } from '@/types';

// Sample Appointments Data
export const sampleAppointments: Appointment[] = [
  {
    id: 'apt-001',
    projectId: 'proj-001', // Milano Centro Refit
    phaseId: 'phase-001-01', // Demolizione e Preparazione
    title: 'Sopralluogo iniziale progetto Milano',
    description: 'Verifica stato attuale del negozio e pianificazione interventi',
    type: 'site_visit',
    scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // +2 giorni
    startTime: '10:00',
    endTime: '12:00',
    location: {
      type: 'physical',
      address: 'Via Montenapoleone 8, Milano',
      locationId: 'loc-001'
    },
    participants: [
      {
        type: 'internal',
        userId: 'user-001',
        name: 'Mario Rossi',
        email: 'mario.rossi@company.com',
        role: 'Project Manager',
        required: true,
        confirmed: true
      },
      {
        type: 'external',
        name: 'Giovanni Verdi',
        email: 'g.verdi@ristrutturazionisrl.it',
        role: 'Responsabile Tecnico',
        required: true
      }
    ],
    organizer: 'user-001',
    status: 'confirmed',
    priority: 'high',
    reminder: {
      enabled: true,
      minutesBefore: 60
    },
    agenda: '- Verifica strutture esistenti\n- Identificazione punti critici\n- Discussione tempistiche\n- Definizione accessi cantiere',
    notes: 'Portare planimetrie e documentazione autorizzazioni',
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'apt-002',
    projectId: 'proj-002', // Serravalle Designer Outlet
    title: 'Riunione kick-off progetto Serravalle',
    description: 'Meeting iniziale con tutti gli stakeholder del progetto',
    type: 'meeting',
    scheduledDate: new Date().toISOString().split('T')[0], // Oggi
    startTime: '14:30',
    endTime: '16:00',
    location: {
      type: 'virtual',
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    },
    participants: [
      {
        type: 'internal',
        userId: 'user-001',
        name: 'Mario Rossi',
        email: 'mario.rossi@company.com',
        role: 'Project Manager',
        required: true,
        confirmed: true
      },
      {
        type: 'internal',
        name: 'Laura Bianchi',
        email: 'laura.bianchi@company.com',
        role: 'Architect',
        required: true,
        confirmed: true
      },
      {
        type: 'external',
        name: 'Andrea Neri',
        email: 'a.neri@elettricasrl.it',
        role: 'Electrical Contractor',
        required: false
      }
    ],
    organizer: 'user-001',
    status: 'confirmed',
    priority: 'high',
    reminder: {
      enabled: true,
      minutesBefore: 30
    },
    agenda: '1. Presentazione progetto e obiettivi\n2. Timeline e milestone principali\n3. Budget e risorse\n4. Ruoli e responsabilità\n5. Piano comunicazione\n6. Next steps',
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'apt-003',
    projectId: 'proj-001',
    title: 'Consegna preventivo finale',
    description: 'Deadline per ricezione preventivi da tutti i fornitori',
    type: 'deadline',
    scheduledDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], // +5 giorni
    startTime: '17:00',
    endTime: '17:00',
    allDay: false,
    participants: [
      {
        type: 'internal',
        userId: 'user-001',
        name: 'Mario Rossi',
        email: 'mario.rossi@company.com',
        role: 'Project Manager',
        required: true
      }
    ],
    organizer: 'user-001',
    status: 'scheduled',
    priority: 'high',
    reminder: {
      enabled: true,
      minutesBefore: 1440 // 1 giorno prima
    },
    notes: 'Verificare ricezione preventivi da: Ristrutturazioni SRL, Elettrica SRL, Idraulica Group',
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'apt-004',
    title: 'Ispezione lavori in corso - Milano',
    description: 'Verifica avanzamento lavori fase demolizione',
    type: 'inspection',
    projectId: 'proj-001',
    phaseId: 'phase-001-01',
    scheduledDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // +7 giorni
    startTime: '09:00',
    endTime: '11:00',
    location: {
      type: 'physical',
      address: 'Via Montenapoleone 8, Milano',
      locationId: 'loc-001'
    },
    participants: [
      {
        type: 'internal',
        userId: 'user-001',
        name: 'Mario Rossi',
        email: 'mario.rossi@company.com',
        role: 'Project Manager',
        required: true
      },
      {
        type: 'external',
        name: 'Giovanni Verdi',
        email: 'g.verdi@ristrutturazionisrl.it',
        role: 'Site Manager',
        required: true
      }
    ],
    organizer: 'user-001',
    status: 'scheduled',
    priority: 'medium',
    reminder: {
      enabled: true,
      minutesBefore: 120
    },
    agenda: '- Verifica completamento demolizione\n- Check sicurezza cantiere\n- Controllo smaltimento materiali\n- Validazione per avvio fase successiva',
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'apt-005',
    projectId: 'proj-003', // Roma Eur Office
    title: 'Meeting interno revisione budget',
    description: 'Analisi scostamenti budget e azioni correttive',
    type: 'internal_review',
    scheduledDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], // Domani
    startTime: '11:00',
    endTime: '12:30',
    location: {
      type: 'virtual',
      meetingLink: 'https://teams.microsoft.com/meet/123456'
    },
    participants: [
      {
        type: 'internal',
        userId: 'user-001',
        name: 'Mario Rossi',
        email: 'mario.rossi@company.com',
        role: 'Project Manager',
        required: true,
        confirmed: true
      },
      {
        type: 'internal',
        name: 'Francesca Verdi',
        email: 'f.verdi@company.com',
        role: 'CFO',
        required: true,
        confirmed: true
      }
    ],
    organizer: 'user-001',
    status: 'confirmed',
    priority: 'high',
    reminder: {
      enabled: true,
      minutesBefore: 30
    },
    agenda: '- Analisi budget vs actual\n- Identificazione varianze significative\n- Piano di rientro budget\n- Richiesta budget aggiuntivo se necessario',
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'apt-006',
    title: 'Chiamata cliente - Aggiornamento progetto',
    description: 'Update settimanale con il cliente sullo stato avanzamento',
    type: 'client_call',
    projectId: 'proj-002',
    scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], // +3 giorni
    startTime: '15:00',
    endTime: '15:30',
    location: {
      type: 'virtual',
      meetingLink: 'https://zoom.us/j/123456789'
    },
    participants: [
      {
        type: 'internal',
        userId: 'user-001',
        name: 'Mario Rossi',
        email: 'mario.rossi@company.com',
        role: 'Project Manager',
        required: true
      },
      {
        type: 'external',
        name: 'Cliente Serravalle',
        email: 'cliente@serravalle.com',
        role: 'Client Representative',
        required: true
      }
    ],
    organizer: 'user-001',
    status: 'scheduled',
    priority: 'medium',
    reminder: {
      enabled: true,
      minutesBefore: 60
    },
    agenda: '- Stato avanzamento lavori\n- Milestone raggiunti\n- Issue e blocchi\n- Prossimi step',
    notes: 'Preparare report fotografico lavori',
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'apt-007',
    projectId: 'proj-001',
    phaseId: 'phase-001-02',
    title: 'Milestone: Completamento impianti',
    description: 'Verifica completamento fase impianti elettrici e idraulici',
    type: 'milestone',
    scheduledDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], // +2 settimane
    startTime: '10:00',
    endTime: '10:00',
    participants: [
      {
        type: 'internal',
        userId: 'user-001',
        name: 'Mario Rossi',
        email: 'mario.rossi@company.com',
        role: 'Project Manager',
        required: true
      }
    ],
    organizer: 'user-001',
    status: 'scheduled',
    priority: 'high',
    reminder: {
      enabled: true,
      minutesBefore: 2880 // 2 giorni prima
    },
    notes: 'Verificare certificazioni impianti e collaudi',
    createdBy: 'user-001',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 86400000).toISOString()
  }
];