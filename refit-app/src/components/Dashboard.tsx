'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  FolderOpen,
  Users,
  Euro,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useProjects, useLocations, useContractors, useQuotes } from '@/hooks/useLocalStorage';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useSetCurrentView } from '@/store';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'orange' | 'red';
  onClick?: () => void;
}

function StatCard({ title, value, icon, trend, color, onClick }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    orange: 'bg-orange-500 text-white',
    red: 'bg-red-500 text-white'
  };

  const bgColorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200'
  };

  return (
    <div
      className={`p-6 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${bgColorClasses[color]}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
              {trend.value}% vs mese scorso
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface RecentActivityItem {
  id: string;
  type: 'project' | 'quote' | 'completion';
  title: string;
  subtitle: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

function RecentActivityCard() {
  const recentActivity: RecentActivityItem[] = [
    {
      id: '1',
      type: 'project',
      title: 'Nuovo progetto creato',
      subtitle: 'Progetto Milano Corso Buenos Aires',
      timestamp: new Date().toISOString(),
      status: 'info'
    },
    {
      id: '2',
      type: 'quote',
      title: 'Preventivo ricevuto',
      subtitle: 'Ditta Rossi Costruzioni - €45.000',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'success'
    },
    {
      id: '3',
      type: 'completion',
      title: 'Fase completata',
      subtitle: 'Demolizione Roma Prati - 100%',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'success'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Attività Recente</h3>
      <div className="space-y-4">
        {recentActivity.map((item) => (
          <div key={item.id} className="flex items-start space-x-3">
            {getStatusIcon(item.status)}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-600">{item.subtitle}</p>
              <p className="text-xs text-gray-500 mt-1">{formatDate(item.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
      <Button variant="ghost" className="w-full mt-4">
        Vedi tutte le attività
      </Button>
    </div>
  );
}

function UpcomingTasksCard() {
  const upcomingTasks = [
    {
      id: '1',
      title: 'Revisione preventivo Milano Centro',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high' as const
    },
    {
      id: '2',
      title: 'Sopralluogo Roma Prati',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium' as const
    },
    {
      id: '3',
      title: 'Approvazione documenti Napoli Centro',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'low' as const
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Prossime Scadenze</h3>
      <div className="space-y-4">
        {upcomingTasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{task.title}</p>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(task.dueDate)}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Bassa'}
            </span>
          </div>
        ))}
      </div>
      <Button variant="ghost" className="w-full mt-4">
        Vedi tutte le scadenze
      </Button>
    </div>
  );
}

export function Dashboard() {
  const { data: projects } = useProjects();
  const { data: locations } = useLocations();
  const { data: contractors } = useContractors();
  const { data: quotes } = useQuotes();
  const setCurrentView = useSetCurrentView();

  const activeProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const activeContractors = contractors.filter(c => c.status === 'active');
  const pendingQuotes = quotes.filter(q => ['sent', 'received', 'under_review'].includes(q.status));

  const totalBudget = projects.reduce((sum, p) => sum + p.budget.planned, 0);
  const spentBudget = projects.reduce((sum, p) => sum + p.budget.spent, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Panoramica generale dei tuoi progetti refit</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Locations"
          value={locations.length}
          icon={<Building2 className="h-6 w-6" />}
          color="blue"
          onClick={() => setCurrentView('locations')}
        />
        <StatCard
          title="Progetti Attivi"
          value={activeProjects.length}
          icon={<FolderOpen className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
          color="green"
          onClick={() => setCurrentView('projects')}
        />
        <StatCard
          title="Fornitori Attivi"
          value={activeContractors.length}
          icon={<Users className="h-6 w-6" />}
          color="orange"
          onClick={() => setCurrentView('contractors')}
        />
        <StatCard
          title="Preventivi in Sospeso"
          value={pendingQuotes.length}
          icon={<Euro className="h-6 w-6" />}
          color="red"
          onClick={() => setCurrentView('quotes')}
        />
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Totale</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Pianificato</span>
                <span>{formatCurrency(totalBudget)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Speso</span>
                <span>{formatCurrency(spentBudget)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Rimanente</span>
                <span className="text-green-600">{formatCurrency(totalBudget - spentBudget)}</span>
              </div>
            </div>
          </div>
        </div>

        <RecentActivityCard />
        <UpcomingTasksCard />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentView('projects')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <FolderOpen className="h-6 w-6 mb-2" />
            <span>Nuovo Progetto</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentView('locations')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <Building2 className="h-6 w-6 mb-2" />
            <span>Nuova Location</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentView('contractors')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <Users className="h-6 w-6 mb-2" />
            <span>Nuovo Fornitore</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentView('quotes')}
            className="flex flex-col items-center p-4 h-auto"
          >
            <Euro className="h-6 w-6 mb-2" />
            <span>Richiedi Preventivo</span>
          </Button>
        </div>
      </div>
    </div>
  );
}