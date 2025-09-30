import { useState, useEffect, useCallback } from 'react';
import { TaskEnhanced, STORAGE_KEYS, TaskType, TaskPriority } from '@/types';

interface UseTasksEnhancedReturn {
  tasks: TaskEnhanced[];
  loading: boolean;
  error: string | null;

  // CRUD Operations
  addTask: (task: Omit<TaskEnhanced, 'id'>) => Promise<TaskEnhanced>;
  updateTask: (id: string, updates: Partial<TaskEnhanced>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => TaskEnhanced | undefined;

  // Filter Operations
  getTasksByPhase: (phaseId: string) => TaskEnhanced[];
  getTasksByProject: (projectId: string, projectPhases: { id: string }[]) => TaskEnhanced[];
  getTasksByAssignee: (assignee: string) => TaskEnhanced[];
  getTasksByStatus: (status: TaskEnhanced['status']) => TaskEnhanced[];
  getTasksByPriority: (priority: TaskPriority) => TaskEnhanced[];
  getTasksByType: (type: TaskType) => TaskEnhanced[];
  getOverdueTasks: () => TaskEnhanced[];
  getTasksDueToday: () => TaskEnhanced[];
  getTasksDueSoon: (days?: number) => TaskEnhanced[];
  getBlockedTasks: () => TaskEnhanced[];
  getDependentTasks: (taskId: string) => TaskEnhanced[];

  // Status Operations
  startTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  pauseTask: (id: string) => Promise<void>;
  approveTask: (id: string, approvedBy: string) => Promise<void>;
  rejectTask: (id: string, reason: string) => Promise<void>;

  // Progress Operations
  updateProgress: (id: string, percentage: number) => Promise<void>;
  logTime: (id: string, hours: number) => Promise<void>;

  // Checklist Operations
  addChecklistItem: (taskId: string, description: string) => Promise<void>;
  toggleChecklistItem: (taskId: string, itemId: string, completed: boolean, completedBy?: string) => Promise<void>;
  removeChecklistItem: (taskId: string, itemId: string) => Promise<void>;

  // Dependency Operations
  addDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
  removeDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
  canStartTask: (taskId: string) => boolean;

  // Utility
  refreshTasks: () => void;
}

export function useTasksEnhanced(): UseTasksEnhancedReturn {
  const [tasks, setTasks] = useState<TaskEnhanced[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from localStorage
  const loadTasks = useCallback(() => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS_ENHANCED);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTasks(parsed);
      } else {
        setTasks([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save tasks to localStorage
  const saveTasks = useCallback((tasksToSave: TaskEnhanced[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS_ENHANCED, JSON.stringify(tasksToSave));
      setTasks(tasksToSave);
    } catch (err) {
      setError('Failed to save tasks');
      console.error('Error saving tasks:', err);
      throw err;
    }
  }, []);

  // Initialize
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Generate unique ID
  const generateId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add task
  const addTask = useCallback(async (taskData: Omit<TaskEnhanced, 'id'>) => {
    const newTask: TaskEnhanced = {
      ...taskData,
      id: generateId(),
    };

    const updated = [...tasks, newTask];
    saveTasks(updated);
    return newTask;
  }, [tasks, saveTasks]);

  // Update task
  const updateTask = useCallback(async (id: string, updates: Partial<TaskEnhanced>) => {
    const updated = tasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    );
    saveTasks(updated);
  }, [tasks, saveTasks]);

  // Delete task
  const deleteTask = useCallback(async (id: string) => {
    const updated = tasks.filter(task => task.id !== id);
    saveTasks(updated);
  }, [tasks, saveTasks]);

  // Get single task
  const getTask = useCallback((id: string) => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  // Filter by phase
  const getTasksByPhase = useCallback((phaseId: string) => {
    return tasks.filter(task => task.phaseId === phaseId);
  }, [tasks]);

  // Filter by project (attraverso le fasi)
  const getTasksByProject = useCallback((projectId: string, projectPhases: { id: string }[]) => {
    const phaseIds = projectPhases.map(p => p.id);
    return tasks.filter(task => phaseIds.includes(task.phaseId));
  }, [tasks]);

  // Filter by assignee
  const getTasksByAssignee = useCallback((assignee: string) => {
    return tasks.filter(task => task.assignee === assignee);
  }, [tasks]);

  // Filter by status
  const getTasksByStatus = useCallback((status: TaskEnhanced['status']) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  // Filter by priority
  const getTasksByPriority = useCallback((priority: TaskPriority) => {
    return tasks.filter(task => task.priority === priority);
  }, [tasks]);

  // Filter by type
  const getTasksByType = useCallback((type: TaskType) => {
    return tasks.filter(task => task.type === type);
  }, [tasks]);

  // Get overdue tasks
  const getOverdueTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task =>
      task.status !== 'completed' &&
      task.dueDate &&
      task.dueDate < today
    );
  }, [tasks]);

  // Get tasks due today
  const getTasksDueToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task =>
      task.status !== 'completed' &&
      task.dueDate === today
    );
  }, [tasks]);

  // Get tasks due soon
  const getTasksDueSoon = useCallback((days: number = 7) => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    return tasks.filter(task =>
      task.status !== 'completed' &&
      task.dueDate &&
      task.dueDate >= todayStr &&
      task.dueDate <= futureDateStr
    ).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  }, [tasks]);

  // Get blocked tasks
  const getBlockedTasks = useCallback(() => {
    return tasks.filter(task => task.blockedBy && task.blockedBy.length > 0);
  }, [tasks]);

  // Get dependent tasks (tasks che dipendono da questo)
  const getDependentTasks = useCallback((taskId: string) => {
    return tasks.filter(task =>
      task.dependencies && task.dependencies.includes(taskId)
    );
  }, [tasks]);

  // Start task
  const startTask = useCallback(async (id: string) => {
    await updateTask(id, { status: 'in_progress' });
  }, [updateTask]);

  // Complete task
  const completeTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        progressPercentage: 100,
        remainingHours: 0,
      });
    }
  }, [tasks, updateTask]);

  // Pause task
  const pauseTask = useCallback(async (id: string) => {
    await updateTask(id, { status: 'todo' });
  }, [updateTask]);

  // Approve task
  const approveTask = useCallback(async (id: string, approvedBy: string) => {
    await updateTask(id, {
      status: 'completed',
      approvedBy,
      approvedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
  }, [updateTask]);

  // Reject task
  const rejectTask = useCallback(async (id: string, reason: string) => {
    await updateTask(id, {
      status: 'review',
      rejectionReason: reason,
    });
  }, [updateTask]);

  // Update progress
  const updateProgress = useCallback(async (id: string, percentage: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const remaining = task.estimatedHours * (1 - percentage / 100);
      await updateTask(id, {
        progressPercentage: percentage,
        remainingHours: remaining,
      });
    }
  }, [tasks, updateTask]);

  // Log time
  const logTime = useCallback(async (id: string, hours: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const newActualHours = (task.actualHours || 0) + hours;
      const remaining = Math.max(0, task.estimatedHours - newActualHours);
      const progress = Math.min(100, (newActualHours / task.estimatedHours) * 100);

      await updateTask(id, {
        actualHours: newActualHours,
        remainingHours: remaining,
        progressPercentage: progress,
      });
    }
  }, [tasks, updateTask]);

  // Add checklist item
  const addChecklistItem = useCallback(async (taskId: string, description: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newItem = {
        id: `check-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description,
        completed: false,
      };
      const updatedChecklist = [...(task.checklist || []), newItem];
      await updateTask(taskId, { checklist: updatedChecklist });
    }
  }, [tasks, updateTask]);

  // Toggle checklist item
  const toggleChecklistItem = useCallback(async (
    taskId: string,
    itemId: string,
    completed: boolean,
    completedBy?: string
  ) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.checklist) {
      const updatedChecklist = task.checklist.map(item =>
        item.id === itemId
          ? {
              ...item,
              completed,
              completedBy,
              completedAt: completed ? new Date().toISOString() : undefined,
            }
          : item
      );
      await updateTask(taskId, { checklist: updatedChecklist });
    }
  }, [tasks, updateTask]);

  // Remove checklist item
  const removeChecklistItem = useCallback(async (taskId: string, itemId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.checklist) {
      const updatedChecklist = task.checklist.filter(item => item.id !== itemId);
      await updateTask(taskId, { checklist: updatedChecklist });
    }
  }, [tasks, updateTask]);

  // Add dependency
  const addDependency = useCallback(async (taskId: string, dependsOnTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const dependencies = [...(task.dependencies || []), dependsOnTaskId];
      await updateTask(taskId, { dependencies });
    }
  }, [tasks, updateTask]);

  // Remove dependency
  const removeDependency = useCallback(async (taskId: string, dependsOnTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.dependencies) {
      const dependencies = task.dependencies.filter(id => id !== dependsOnTaskId);
      await updateTask(taskId, { dependencies });
    }
  }, [tasks, updateTask]);

  // Can start task (check dependencies)
  const canStartTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    // Check if all dependencies are completed
    return task.dependencies.every(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && depTask.status === 'completed';
    });
  }, [tasks]);

  // Refresh
  const refreshTasks = useCallback(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    getTask,
    getTasksByPhase,
    getTasksByProject,
    getTasksByAssignee,
    getTasksByStatus,
    getTasksByPriority,
    getTasksByType,
    getOverdueTasks,
    getTasksDueToday,
    getTasksDueSoon,
    getBlockedTasks,
    getDependentTasks,
    startTask,
    completeTask,
    pauseTask,
    approveTask,
    rejectTask,
    updateProgress,
    logTime,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    addDependency,
    removeDependency,
    canStartTask,
    refreshTasks,
  };
}