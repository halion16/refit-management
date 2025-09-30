# 🗺️ ROADMAP: Team Management & Notification System

**Progetto:** BDS Refit Management App
**Data creazione:** 2025-09-30
**Versione:** 1.0
**Status:** In Planning → Sprint 1 Starting

---

## 📊 ANALISI STATO ATTUALE

### ✅ **Cosa esiste già:**
- Tab Team in ProjectDetails (UI base per aggiungere/rimuovere membri)
- Campo `team: string[]` in Project type
- Campo `projectManager: string` in Project
- Campo `assignee: string` nei Task
- Visualizzazione workload team in Overview

### ❌ **Cosa manca completamente:**
- **Gestione team strutturata** (no profili utente, ruoli, permessi)
- **Sistema notifiche** (completamente assente)
- **Assegnazione intelligente task**
- **Tracciamento attività team**
- **Comunicazione interna**

---

## 🎯 FASE 1: SISTEMA TEAM MANAGEMENT (Priorità: ALTA)

### 1.1 **Data Model & Types** (2-3 ore)
```typescript
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'manager' | 'coordinator' | 'technician' | 'contractor' | 'viewer';
  department?: string;
  skills: string[]; // 'electrical', 'plumbing', 'carpentry'
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
    onTimeCompletion: number; // %
    averageRating: number; // 1-5
  };
  contacts: {
    phone?: string;
    mobile?: string;
  };
  status: 'active' | 'inactive' | 'vacation';
  createdAt: string;
  updatedAt: string;
}

interface TeamRole {
  id: string;
  name: string;
  permissions: Permission[];
  canAssignTasks: boolean;
  canEditBudget: boolean;
  canDeleteProjects: boolean;
}

type Permission =
  | 'view_projects'
  | 'edit_projects'
  | 'delete_projects'
  | 'manage_team'
  | 'manage_budget'
  | 'manage_documents'
  | 'manage_tasks';
```

### 1.2 **Team Store (Zustand)** (1-2 ore)
- Hook `useTeam` per gestione membri
- CRUD operations (add/edit/remove membri)
- Ricerca e filtri (per skill, disponibilità, ruolo)
- Calcolo automatico workload

### 1.3 **UI Components** (4-5 ore)

#### **A. Team Directory** (Vista principale)
```
📁 src/components/Team/
  ├── TeamDirectory.tsx      // Griglia membri con card
  ├── TeamMemberCard.tsx     // Card singolo membro
  ├── TeamMemberForm.tsx     // Form creazione/modifica
  ├── TeamFilters.tsx        // Filtri ricerca
  └── TeamStats.tsx          // Statistiche team
```

**Features:**
- Card membri con avatar, ruolo, workload
- Filtri: ruolo, skill, disponibilità, stato
- Indicatori visuali: disponibilità, carico lavoro
- Quick actions: assign task, send message, view profile

#### **B. Team Member Profile** (Dettaglio membro)
```
Sezioni:
- Info personali & contatti
- Ruolo & permessi
- Skills & certificazioni
- Task assegnati (correnti e storici)
- Performance metrics & grafici
- Disponibilità & calendario
- Timeline attività
```

#### **C. Team Workload Dashboard**
```
Visualizzazioni:
- Gantt chart assegnazioni
- Heatmap utilizzo risorse
- Distribuzione ore per membro
- Task per skill/department
- Forecast capacity planning
```

### 1.4 **Task Assignment Smart** (2-3 ore)
```typescript
// Algoritmo suggerimento assegnazioni
interface TaskAssignmentSuggestion {
  memberId: string;
  score: number; // 0-100
  reasoning: {
    skillMatch: number;
    availability: number;
    currentWorkload: number;
    pastPerformance: number;
  };
}

function suggestAssignment(task: Task): TeamMember[] {
  // Considera: skills richieste, workload attuale, performance passata
  // Ordina per score decrescente
}
```

### 1.5 **Integration con Progetti** (1-2 ore)
- Assegnazione automatica da ProjectDetails
- Riassegnazione bulk tasks
- Notifica membro quando assegnato
- Vista "My Tasks" per ogni membro

---

## 🔔 FASE 2: NOTIFICATION SYSTEM (Priorità: ALTA)

### 2.1 **Data Model & Types** (1-2 ore)
```typescript
interface Notification {
  id: string;
  userId: string; // destinatario
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>; // payload specifico
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  readAt?: string;
  actionUrl?: string; // link diretto risorsa
  actionLabel?: string; // "Vedi Task", "Apri Progetto"
  createdAt: string;
  expiresAt?: string;
}

type NotificationType =
  | 'task_assigned'
  | 'task_due_soon'
  | 'task_overdue'
  | 'task_completed'
  | 'task_comment'
  | 'project_updated'
  | 'budget_warning'
  | 'budget_exceeded'
  | 'phase_completed'
  | 'team_mention'
  | 'deadline_approaching'
  | 'document_uploaded'
  | 'approval_required'
  | 'system_alert';

interface NotificationSettings {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  preferences: {
    taskAssigned: boolean;
    taskDueSoon: boolean;
    taskOverdue: boolean;
    budgetAlerts: boolean;
    projectUpdates: boolean;
    teamMentions: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
}
```

### 2.2 **Notification Store** (2-3 ore)
```typescript
// src/store/notificationStore.ts
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;

  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;

  // Helpers
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: NotificationType) => Notification[];
  getUrgentNotifications: () => Notification[];
}
```

### 2.3 **Notification Triggers** (3-4 ore)
```typescript
// src/lib/notifications/triggers.ts

// Auto-notifiche basate su eventi
const notificationTriggers = {
  onTaskAssigned: (task: Task, assignee: TeamMember) => {
    createNotification({
      userId: assignee.id,
      type: 'task_assigned',
      title: 'Nuovo task assegnato',
      message: `Ti è stato assegnato il task: ${task.name}`,
      priority: task.priority === 'urgent' ? 'high' : 'medium',
      actionUrl: `/tasks/${task.id}`,
      actionLabel: 'Vedi Task'
    });
  },

  onTaskDueSoon: (task: Task) => {
    // Check giornaliero: task con scadenza < 24h
    if (daysUntilDue(task) <= 1) {
      createNotification({
        userId: task.assignee,
        type: 'task_due_soon',
        title: '⚠️ Task in scadenza',
        message: `Il task "${task.name}" scade domani!`,
        priority: 'high'
      });
    }
  },

  onBudgetWarning: (project: Project) => {
    const spent = (project.budget.spent / project.budget.approved) * 100;
    if (spent >= 80 && spent < 100) {
      notifyTeam(project.team, {
        type: 'budget_warning',
        title: '⚠️ Budget al 80%',
        message: `Il progetto "${project.name}" ha utilizzato l'80% del budget`,
        priority: 'high'
      });
    }
  },

  // Altri trigger automatici...
};
```

### 2.4 **UI Components** (4-5 ore)

#### **A. Notification Bell (Header)**
```tsx
<NotificationBell
  unreadCount={12}
  onOpen={() => setShowPanel(true)}
/>
```
- Badge con conteggio unread
- Pulse animation per nuove notifiche
- Click apre dropdown panel

#### **B. Notification Panel** (Dropdown)
```
📦 Sezioni:
- Tabs: Tutte / Non lette / Archiviate
- Filtro per tipo
- Lista notifiche (gruppate per data)
- Quick actions: Mark read, Delete
- Link "Vedi tutte" → Notification Center
```

#### **C. Notification Center** (Pagina dedicata)
```
Features:
- Vista completa tutte notifiche
- Filtri avanzati (tipo, priorità, data)
- Ricerca full-text
- Bulk actions (mark all read, delete)
- Impostazioni notifiche
```

#### **D. Notification Settings**
```
Preferenze:
☑ Email notifications
☑ In-app notifications
☐ Push notifications (future)

Per tipo evento:
☑ Task assegnati
☑ Scadenze vicine
☐ Commenti task
☑ Aggiornamenti budget
...

Quiet hours: 22:00 - 08:00
```

### 2.5 **Real-time Updates** (2-3 ore)
```typescript
// Polling strategy (per ora)
useEffect(() => {
  const interval = setInterval(() => {
    checkForNewNotifications();
  }, 30000); // ogni 30 secondi

  return () => clearInterval(interval);
}, []);

// Future: WebSocket per notifiche real-time
```

### 2.6 **Smart Notifications** (2-3 ore)
```typescript
// Raggruppamento intelligente
function groupNotifications(notifications: Notification[]) {
  // "3 task in scadenza oggi" invece di 3 notifiche separate
  // "5 nuovi commenti sul progetto X"
}

// Priorità dinamica
function calculatePriority(notification: Notification) {
  // Considera: urgenza, scadenza, ruolo utente, preferenze
}

// Auto-dismiss
function shouldAutoDismiss(notification: Notification) {
  // Task completed → dismiss "task_due_soon"
  // Budget resolved → dismiss "budget_warning"
}
```

---

## 🚀 FASE 3: FEATURES AVANZATE (Priorità: MEDIA)

### 3.1 **Activity Feed** (3-4 ore)
```
Timeline globale attività:
- "Mario ha completato il task X"
- "Budget progetto Y aggiornato"
- "Nuovo documento caricato in Z"
- "Fase completata: Demolizione"

Filtri: per progetto, per membro, per tipo
```

### 3.2 **Team Chat/Comments** (5-6 ore)
```typescript
interface Comment {
  id: string;
  entityType: 'project' | 'task' | 'phase';
  entityId: string;
  userId: string;
  text: string;
  mentions?: string[]; // @username
  attachments?: string[];
  parentId?: string; // per thread
  createdAt: string;
  updatedAt?: string;
}
```

Features:
- Commenti su progetti/task/fasi
- @mentions con notifica
- Thread discussions
- File attachments
- Emoji reactions

### 3.3 **Performance Analytics** (4-5 ore)
```
Dashboard analytics:
- Completion rate per membro
- Average task duration
- On-time delivery %
- Workload trends (last 30/90 days)
- Team velocity
- Skills utilization
```

### 3.4 **Calendar Integration** (3-4 ore)
```
Vista calendario:
- Task deadlines
- Team availability
- Project milestones
- Vacation/time-off
- Meetings

Export: iCal, Google Calendar sync
```

### 3.5 **Mobile Notifications** (6-8 ore)
```
Push notifications via:
- Service Worker (PWA)
- Firebase Cloud Messaging
- Expo (se mobile app)

Features:
- Background sync
- Offline queue
- Sound/vibration
- Custom ringtones per priorità
```

---

## ⏱️ STIMA TEMPI TOTALI

### **FASE 1 - Team Management:** ~15-20 ore
- Data model: 2h
- Store: 2h
- UI Components: 8h
- Smart assignment: 3h
- Integration: 2h

### **FASE 2 - Notification System:** ~15-20 ore
- Data model: 2h
- Store: 3h
- Triggers: 4h
- UI Components: 8h
- Real-time: 3h
- Smart features: 3h

### **FASE 3 - Advanced Features:** ~20-30 ore
- Activity Feed: 4h
- Team Chat: 6h
- Analytics: 5h
- Calendar: 4h
- Mobile Push: 8h

**TOTALE: 50-70 ore di sviluppo**

---

## 📋 ORDINE DI IMPLEMENTAZIONE CONSIGLIATO

### **Sprint 1** (Core Team - 1 settimana) ✅ **IN CORSO**
1. ✅ Team data model & types
2. ⏳ Team store (CRUD base)
3. ⏳ Team directory UI
4. ⏳ Member profile page
5. ⏳ Basic task assignment

### **Sprint 2** (Notifications Base - 1 settimana)
1. Notification data model
2. Notification store
3. Notification bell + dropdown
4. Basic triggers (task assigned, due soon)
5. Mark read/unread

### **Sprint 3** (Integration - 3-4 giorni)
1. Team workload dashboard
2. Smart task assignment
3. Notification center page
4. Notification settings
5. More triggers (budget, phase, etc.)

### **Sprint 4** (Polish - 3-4 giorni)
1. Activity feed
2. Performance metrics
3. Notification grouping
4. Real-time polling
5. Testing & bug fixes

### **Sprint 5** (Advanced - opzionale)
1. Team chat/comments
2. Calendar view
3. Analytics dashboard
4. Mobile push
5. Export/reporting

---

## 💡 NOTE TECNICHE

### **Stack consigliato:**
- **State:** Zustand (già in uso)
- **Storage:** LocalStorage + futuro backend
- **Real-time:** Polling → WebSocket (fase 2)
- **Icons:** Lucide React (già in uso)
- **Charts:** Recharts o Chart.js
- **Date:** date-fns
- **Push:** Service Worker API

### **Best Practices:**
- Notifiche raggruppate per evitare spam
- Batch operations per performance
- Optimistic UI updates
- Error boundaries per resilienza
- Accessibility (ARIA labels, keyboard nav)
- Mobile-first design

---

## 🎯 PRIORITÀ BUSINESS

### **MUST HAVE (Sprint 1-2):**
✅ Team directory & profiles
✅ Task assignment base
✅ Notification bell & panel
✅ Task-related notifications

### **SHOULD HAVE (Sprint 3):**
⭐ Workload dashboard
⭐ Smart assignment
⭐ Notification center
⭐ Budget alerts

### **NICE TO HAVE (Sprint 4-5):**
🎁 Activity feed
🎁 Team chat
🎁 Analytics
🎁 Mobile push

---

## 📝 CHANGE LOG

### 2025-09-30
- ✅ Roadmap creata
- ✅ Sprint 1 iniziato
- Status: Team data model in implementazione

---

**Documento generato da Claude Code - Anthropic AI Assistant**
