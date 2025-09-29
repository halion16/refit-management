import { ProjectDocumentCategory } from '@/types';
import {
  FileText,
  Clipboard,
  Shield,
  Building,
  Euro,
  Search,
  Camera,
  FolderOpen
} from 'lucide-react';

// Configurazione delle categorie di documenti del progetto
export interface ProjectDocumentCategoryConfig {
  id: ProjectDocumentCategory;
  label: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  group: string;
  examples: string[];
}

export const PROJECT_DOCUMENT_CATEGORIES: ProjectDocumentCategoryConfig[] = [
  // Documentazione Tecnica
  {
    id: 'technical_drawings',
    label: 'Disegni Tecnici',
    description: 'Disegni tecnici, planimetrie, schemi',
    icon: FileText,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    group: 'Tecnica',
    examples: ['Planimetrie', 'Disegni costruttivi', 'Schemi impianti']
  },
  {
    id: 'technical_specs',
    label: 'Specifiche Tecniche',
    description: 'Specifiche tecniche dei materiali e lavorazioni',
    icon: Clipboard,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    group: 'Tecnica',
    examples: ['Specifiche materiali', 'Schede tecniche', 'Norme tecniche']
  },
  {
    id: 'technical_reports',
    label: 'Relazioni Tecniche',
    description: 'Relazioni tecniche e relazioni specialistiche',
    icon: FileText,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    group: 'Tecnica',
    examples: ['Relazione geologica', 'Relazione strutturale', 'Relazione impianti']
  },
  {
    id: 'structural_calcs',
    label: 'Calcoli Strutturali',
    description: 'Calcoli strutturali e verifiche',
    icon: Clipboard,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    group: 'Tecnica',
    examples: ['Calcoli strutturali', 'Verifiche sismiche', 'Tabulati di calcolo']
  },
  {
    id: 'material_specs',
    label: 'Schede Materiali',
    description: 'Schede tecniche dei materiali utilizzati',
    icon: FileText,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    group: 'Tecnica',
    examples: ['Schede sicurezza', 'Certificazioni CE', 'Garanzie materiali']
  },

  // Documentazione Approvativa
  {
    id: 'municipal_permits',
    label: 'Permessi Comunali',
    description: 'Permessi e autorizzazioni comunali',
    icon: Shield,
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    group: 'Approvativa',
    examples: ['SCIA', 'Permesso di costruire', 'CILA']
  },
  {
    id: 'authorizations',
    label: 'Autorizzazioni',
    description: 'Autorizzazioni varie enti',
    icon: Shield,
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    group: 'Approvativa',
    examples: ['Soprintendenza', 'VVF', 'ASL']
  },
  {
    id: 'licenses',
    label: 'Licenze',
    description: 'Licenze e concessioni',
    icon: Shield,
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    group: 'Approvativa',
    examples: ['Licenze commerciali', 'Concessioni', 'Autorizzazioni speciali']
  },
  {
    id: 'entity_opinions',
    label: 'Pareri Enti',
    description: 'Pareri e nulla osta enti',
    icon: Shield,
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    group: 'Approvativa',
    examples: ['Pareri ambientali', 'Nulla osta', 'Autorizzazioni paesaggistiche']
  },
  {
    id: 'compliance_certs',
    label: 'Certificazioni',
    description: 'Certificazioni di conformità',
    icon: Shield,
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    group: 'Approvativa',
    examples: ['Certificati di conformità', 'Collaudi', 'Certificazioni qualità']
  },

  // Documentazione Amministrativa
  {
    id: 'contracts',
    label: 'Contratti',
    description: 'Contratti con fornitori e consulenti',
    icon: Building,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    group: 'Amministrativa',
    examples: ['Contratti appalto', 'Contratti consulenza', 'Subappalti']
  },
  {
    id: 'specifications',
    label: 'Capitolati',
    description: 'Capitolati d\'appalto e specifiche',
    icon: Building,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    group: 'Amministrativa',
    examples: ['Capitolato generale', 'Capitolato speciale', 'Computo metrico']
  },
  {
    id: 'site_minutes',
    label: 'Verbali Cantiere',
    description: 'Verbali di cantiere e riunioni',
    icon: Building,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    group: 'Amministrativa',
    examples: ['Verbali riunioni', 'Registro presenze', 'Comunicazioni cantiere']
  },
  {
    id: 'official_comms',
    label: 'Comunicazioni Ufficiali',
    description: 'Comunicazioni ufficiali con enti',
    icon: Building,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    group: 'Amministrativa',
    examples: ['PEC', 'Raccomandate', 'Notifiche enti']
  },
  {
    id: 'correspondence',
    label: 'Corrispondenza',
    description: 'Corrispondenza generale del progetto',
    icon: Building,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    group: 'Amministrativa',
    examples: ['Email', 'Lettere', 'Comunicazioni informali']
  },

  // Documentazione Finanziaria
  {
    id: 'quotes_offers',
    label: 'Preventivi e Offerte',
    description: 'Preventivi ricevuti e offerte',
    icon: Euro,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    group: 'Finanziaria',
    examples: ['Preventivi fornitori', 'Offerte tecniche', 'Proposte commerciali']
  },
  {
    id: 'invoices',
    label: 'Fatture',
    description: 'Fatture e documenti fiscali',
    icon: Euro,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    group: 'Finanziaria',
    examples: ['Fatture', 'Ricevute', 'Documenti fiscali']
  },
  {
    id: 'progress_reports',
    label: 'SAL',
    description: 'Stati Avanzamento Lavori',
    icon: Euro,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    group: 'Finanziaria',
    examples: ['SAL mensili', 'Misurazioni', 'Contabilità lavori']
  },
  {
    id: 'payment_certs',
    label: 'Certificati Pagamento',
    description: 'Certificati di pagamento',
    icon: Euro,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    group: 'Finanziaria',
    examples: ['Certificati pagamento', 'Mandati', 'Bonifici']
  },
  {
    id: 'variations',
    label: 'Varianti',
    description: 'Varianti in corso d\'opera',
    icon: Euro,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    group: 'Finanziaria',
    examples: ['Perizie varianti', 'Extra lavori', 'Modifiche progettuali']
  },

  // Documentazione di Controllo
  {
    id: 'inspection_reports',
    label: 'Verbali Sopralluogo',
    description: 'Verbali di sopralluogo e ispezioni',
    icon: Search,
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    group: 'Controllo',
    examples: ['Sopralluoghi DL', 'Ispezioni enti', 'Verifiche in corso d\'opera']
  },
  {
    id: 'quality_reports',
    label: 'Report Qualità',
    description: 'Report di controllo qualità',
    icon: Search,
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    group: 'Controllo',
    examples: ['Controlli qualità', 'Verifiche materiali', 'Audit interni']
  },
  {
    id: 'tests_approvals',
    label: 'Test e Collaudi',
    description: 'Test e collaudi delle opere',
    icon: Search,
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    group: 'Controllo',
    examples: ['Collaudi statici', 'Test impianti', 'Prove di carico']
  },
  {
    id: 'non_compliance',
    label: 'Non Conformità',
    description: 'Segnalazioni di non conformità',
    icon: Search,
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    group: 'Controllo',
    examples: ['RNC', 'Difetti rilevati', 'Anomalie costruttive']
  },
  {
    id: 'corrective_actions',
    label: 'Azioni Correttive',
    description: 'Azioni correttive e migliorative',
    icon: Search,
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    group: 'Controllo',
    examples: ['Piani di rimedio', 'Azioni correttive', 'Follow-up controlli']
  },

  // Documentazione Fotografica
  {
    id: 'photos_before',
    label: 'Foto Ante Operam',
    description: 'Documentazione fotografica prima dei lavori',
    icon: Camera,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200',
    group: 'Fotografica',
    examples: ['Foto stato di fatto', 'Rilievo fotografico', 'Documentazione preesistenze']
  },
  {
    id: 'photos_during',
    label: 'Foto In Corso d\'Opera',
    description: 'Documentazione fotografica durante i lavori',
    icon: Camera,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200',
    group: 'Fotografica',
    examples: ['Progress lavori', 'Fasi costruttive', 'Avanzamento cantiere']
  },
  {
    id: 'photos_after',
    label: 'Foto Post Operam',
    description: 'Documentazione fotografica dopo i lavori',
    icon: Camera,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200',
    group: 'Fotografica',
    examples: ['Opera ultimata', 'Consegna lavori', 'Risultato finale']
  },
  {
    id: 'photos_progress',
    label: 'Foto per SAL',
    description: 'Documentazione fotografica per stati avanzamento',
    icon: Camera,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200',
    group: 'Fotografica',
    examples: ['SAL fotografici', 'Misurazioni visuali', 'Contabilità visiva']
  },
  {
    id: 'photos_damage',
    label: 'Foto Danni',
    description: 'Documentazione fotografica di danni o anomalie',
    icon: Camera,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200',
    group: 'Fotografica',
    examples: ['Danni preesistenti', 'Difetti riscontrati', 'Anomalie costruttive']
  },

  // Altri documenti
  {
    id: 'other',
    label: 'Altri',
    description: 'Altri documenti non categorizzati',
    icon: FolderOpen,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200',
    group: 'Altri',
    examples: ['Documenti vari', 'File temporanei', 'Bozze']
  }
];

// Raggruppa le categorie per gruppo
export const PROJECT_DOCUMENT_GROUPS = PROJECT_DOCUMENT_CATEGORIES.reduce((groups, category) => {
  const group = category.group;
  if (!groups[group]) {
    groups[group] = [];
  }
  groups[group].push(category);
  return groups;
}, {} as Record<string, ProjectDocumentCategoryConfig[]>);

// Funzioni helper
export const getCategoryConfig = (categoryId: ProjectDocumentCategory): ProjectDocumentCategoryConfig | undefined => {
  return PROJECT_DOCUMENT_CATEGORIES.find(cat => cat.id === categoryId);
};

export const getCategoryLabel = (categoryId: ProjectDocumentCategory): string => {
  const config = getCategoryConfig(categoryId);
  return config ? config.label : categoryId;
};

export const getCategoryIcon = (categoryId: ProjectDocumentCategory) => {
  const config = getCategoryConfig(categoryId);
  return config ? config.icon : FolderOpen;
};

export const getCategoryColors = (categoryId: ProjectDocumentCategory) => {
  const config = getCategoryConfig(categoryId);
  return config ? {
    color: config.color,
    bgColor: config.bgColor
  } : {
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200'
  };
};