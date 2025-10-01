import { useMemo, useCallback } from 'react';
import {
  startOfDay,
  endOfDay,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  differenceInDays,
  isAfter,
  isBefore,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import type {
  TeamMetrics,
  MemberMetrics,
  ProjectMetrics,
  BudgetMetrics,
  ProductivityMetrics,
  DateRangeFilter,
  DateRangePreset,
  KPIMetric,
} from '@/types';
import { useTasksEnhanced } from './useTasksEnhanced';
import { useProjects } from './useProjects';
import { useTeam } from './useTeam';

/**
 * Analytics hook for calculating metrics and KPIs
 */
export function useAnalytics() {
  const { tasks } = useTasksEnhanced();
  const { data: projects = [] } = useProjects();
  const { members } = useTeam();

  /**
   * Get date range from preset
   */
  const getDateRangeFromPreset = useCallback((preset: DateRangePreset): DateRangeFilter => {
    const now = new Date();
    const endDate = endOfDay(now);
    let startDate: Date;

    switch (preset) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = startOfDay(subDays(now, 7));
        break;
      case 'month':
        startDate = startOfDay(subMonths(now, 1));
        break;
      case 'quarter':
        startDate = startOfDay(subQuarters(now, 1));
        break;
      case 'year':
        startDate = startOfDay(subYears(now, 1));
        break;
      default:
        startDate = startOfDay(subMonths(now, 1)); // default to last month
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      preset,
    };
  }, []);

  /**
   * Filter tasks by date range
   */
  const filterTasksByDate = useCallback((dateRange: DateRangeFilter) => {
    const start = parseISO(dateRange.startDate);
    const end = parseISO(dateRange.endDate);

    return tasks.filter((task) => {
      const taskDate = parseISO(task.createdAt);
      return isWithinInterval(taskDate, { start, end });
    });
  }, [tasks]);

  /**
   * Calculate team metrics
   */
  const getTeamMetrics = useCallback((dateRange?: DateRangeFilter): TeamMetrics => {
    const tasksToAnalyze = dateRange ? filterTasksByDate(dateRange) : tasks;

    const completedTasks = tasksToAnalyze.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasksToAnalyze.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasksToAnalyze.filter(t => t.status === 'pending').length;

    const overdueTasks = tasksToAnalyze.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = parseISO(t.dueDate);
      return isAfter(new Date(), dueDate) && t.status !== 'completed';
    }).length;

    const tasksWithDueDate = tasksToAnalyze.filter(t => t.dueDate && t.status === 'completed');
    const onTimeTasks = tasksWithDueDate.filter(t => {
      if (!t.dueDate || !t.updatedAt) return false;
      const dueDate = parseISO(t.dueDate);
      const completedDate = parseISO(t.updatedAt);
      return isBefore(completedDate, dueDate) || completedDate.getTime() === dueDate.getTime();
    }).length;

    const onTimeRate = tasksWithDueDate.length > 0
      ? (onTimeTasks / tasksWithDueDate.length) * 100
      : 0;

    const totalHoursLogged = tasksToAnalyze.reduce((sum, t) => sum + (t.actualHours || 0), 0);
    const totalHoursEstimated = tasksToAnalyze.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

    const activeMembers = members.filter(m => m.status === 'active').length;
    const averageUtilization = activeMembers > 0
      ? members.filter(m => m.status === 'active').reduce((sum, m) => sum + (m.workload.currentUtilization || 0), 0) / activeMembers
      : 0;

    return {
      totalTasks: tasksToAnalyze.length,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      onTimeRate: Math.round(onTimeRate),
      averageUtilization: Math.round(averageUtilization),
      activeMembers,
      totalMembers: members.length,
      totalHoursLogged,
      totalHoursEstimated,
    };
  }, [tasks, members, filterTasksByDate]);

  /**
   * Calculate member metrics
   */
  const getMemberMetrics = useCallback((memberId: string, dateRange?: DateRangeFilter): MemberMetrics | null => {
    const member = members.find(m => m.id === memberId);
    if (!member) return null;

    const tasksToAnalyze = dateRange ? filterTasksByDate(dateRange) : tasks;
    const memberTasks = tasksToAnalyze.filter(t => t.assignedTo?.includes(memberId));

    const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
    const tasksWithDueDate = memberTasks.filter(t => t.dueDate && t.status === 'completed');

    const onTimeTasks = tasksWithDueDate.filter(t => {
      if (!t.dueDate || !t.updatedAt) return false;
      const dueDate = parseISO(t.dueDate);
      const completedDate = parseISO(t.updatedAt);
      return isBefore(completedDate, dueDate);
    }).length;

    const onTimeRate = tasksWithDueDate.length > 0
      ? (onTimeTasks / tasksWithDueDate.length) * 100
      : 0;

    const hoursLogged = memberTasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

    // Productivity: tasks per day
    const daysDiff = dateRange
      ? differenceInDays(parseISO(dateRange.endDate), parseISO(dateRange.startDate)) || 1
      : 30; // default to 30 days
    const productivity = completedTasks / daysDiff;

    return {
      memberId: member.id,
      memberName: member.name,
      tasksAssigned: memberTasks.length,
      tasksCompleted: completedTasks,
      tasksOnTime: onTimeTasks,
      onTimeRate: Math.round(onTimeRate),
      utilization: member.workload.currentUtilization || 0,
      hoursLogged,
      productivity: Math.round(productivity * 10) / 10, // round to 1 decimal
    };
  }, [members, tasks, filterTasksByDate]);

  /**
   * Get all members metrics
   */
  const getAllMembersMetrics = useCallback((dateRange?: DateRangeFilter): MemberMetrics[] => {
    return members
      .map(m => getMemberMetrics(m.id, dateRange))
      .filter((m): m is MemberMetrics => m !== null)
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted);
  }, [members, getMemberMetrics]);

  /**
   * Calculate project metrics
   */
  const getProjectMetrics = useCallback((projectId: string): ProjectMetrics | null => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const progress = projectTasks.length > 0
      ? (completedTasks / projectTasks.length) * 100
      : 0;

    const budgetSpent = project.budget.spent;
    const budgetApproved = project.budget.approved;
    const budgetRemaining = budgetApproved - budgetSpent;
    const budgetUtilization = budgetApproved > 0
      ? (budgetSpent / budgetApproved) * 100
      : 0;

    const startDate = parseISO(project.dates.startPlanned);
    const endDate = parseISO(project.dates.endPlanned);
    const now = new Date();

    const daysTotal = differenceInDays(endDate, startDate);
    const daysElapsed = differenceInDays(now, startDate);
    const daysRemaining = differenceInDays(endDate, now);

    const scheduleProgress = daysTotal > 0
      ? (daysElapsed / daysTotal) * 100
      : 0;

    const onSchedule = progress >= scheduleProgress;

    // Phase metrics
    const phaseMetrics = project.phases.map(phase => {
      const phaseTasks = projectTasks.filter(t => t.phaseId === phase.id);
      const phaseCompleted = phaseTasks.filter(t => t.status === 'completed').length;
      const phaseProgress = phaseTasks.length > 0
        ? (phaseCompleted / phaseTasks.length) * 100
        : 0;

      let status: 'pending' | 'in_progress' | 'completed' | 'delayed' = 'pending';
      if (phaseProgress === 100) status = 'completed';
      else if (phaseProgress > 0) {
        // Check if delayed
        const phaseEndDate = parseISO(phase.endDate);
        if (isAfter(now, phaseEndDate)) status = 'delayed';
        else status = 'in_progress';
      }

      return {
        id: phase.id,
        name: phase.name,
        progress: Math.round(phaseProgress),
        tasksCompleted: phaseCompleted,
        tasksTotal: phaseTasks.length,
        status,
      };
    });

    return {
      id: project.id,
      name: project.name,
      progress: Math.round(progress),
      budgetSpent,
      budgetApproved,
      budgetRemaining,
      budgetUtilization: Math.round(budgetUtilization),
      daysElapsed: Math.max(0, daysElapsed),
      daysRemaining: Math.max(0, daysRemaining),
      daysTotal,
      scheduleProgress: Math.round(scheduleProgress),
      tasksCompleted: completedTasks,
      tasksTotal: projectTasks.length,
      onSchedule,
      phases: phaseMetrics,
    };
  }, [projects, tasks]);

  /**
   * Get all projects metrics
   */
  const getAllProjectsMetrics = useCallback((): ProjectMetrics[] => {
    return projects
      .map(p => getProjectMetrics(p.id))
      .filter((p): p is ProjectMetrics => p !== null);
  }, [projects, getProjectMetrics]);

  /**
   * Calculate budget metrics
   */
  const getBudgetMetrics = useCallback((): BudgetMetrics => {
    const totalApproved = projects.reduce((sum, p) => sum + p.budget.approved, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.budget.spent, 0);
    const totalRemaining = totalApproved - totalSpent;
    const utilizationRate = totalApproved > 0
      ? (totalSpent / totalApproved) * 100
      : 0;

    const byProject = projects.map(p => ({
      projectId: p.id,
      projectName: p.name,
      approved: p.budget.approved,
      spent: p.budget.spent,
      remaining: p.budget.approved - p.budget.spent,
    }));

    // Group by category (simplified - using project names as categories)
    const byCategory = projects.map(p => ({
      category: p.name,
      amount: p.budget.spent,
      percentage: totalSpent > 0 ? (p.budget.spent / totalSpent) * 100 : 0,
    }));

    return {
      totalApproved,
      totalSpent,
      totalRemaining,
      utilizationRate: Math.round(utilizationRate),
      byProject,
      byCategory,
    };
  }, [projects]);

  /**
   * Calculate productivity metrics
   */
  const getProductivityMetrics = useCallback((dateRange?: DateRangeFilter): ProductivityMetrics => {
    const tasksToAnalyze = dateRange ? filterTasksByDate(dateRange) : tasks;
    const completedTasks = tasksToAnalyze.filter(t => t.status === 'completed');

    const daysDiff = dateRange
      ? differenceInDays(parseISO(dateRange.endDate), parseISO(dateRange.startDate)) || 1
      : 30;

    const tasksCompletedPerDay = completedTasks.length / daysDiff;

    const tasksWithEstimates = completedTasks.filter(t => t.estimatedHours && t.actualHours);
    const averageTaskDuration = tasksWithEstimates.length > 0
      ? tasksWithEstimates.reduce((sum, t) => sum + (t.actualHours || 0), 0) / tasksWithEstimates.length
      : 0;

    // Response time (simplified - time from creation to first update)
    const averageResponseTime = 24; // Placeholder

    const topPerformers = getAllMembersMetrics(dateRange).slice(0, 5);

    return {
      tasksCompletedPerDay: Math.round(tasksCompletedPerDay * 10) / 10,
      averageTaskDuration: Math.round(averageTaskDuration * 10) / 10,
      averageResponseTime,
      peakProductivityHours: ['09:00', '10:00', '14:00', '15:00'], // Placeholder
      topPerformers,
    };
  }, [tasks, filterTasksByDate, getAllMembersMetrics]);

  /**
   * Generate KPI metrics for dashboard
   */
  const getKPIMetrics = useCallback((dateRange?: DateRangeFilter): KPIMetric[] => {
    const teamMetrics = getTeamMetrics(dateRange);
    const budgetMetrics = getBudgetMetrics();
    const projectsMetrics = getAllProjectsMetrics();

    const activeProjects = projectsMetrics.filter(p => p.progress > 0 && p.progress < 100).length;

    return [
      {
        id: 'total-tasks',
        label: 'Total Tasks',
        value: teamMetrics.totalTasks,
        icon: 'list',
        color: 'blue',
      },
      {
        id: 'completed-tasks',
        label: 'Completed',
        value: teamMetrics.completedTasks,
        unit: 'tasks',
        trend: 'up',
        icon: 'check',
        color: 'green',
      },
      {
        id: 'on-time-rate',
        label: 'On-Time Rate',
        value: teamMetrics.onTimeRate,
        unit: '%',
        trend: teamMetrics.onTimeRate > 80 ? 'up' : 'down',
        icon: 'clock',
        color: teamMetrics.onTimeRate > 80 ? 'green' : 'yellow',
      },
      {
        id: 'team-utilization',
        label: 'Team Utilization',
        value: teamMetrics.averageUtilization,
        unit: '%',
        trend: teamMetrics.averageUtilization > 70 ? 'up' : 'neutral',
        icon: 'users',
        color: 'purple',
      },
      {
        id: 'active-projects',
        label: 'Active Projects',
        value: activeProjects,
        icon: 'folder',
        color: 'indigo',
      },
      {
        id: 'budget-spent',
        label: 'Budget Spent',
        value: `€${(budgetMetrics.totalSpent / 1000).toFixed(1)}K`,
        comparison: `${budgetMetrics.utilizationRate}% of total`,
        icon: 'euro',
        color: budgetMetrics.utilizationRate > 90 ? 'red' : 'blue',
      },
    ];
  }, [getTeamMetrics, getBudgetMetrics, getAllProjectsMetrics]);

  return {
    // Date utilities
    getDateRangeFromPreset,
    filterTasksByDate,

    // Metrics calculators
    getTeamMetrics,
    getMemberMetrics,
    getAllMembersMetrics,
    getProjectMetrics,
    getAllProjectsMetrics,
    getBudgetMetrics,
    getProductivityMetrics,
    getKPIMetrics,
  };
}
