import { useEffect, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { useTeam } from './useTeam';
import { useTasksEnhanced } from './useTasksEnhanced';

/**
 * Hook for automatic notification generation
 * Monitors team workload, task deadlines, and system events
 */
export function useAutomaticNotifications() {
  const { addNotification } = useNotifications();
  const { members, getTeamWorkload } = useTeam();
  const { tasks, getTasksByStatus } = useTasksEnhanced();

  // Check for overloaded members
  const checkOverloadedMembers = useCallback(async () => {
    const teamWorkload = getTeamWorkload();

    for (const member of teamWorkload.overloaded) {
      // Check if notification already sent recently (within last 24 hours)
      const lastCheck = localStorage.getItem(`overload_notif_${member.id}`);
      const now = Date.now();

      if (lastCheck && now - parseInt(lastCheck) < 24 * 60 * 60 * 1000) {
        continue; // Skip if already notified in last 24h
      }

      await addNotification({
        type: 'system',
        priority: 'high',
        title: 'Membro sovraccarico',
        message: `${member.name} ha un carico di lavoro del ${member.workload.utilizationRate}% (${member.workload.currentTasks} task attivi). Considera di riassegnare alcuni task.`,
        metadata: {
          userId: member.id,
        },
      });

      localStorage.setItem(`overload_notif_${member.id}`, now.toString());
    }
  }, [members, getTeamWorkload, addNotification]);

  // Check for approaching deadlines
  const checkApproachingDeadlines = useCallback(async () => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const activeTasks = [
      ...getTasksByStatus('pending'),
      ...getTasksByStatus('in_progress'),
    ];

    for (const task of activeTasks) {
      if (!task.dueDate) continue;

      const dueDate = new Date(task.dueDate);

      // Check if deadline is within 3 days
      if (dueDate > now && dueDate <= threeDaysFromNow) {
        const lastCheck = localStorage.getItem(`deadline_notif_${task.id}`);
        const checkNow = Date.now();

        if (lastCheck && checkNow - parseInt(lastCheck) < 24 * 60 * 60 * 1000) {
          continue; // Skip if already notified in last 24h
        }

        const daysRemaining = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        await addNotification({
          type: 'deadline_approaching',
          priority: daysRemaining === 1 ? 'urgent' : 'high',
          title: 'Scadenza in arrivo',
          message: `Il task "${task.title}" scade ${
            daysRemaining === 1 ? 'domani' : `tra ${daysRemaining} giorni`
          }`,
          actionUrl: `/tasks/${task.id}`,
          actionLabel: 'Visualizza task',
          metadata: {
            taskId: task.id,
          },
        });

        localStorage.setItem(`deadline_notif_${task.id}`, checkNow.toString());
      }

      // Check for overdue tasks
      if (dueDate < now) {
        const lastCheck = localStorage.getItem(`overdue_notif_${task.id}`);
        const checkNow = Date.now();

        if (lastCheck && checkNow - parseInt(lastCheck) < 24 * 60 * 60 * 1000) {
          continue;
        }

        const daysOverdue = Math.ceil(
          (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        await addNotification({
          type: 'task_overdue',
          priority: 'urgent',
          title: 'Task scaduto',
          message: `Il task "${task.title}" è scaduto da ${daysOverdue} ${
            daysOverdue === 1 ? 'giorno' : 'giorni'
          }`,
          actionUrl: `/tasks/${task.id}`,
          actionLabel: 'Visualizza task',
          metadata: {
            taskId: task.id,
          },
        });

        localStorage.setItem(`overdue_notif_${task.id}`, checkNow.toString());
      }
    }
  }, [tasks, getTasksByStatus, addNotification]);

  // Check for high priority unassigned tasks
  const checkUnassignedTasks = useCallback(async () => {
    const pendingTasks = getTasksByStatus('pending');

    const unassignedHighPriority = pendingTasks.filter(
      (task) =>
        (task.priority === 'high' || task.priority === 'urgent') &&
        (!task.assignedTo || task.assignedTo.length === 0)
    );

    if (unassignedHighPriority.length > 0) {
      const lastCheck = localStorage.getItem('unassigned_tasks_notif');
      const now = Date.now();

      if (lastCheck && now - parseInt(lastCheck) < 24 * 60 * 60 * 1000) {
        return; // Skip if already notified in last 24h
      }

      await addNotification({
        type: 'system',
        priority: 'high',
        title: 'Task ad alta priorità non assegnati',
        message: `Ci sono ${unassignedHighPriority.length} task ad alta priorità in attesa di assegnazione`,
        actionUrl: '/tasks',
        actionLabel: 'Visualizza tasks',
      });

      localStorage.setItem('unassigned_tasks_notif', now.toString());
    }
  }, [tasks, getTasksByStatus, addNotification]);

  // Run checks periodically
  useEffect(() => {
    // Initial check after 5 seconds
    const initialTimeout = setTimeout(() => {
      checkOverloadedMembers();
      checkApproachingDeadlines();
      checkUnassignedTasks();
    }, 5000);

    // Then check every 30 seconds for real-time updates
    const interval = setInterval(() => {
      checkOverloadedMembers();
      checkApproachingDeadlines();
      checkUnassignedTasks();
    }, 30 * 1000); // 30 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [checkOverloadedMembers, checkApproachingDeadlines, checkUnassignedTasks]);

  return {
    checkOverloadedMembers,
    checkApproachingDeadlines,
    checkUnassignedTasks,
  };
}
