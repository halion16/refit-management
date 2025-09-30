# Roadmap Appuntamenti e Task Management

## Contesto
Il sistema attuale gestisce progetti con fasi (phases) e task base, ma manca un sistema granulare per tracciare appuntamenti, meeting e task specifici con scheduling avanzato.

## Struttura Attuale
- `Project` → `ProjectPhase` → `Task` (molto basico)
- Calendar esistente con visualizzazione progetti
- Manca categorizzazione, scheduling, partecipanti

## Decisione Architetturale: Opzione B - Entità Separate

### Nuovi Tipi TypeScript

```typescript
interface Appointment {
  id: string;
  projectId?: string;
  phaseId?: string;
  title: string;
  description?: string;
  type: 'meeting' | 'site_visit' | 'client_call' | 'inspection' | 'deadline' | 'milestone' | 'other';
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location?: {
    type: 'physical' | 'virtual';
    address?: string;
    meetingLink?: string;
  };
  participants: Participant[];
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  priority: 'low' | 'medium' | 'high';
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  documents?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Participant {
  type: 'internal' | 'external';
  userId?: string; // Se interno
  name: string;
  email: string;
  role?: string;
  required: boolean;
}

interface TaskEnhanced extends Task {
  type: 'task' | 'milestone' | 'review';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[]; // ID di altri task
  tags?: string[];
  reminder?: {
    enabled: boolean;
    daysBefore: number;
  };
}
```

## Roadmap di Implementazione

### Fase 1: Foundation (1-2 settimane)
**Obiettivo**: Creare le basi del sistema appuntamenti

#### Task:
1. **Aggiornare tipi TypeScript**
   - Aggiungere `Appointment` e `Participant` in `types/index.ts`
   - Estendere `Task` con nuovi campi
   - Aggiornare `STORAGE_KEYS` per appointments

2. **Creare localStorage hooks**
   - `useAppointments.ts` con CRUD operations
   - `useTasksEnhanced.ts` per task avanzati
   - Aggiornare `sampleData.ts` con dati di esempio

3. **Componenti base**
   - `AppointmentForm.tsx` - Form creazione/modifica
   - `AppointmentCard.tsx` - Card visualizzazione
   - `AppointmentList.tsx` - Lista appuntamenti

#### File da creare/modificare:
- `src/types/index.ts` ✓ estendere
- `src/hooks/useAppointments.ts` ✓ nuovo
- `src/lib/sampleData.ts` ✓ aggiornare
- `src/components/AppointmentForm.tsx` ✓ nuovo
- `src/components/AppointmentCard.tsx` ✓ nuovo

### Fase 2: Integrazione Calendar (1 settimana)
**Obiettivo**: Integrare appuntamenti nel calendario esistente

#### Task:
1. **Estendere Calendar.tsx**
   - Mostrare appuntamenti nella vista Timeline
   - Aggiungere appuntamenti nella vista Month
   - Differenziare visivamente progetti vs appuntamenti

2. **Filtri avanzati**
   - Filtro per tipo appuntamento
   - Filtro per progetto/fase
   - Filtro per partecipanti

3. **Vista dettagliata**
   - Popup dettagli appuntamento
   - Quick actions (modifica, elimina, completa)

#### File da modificare:
- `src/components/Calendar.tsx` ✓ estendere
- Aggiungere `AppointmentDetails.tsx`

### Fase 3: Task Management Avanzato (1 settimana)
**Obiettivo**: Sistema task completo

#### Task:
1. **Kanban Board**
   - `TaskBoard.tsx` con drag & drop
   - Colonne: To Do → In Progress → Review → Done
   - Filtri per progetto, assegnatario, scadenza

2. **Task List avanzata**
   - Vista lista con sorting/filtering
   - Assegnazione utenti
   - Tracking tempo (start/stop timer)

3. **Dependencies & Timeline**
   - Gestione dipendenze tra task
   - Gantt chart semplificato
   - Critical path highlighting

#### File da creare:
- `src/components/TaskBoard.tsx`
- `src/components/TaskList.tsx`
- `src/components/TaskTimeline.tsx`

### Fase 4: Dashboard & UX (1 settimana)
**Obiettivo**: Unificare tutto in dashboard

#### Task:
1. **Dashboard unificata**
   - Widget "Prossimi appuntamenti"
   - Widget "Task in scadenza"
   - Widget "Progetti attivi"
   - Quick actions panel

2. **Notifiche in-app**
   - Sistema notifiche per reminder
   - Badge per appuntamenti/task urgenti
   - Toast notifications

3. **Timeline progetto integrata**
   - Vista unified: fasi + appuntamenti + milestone
   - Export timeline (PDF, immagine)

#### File da creare/modificare:
- `src/components/Dashboard.tsx` ✓ estendere
- `src/components/NotificationSystem.tsx`
- `src/components/ProjectTimeline.tsx`

### Fase 5: Advanced Features (opzionale)
**Obiettivo**: Funzionalità avanzate

#### Task:
1. **Ricorrenze**
   - Appuntamenti ricorrenti (daily, weekly, monthly)
   - Template per meeting tipo ("Weekly standup")
   - Bulk operations

2. **Integrazioni**
   - Export calendario (iCal, Google Calendar)
   - Email inviti per appuntamenti
   - Integrazione con sistemi esterni

3. **Reporting & Analytics**
   - Report tempo speso per progetto
   - Analytics produttività
   - Forecast completion dates

## Priorità Implementazione

### High Priority
1. ✅ Fase 1: Foundation
2. ✅ Fase 2: Integrazione Calendar
3. ✅ Fase 3: Task Management

### Medium Priority
4. ✅ Fase 4: Dashboard & UX

### Low Priority
5. ⚠️ Fase 5: Advanced Features

## Note Tecniche

### Storage Strategy
- Mantenere backward compatibility
- Migrazioni automatiche per dati esistenti
- Separare storage: `refit_appointments`, `refit_tasks_enhanced`

### Performance Considerations
- Lazy loading per liste grandi
- Pagination per appuntamenti storici
- Indexing per ricerche rapide (in-memory)

### UI/UX Guidelines
- Mantenere consistency con design esistente
- Mobile-first per calendar views
- Accessibility compliance (ARIA labels)

## File Structure Finale

```
src/
├── components/
│   ├── appointments/
│   │   ├── AppointmentForm.tsx
│   │   ├── AppointmentCard.tsx
│   │   ├── AppointmentList.tsx
│   │   └── AppointmentDetails.tsx
│   ├── tasks/
│   │   ├── TaskBoard.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskForm.tsx
│   ├── Calendar.tsx (extended)
│   ├── Dashboard.tsx (extended)
│   └── ProjectTimeline.tsx
├── hooks/
│   ├── useAppointments.ts
│   ├── useTasksEnhanced.ts
│   └── useNotifications.ts
├── types/index.ts (extended)
└── lib/
    └── sampleData.ts (extended)
```

## Success Metrics
- ✅ Riduzione click per creare appuntamento (target: max 3 click)
- ✅ Aumento visibilità task in scadenza (dashboard widgets)
- ✅ Miglior tracking progetti (timeline integrata)
- ✅ User satisfaction (feedback qualitativo)

---

**Data creazione**: 2025-09-29
**Ultima modifica**: 2025-09-29
**Prossimo review**: Prima implementazione Fase 1