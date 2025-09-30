import { useState, useEffect, useCallback, useMemo } from 'react';
import { TeamMember, TeamMemberRole, TeamMemberStatus, TEAM_STORAGE_KEYS } from '@/types';

interface UseTeamReturn {
  members: TeamMember[];
  loading: boolean;
  error: string | null;

  // CRUD Operations
  addMember: (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TeamMember>;
  updateMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  getMember: (id: string) => TeamMember | undefined;

  // Filter Operations
  getMembersByRole: (role: TeamMemberRole) => TeamMember[];
  getMembersByStatus: (status: TeamMemberStatus) => TeamMember[];
  getMembersBySkill: (skill: string) => TeamMember[];
  getAvailableMembers: (requiredSkills?: string[]) => TeamMember[];
  getMembersByDepartment: (department: string) => TeamMember[];

  // Workload Operations
  updateWorkload: (memberId: string, tasksDelta: number, hoursDelta: number) => Promise<void>;
  getTeamWorkload: () => {
    total: number;
    average: number;
    overloaded: TeamMember[];
    underutilized: TeamMember[];
  };
  getMemberUtilization: (memberId: string) => number;

  // Performance Operations
  updatePerformance: (memberId: string, taskCompleted: boolean, onTime: boolean) => Promise<void>;
  getTopPerformers: (limit?: number) => TeamMember[];

  // Search & Filter
  searchMembers: (query: string) => TeamMember[];
  filterMembers: (filters: {
    role?: TeamMemberRole;
    status?: TeamMemberStatus;
    skills?: string[];
    department?: string;
    minUtilization?: number;
    maxUtilization?: number;
  }) => TeamMember[];

  // Utility
  refreshMembers: () => void;
  getTotalMembers: () => number;
  getActiveMembers: () => TeamMember[];
}

export function useTeam(): UseTeamReturn {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load members from localStorage
  const loadMembers = useCallback(() => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(TEAM_STORAGE_KEYS.MEMBERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMembers(parsed);
      } else {
        setMembers([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load team members');
      console.error('Error loading team members:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save members to localStorage
  const saveMembers = useCallback((membersToSave: TeamMember[]) => {
    try {
      localStorage.setItem(TEAM_STORAGE_KEYS.MEMBERS, JSON.stringify(membersToSave));
      setMembers(membersToSave);
    } catch (err) {
      setError('Failed to save team members');
      console.error('Error saving team members:', err);
      throw err;
    }
  }, []);

  // Initialize
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Generate unique ID
  const generateId = () => `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add member
  const addMember = useCallback(async (memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!memberData.name?.trim()) {
      throw new Error('Il nome del membro è obbligatorio');
    }
    if (!memberData.email?.trim()) {
      throw new Error('L\'email del membro è obbligatoria');
    }

    // Check for duplicate email
    if (members.some(m => m.email.toLowerCase() === memberData.email.toLowerCase())) {
      throw new Error('Esiste già un membro con questa email');
    }

    const now = new Date().toISOString();
    const newMember: TeamMember = {
      ...memberData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    const updated = [...members, newMember];
    saveMembers(updated);
    return newMember;
  }, [members, saveMembers]);

  // Update member
  const updateMember = useCallback(async (id: string, updates: Partial<TeamMember>) => {
    const updated = members.map(member =>
      member.id === id
        ? { ...member, ...updates, updatedAt: new Date().toISOString() }
        : member
    );
    saveMembers(updated);
  }, [members, saveMembers]);

  // Delete member
  const deleteMember = useCallback(async (id: string) => {
    const updated = members.filter(member => member.id !== id);
    saveMembers(updated);
  }, [members, saveMembers]);

  // Get single member
  const getMember = useCallback((id: string) => {
    return members.find(member => member.id === id);
  }, [members]);

  // Filter by role
  const getMembersByRole = useCallback((role: TeamMemberRole) => {
    return members.filter(member => member.role === role);
  }, [members]);

  // Filter by status
  const getMembersByStatus = useCallback((status: TeamMemberStatus) => {
    return members.filter(member => member.status === status);
  }, [members]);

  // Filter by skill
  const getMembersBySkill = useCallback((skill: string) => {
    return members.filter(member =>
      member.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );
  }, [members]);

  // Get available members
  const getAvailableMembers = useCallback((requiredSkills?: string[]) => {
    let available = members.filter(m => m.status === 'active');

    if (requiredSkills && requiredSkills.length > 0) {
      available = available.filter(member =>
        requiredSkills.some(skill =>
          member.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }

    // Sort by utilization (prefer less utilized members)
    return available.sort((a, b) => a.workload.utilizationRate - b.workload.utilizationRate);
  }, [members]);

  // Filter by department
  const getMembersByDepartment = useCallback((department: string) => {
    return members.filter(member => member.department === department);
  }, [members]);

  // Update workload
  const updateWorkload = useCallback(async (memberId: string, tasksDelta: number, hoursDelta: number) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const newTotalTasks = Math.max(0, member.workload.currentTasks + tasksDelta);
    const newTotalHours = Math.max(0, member.workload.totalHours + hoursDelta);
    const utilizationRate = (newTotalHours / member.availability.hoursPerWeek) * 100;

    await updateMember(memberId, {
      workload: {
        currentTasks: newTotalTasks,
        totalHours: newTotalHours,
        utilizationRate: Math.min(100, Math.round(utilizationRate)),
      },
    });
  }, [members, updateMember]);

  // Get team workload
  const getTeamWorkload = useCallback(() => {
    const totalHours = members.reduce((sum, m) => sum + m.workload.totalHours, 0);
    const average = members.length > 0 ? totalHours / members.length : 0;

    const overloaded = members.filter(m => m.workload.utilizationRate > 90);
    const underutilized = members.filter(m => m.workload.utilizationRate < 50 && m.status === 'active');

    return {
      total: totalHours,
      average: Math.round(average),
      overloaded,
      underutilized,
    };
  }, [members]);

  // Get member utilization
  const getMemberUtilization = useCallback((memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.workload.utilizationRate : 0;
  }, [members]);

  // Update performance
  const updatePerformance = useCallback(async (memberId: string, taskCompleted: boolean, onTime: boolean) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const newTasksCompleted = member.performance.tasksCompleted + (taskCompleted ? 1 : 0);
    const totalTasks = newTasksCompleted;
    const onTimeCount = Math.round((member.performance.onTimeCompletion / 100) * member.performance.tasksCompleted);
    const newOnTimeCount = onTimeCount + (onTime ? 1 : 0);
    const newOnTimeCompletion = totalTasks > 0 ? (newOnTimeCount / totalTasks) * 100 : 0;

    await updateMember(memberId, {
      performance: {
        ...member.performance,
        tasksCompleted: newTasksCompleted,
        onTimeCompletion: Math.round(newOnTimeCompletion),
      },
    });
  }, [members, updateMember]);

  // Get top performers
  const getTopPerformers = useCallback((limit: number = 5) => {
    return [...members]
      .filter(m => m.performance.tasksCompleted > 0)
      .sort((a, b) => {
        // Sort by completion rate, then by average rating
        if (b.performance.onTimeCompletion !== a.performance.onTimeCompletion) {
          return b.performance.onTimeCompletion - a.performance.onTimeCompletion;
        }
        return b.performance.averageRating - a.performance.averageRating;
      })
      .slice(0, limit);
  }, [members]);

  // Search members
  const searchMembers = useCallback((query: string) => {
    if (!query.trim()) return members;

    const lowerQuery = query.toLowerCase();
    return members.filter(member =>
      member.name.toLowerCase().includes(lowerQuery) ||
      member.email.toLowerCase().includes(lowerQuery) ||
      member.department?.toLowerCase().includes(lowerQuery) ||
      member.skills.some(s => s.toLowerCase().includes(lowerQuery))
    );
  }, [members]);

  // Filter members
  const filterMembers = useCallback((filters: {
    role?: TeamMemberRole;
    status?: TeamMemberStatus;
    skills?: string[];
    department?: string;
    minUtilization?: number;
    maxUtilization?: number;
  }) => {
    let filtered = members;

    if (filters.role) {
      filtered = filtered.filter(m => m.role === filters.role);
    }

    if (filters.status) {
      filtered = filtered.filter(m => m.status === filters.status);
    }

    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(member =>
        filters.skills!.some(skill =>
          member.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }

    if (filters.department) {
      filtered = filtered.filter(m => m.department === filters.department);
    }

    if (filters.minUtilization !== undefined) {
      filtered = filtered.filter(m => m.workload.utilizationRate >= filters.minUtilization!);
    }

    if (filters.maxUtilization !== undefined) {
      filtered = filtered.filter(m => m.workload.utilizationRate <= filters.maxUtilization!);
    }

    return filtered;
  }, [members]);

  // Refresh
  const refreshMembers = useCallback(() => {
    loadMembers();
  }, [loadMembers]);

  // Get total members
  const getTotalMembers = useCallback(() => {
    return members.length;
  }, [members]);

  // Get active members
  const getActiveMembers = useCallback(() => {
    return members.filter(m => m.status === 'active');
  }, [members]);

  return {
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    getMember,
    getMembersByRole,
    getMembersByStatus,
    getMembersBySkill,
    getAvailableMembers,
    getMembersByDepartment,
    updateWorkload,
    getTeamWorkload,
    getMemberUtilization,
    updatePerformance,
    getTopPerformers,
    searchMembers,
    filterMembers,
    refreshMembers,
    getTotalMembers,
    getActiveMembers,
  };
}
