'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Filter, GripVertical, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TaskEnhanced, TaskStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { TaskForm } from './TaskForm';
import { useTasksEnhanced } from '@/hooks/useTasksEnhanced';
import { useProjects } from '@/hooks/useProjects';

const statusColumns: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Da Fare', color: 'bg-gray-100 border-gray-300' },
  { status: 'in_progress', label: 'In Corso', color: 'bg-blue-100 border-blue-300' },
  { status: 'under_review', label: 'In Revisione', color: 'bg-purple-100 border-purple-300' },
  { status: 'completed', label: 'Completato', color: 'bg-green-100 border-green-300' },
  { status: 'on_hold', label: 'In Attesa', color: 'bg-yellow-100 border-yellow-300' },
];

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-yellow-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500',
};

const priorityLabels = {
  low: 'Bassa',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

export function TaskBoard() {
  const {
    tasks,
    loading,
    addTask,
    updateTask,
  } = useTasksEnhanced();

  const { data: projects = [] } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [draggedTask, setDraggedTask] = useState<TaskEnhanced | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskEnhanced | undefined>();

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by project
    if (filterProject !== 'all') {
      filtered = filtered.filter(task => task.projectId === filterProject);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tasks, searchQuery, filterProject, filterPriority]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const groups: Record<TaskStatus, TaskEnhanced[]> = {
      pending: [],
      in_progress: [],
      under_review: [],
      completed: [],
      on_hold: [],
      blocked: [],
      cancelled: [],
    };

    filteredTasks.forEach(task => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    });

    return groups;
  }, [filteredTasks]);

  const handleDragStart = (task: TaskEnhanced) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: TaskStatus) => {
    if (!draggedTask) return;

    if (draggedTask.status !== status) {
      await updateTask(draggedTask.id, { status });
    }

    setDraggedTask(null);
  };

  const getTaskProgress = (task: TaskEnhanced) => {
    if (task.checklist && task.checklist.length > 0) {
      const completed = task.checklist.filter(item => item.completed).length;
      return Math.round((completed / task.checklist.length) * 100);
    }
    return task.progressPercentage;
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Caricamento task...</div>
      </div>
    );
  }

  const handleSave = async (taskData: Omit<TaskEnhanced, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await addTask(taskData);
    }
    setShowForm(false);
    setEditingTask(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
          <p className="text-gray-600 mt-1">
            {filteredTasks.length} task in totale
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingTask(undefined);
            setShowForm(true);
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuovo Task
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filtri</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca task..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Project Filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutti i progetti</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tutte le priorità</option>
            <option value="low">Bassa</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
        {statusColumns.map(({ status, label, color }) => (
          <div
            key={status}
            className={`rounded-lg border-2 ${color} min-h-[500px]`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(status)}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{label}</h3>
                <span className="text-sm font-medium text-gray-600 bg-white rounded-full px-2 py-0.5">
                  {tasksByStatus[status].length}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-2 space-y-2">
              {tasksByStatus[status].length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Nessun task
                </div>
              ) : (
                tasksByStatus[status].map(task => {
                  const progress = getTaskProgress(task);
                  const overdue = isOverdue(task.dueDate);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onClick={() => {
                        setEditingTask(task);
                        setShowForm(true);
                      }}
                      className={`bg-white rounded-lg border-l-4 ${priorityColors[task.priority]} p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                    >
                      {/* Priority Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {priorityLabels[task.priority]}
                        </span>
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>

                      {/* Task Title */}
                      <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Task Description */}
                      {task.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Progress Bar */}
                      {progress > 0 && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progresso</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Task Metadata */}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {task.dueDate && (
                          <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}>
                            <Clock className="h-3 w-3" />
                            {formatDate(task.dueDate)}
                          </span>
                        )}

                        {task.estimatedHours && (
                          <span className="flex items-center gap-1">
                            ⏱️ {task.estimatedHours}h
                          </span>
                        )}

                        {overdue && (
                          <AlertCircle className="h-3 w-3 text-red-600" />
                        )}

                        {task.checklist && task.checklist.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{task.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(undefined);
          }}
        />
      )}
    </div>
  );
}