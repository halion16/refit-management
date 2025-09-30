'use client';

import { useState, useMemo } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { useNotifications } from '@/hooks/useNotifications';
import { TeamMember } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  Users,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  X,
  Search,
  Sparkles,
} from 'lucide-react';

interface SmartTaskAssignmentProps {
  taskTitle?: string;
  taskDescription?: string;
  requiredSkills?: string[];
  estimatedHours?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  onAssign?: (memberId: string) => void;
  onCancel?: () => void;
}

export function SmartTaskAssignment({
  taskTitle = 'Nuovo Task',
  taskDescription,
  requiredSkills = [],
  estimatedHours = 0,
  priority = 'medium',
  onAssign,
  onCancel,
}: SmartTaskAssignmentProps) {
  const { members, getAvailableMembers } = useTeam();
  const { addNotification } = useNotifications();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Smart member recommendation algorithm
  const recommendedMembers = useMemo(() => {
    let availableMembers = getAvailableMembers(requiredSkills);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      availableMembers = availableMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.skills.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Score and sort members
    return availableMembers
      .map((member) => {
        let score = 0;

        // 1. Skill match (0-40 points)
        if (requiredSkills.length > 0) {
          const matchingSkills = member.skills.filter((skill) =>
            requiredSkills.some((req) =>
              skill.toLowerCase().includes(req.toLowerCase())
            )
          );
          score += (matchingSkills.length / requiredSkills.length) * 40;
        } else {
          score += 20; // No specific skills required
        }

        // 2. Availability (0-30 points)
        const utilizationScore = 100 - member.workload.utilizationRate;
        score += (utilizationScore / 100) * 30;

        // 3. Performance (0-20 points)
        const performanceScore = member.performance.onTimeCompletion;
        score += (performanceScore / 100) * 20;

        // 4. Experience (0-10 points)
        const experienceScore = Math.min(
          member.performance.tasksCompleted / 10,
          1
        );
        score += experienceScore * 10;

        // Calculate if member can handle the task
        const wouldBeOverloaded = estimatedHours > 0
          ? ((member.workload.totalHours + estimatedHours) /
              member.availability.hoursPerWeek) *
              100 >
            90
          : false;

        return {
          member,
          score: Math.round(score),
          wouldBeOverloaded,
          matchingSkills: member.skills.filter((skill) =>
            requiredSkills.some((req) =>
              skill.toLowerCase().includes(req.toLowerCase())
            )
          ),
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [members, requiredSkills, estimatedHours, searchQuery, getAvailableMembers]);

  const handleAssign = async () => {
    if (!selectedMember) return;

    const member = members.find((m) => m.id === selectedMember);
    if (!member) return;

    // Create notification for assigned member
    await addNotification({
      type: 'task_assigned',
      priority: priority,
      title: 'Nuovo task assegnato',
      message: `Ti è stato assegnato il task: ${taskTitle}`,
      metadata: {
        userId: member.id,
      },
    });

    if (onAssign) {
      onAssign(selectedMember);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Ottimo Match';
    if (score >= 60) return 'Buon Match';
    if (score >= 40) return 'Match Discreto';
    return 'Match Basso';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Smart Task Assignment
                </h2>
              </div>
              <p className="text-gray-600 mt-1">
                Suggerimenti intelligenti basati su competenze, disponibilità e performance
              </p>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Task Info */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">{taskTitle}</h3>
            {taskDescription && (
              <p className="text-sm text-gray-600 mb-2">{taskDescription}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              {estimatedHours > 0 && (
                <div className="flex items-center gap-1 text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span>{estimatedHours}h stimate</span>
                </div>
              )}
              {requiredSkills.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">Competenze:</span>
                  <div className="flex flex-wrap gap-1">
                    {requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per nome, email o competenza..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4">
          {recommendedMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Nessun membro disponibile trovato
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedMembers.map(({ member, score, wouldBeOverloaded, matchingSkills }) => (
                <div
                  key={member.id}
                  onClick={() => !wouldBeOverloaded && setSelectedMember(member.id)}
                  className={`
                    p-4 border-2 rounded-lg transition-all cursor-pointer
                    ${wouldBeOverloaded ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:shadow-md'}
                    ${selectedMember === member.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {member.name}
                        </h4>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(score)}`}>
                          {score}/100 - {getScoreLabel(score)}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <div className="text-gray-500 text-xs">Utilizzo</div>
                          <div className="font-semibold text-gray-900">
                            {member.workload.utilizationRate}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Completamento</div>
                          <div className="font-semibold text-gray-900">
                            {member.performance.onTimeCompletion}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Task Completati</div>
                          <div className="font-semibold text-gray-900">
                            {member.performance.tasksCompleted}
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      {matchingSkills.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-gray-500 mb-1">Competenze matching:</div>
                          <div className="flex flex-wrap gap-1">
                            {matchingSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium"
                              >
                                ✓ {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Warning */}
                      {wouldBeOverloaded && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                          <Clock className="h-4 w-4" />
                          <span>Questo task causerebbe un sovraccarico</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-600">
            {selectedMember && (
              <span className="font-medium text-gray-900">
                Membro selezionato: {members.find(m => m.id === selectedMember)?.name}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Annulla
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={!selectedMember}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Assegna Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
