'use client';

import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Project, ProjectPhase } from '@/types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  Plus
} from 'lucide-react';

export function Calendar() {
  const { data: projects } = useProjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'timeline'>('timeline');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['planning', 'approved', 'in_progress']);

  // Helper functions for date manipulation
  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const addMonths = (date: Date, months: number) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Filter projects based on selected statuses and current view period
  const filteredProjects = useMemo(() => {
    const monthStart = getMonthStart(currentDate);
    const monthEnd = getMonthEnd(currentDate);

    return projects.filter(project => {
      // Filter by status
      if (!selectedStatuses.includes(project.status)) return false;

      // Filter by date range - projects that overlap with current month
      const projectStart = new Date(project.dates.startPlanned);
      const projectEnd = new Date(project.dates.endPlanned);

      return projectStart <= monthEnd && projectEnd >= monthStart;
    });
  }, [projects, selectedStatuses, currentDate]);

  // Get status configuration
  const getStatusConfig = (status: Project['status']) => {
    const configs = {
      planning: { label: 'Pianificazione', color: 'bg-blue-100 text-blue-800', icon: Clock },
      approved: { label: 'Approvato', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      in_progress: { label: 'In Corso', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      on_hold: { label: 'In Pausa', color: 'bg-gray-100 text-gray-800', icon: Pause },
      completed: { label: 'Completato', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
      cancelled: { label: 'Annullato', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };
    return configs[status];
  };

  // Calculate project progress
  const calculateProgress = (project: Project) => {
    if (project.phases.length === 0) return 0;
    const completedPhases = project.phases.filter(phase => phase.status === 'completed').length;
    return Math.round((completedPhases / project.phases.length) * 100);
  };

  // Get project duration in days
  const getProjectDuration = (project: Project) => {
    const start = new Date(project.dates.startPlanned);
    const end = new Date(project.dates.endPlanned);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Generate calendar grid for month view
  const generateCalendarDays = () => {
    const monthStart = getMonthStart(currentDate);
    const monthEnd = getMonthEnd(currentDate);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);

    // Go to the start of the week
    startDate.setDate(startDate.getDate() - startDate.getDay());
    // Go to the end of the week
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    const currentDay = new Date(startDate);

    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  // Get projects for a specific day
  const getProjectsForDay = (day: Date) => {
    return filteredProjects.filter(project => {
      const projectStart = new Date(project.dates.startPlanned);
      const projectEnd = new Date(project.dates.endPlanned);

      // Reset time to compare only dates
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);

      return projectStart <= dayEnd && projectEnd >= dayStart;
    });
  };

  // Check if day is in current month
  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth();
  };

  // Check if day is today
  const isToday = (day: Date) => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
  };

  // Month view component
  const MonthView = () => {
    const calendarDays = generateCalendarDays();
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Week headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayProjects = getProjectsForDay(day);
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-100 ${
                  !isCurrentMonthDay ? 'bg-gray-50' : 'bg-white'
                } ${isTodayDay ? 'bg-blue-50' : ''}`}
              >
                {/* Day number */}
                <div className={`text-sm font-medium mb-1 ${
                  !isCurrentMonthDay ? 'text-gray-400' :
                  isTodayDay ? 'text-blue-600 font-bold' : 'text-gray-900'
                }`}>
                  {day.getDate()}
                  {isTodayDay && (
                    <span className="ml-1 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>

                {/* Projects for this day */}
                <div className="space-y-1">
                  {dayProjects.slice(0, 3).map(project => {
                    const statusConfig = getStatusConfig(project.status);
                    return (
                      <div
                        key={project.id}
                        className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${statusConfig.color}`}
                        title={`${project.name} - ${statusConfig.label}`}
                      >
                        {project.name}
                      </div>
                    );
                  })}
                  {dayProjects.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayProjects.length - 3} altri
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Timeline view component
  const TimelineView = () => {
    return (
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun progetto nel periodo</h3>
            <p className="text-gray-500">Non ci sono progetti attivi per il mese selezionato.</p>
          </div>
        ) : (
          filteredProjects.map(project => {
            const statusConfig = getStatusConfig(project.status);
            const IconComponent = statusConfig.icon;
            const progress = calculateProgress(project);
            const duration = getProjectDuration(project);

            return (
              <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusConfig.color}`}>
                        <IconComponent className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      €{project.budget.planned.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{duration} giorni</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>Inizio: {formatDate(project.dates.startPlanned)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>Fine: {formatDate(project.dates.endPlanned)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Progresso: {progress}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Avanzamento</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Phases */}
                {project.phases.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Fasi ({project.phases.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {project.phases.map(phase => {
                        const phaseStatusConfig = {
                          pending: 'bg-gray-100 text-gray-600',
                          in_progress: 'bg-yellow-100 text-yellow-700',
                          completed: 'bg-green-100 text-green-700',
                          blocked: 'bg-red-100 text-red-700'
                        };

                        return (
                          <div key={phase.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                            <span className="font-medium truncate">{phase.name}</span>
                            <span className={`px-2 py-1 rounded ${phaseStatusConfig[phase.status]}`}>
                              {phase.status === 'pending' && 'In attesa'}
                              {phase.status === 'in_progress' && 'In corso'}
                              {phase.status === 'completed' && 'Completata'}
                              {phase.status === 'blocked' && 'Bloccata'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Calendario Progetti</h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, -1))}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
              {formatMonthYear(currentDate)}
            </h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="ml-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Oggi
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Vista:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('timeline')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  view === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Mese
              </button>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtra per stato:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'planning', label: 'Pianificazione', color: 'bg-blue-100 text-blue-800' },
              { value: 'approved', label: 'Approvato', color: 'bg-green-100 text-green-800' },
              { value: 'in_progress', label: 'In Corso', color: 'bg-yellow-100 text-yellow-800' },
              { value: 'on_hold', label: 'In Pausa', color: 'bg-gray-100 text-gray-800' },
              { value: 'completed', label: 'Completato', color: 'bg-emerald-100 text-emerald-800' },
              { value: 'cancelled', label: 'Annullato', color: 'bg-red-100 text-red-800' }
            ].map(status => (
              <button
                key={status.value}
                onClick={() => {
                  if (selectedStatuses.includes(status.value)) {
                    setSelectedStatuses(selectedStatuses.filter(s => s !== status.value));
                  } else {
                    setSelectedStatuses([...selectedStatuses, status.value]);
                  }
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedStatuses.includes(status.value)
                    ? status.color + ' ring-2 ring-blue-500 ring-opacity-50'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{filteredProjects.length}</div>
          <div className="text-sm text-gray-600">Progetti Attivi</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {filteredProjects.filter(p => p.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-600">In Corso</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {filteredProjects.reduce((sum, p) => sum + p.phases.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Fasi Totali</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            €{filteredProjects.reduce((sum, p) => sum + p.budget.planned, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Budget Totale</div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${view === 'month' ? '' : 'bg-white rounded-lg border border-gray-200 p-6'}`}>
        {view === 'timeline' && <TimelineView />}
        {view === 'month' && <MonthView />}
      </div>
    </div>
  );
}