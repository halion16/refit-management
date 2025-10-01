'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, Calendar } from 'lucide-react';
import { KPICard } from './KPICard';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { DateRangePreset } from '@/types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function AnalyticsDashboard() {
  const [datePreset, setDatePreset] = useState<DateRangePreset>('month');

  const {
    getDateRangeFromPreset,
    getKPIMetrics,
    getTeamMetrics,
    getAllMembersMetrics,
    getAllProjectsMetrics,
    getBudgetMetrics,
  } = useAnalytics();

  const dateRange = useMemo(() => getDateRangeFromPreset(datePreset), [datePreset, getDateRangeFromPreset]);
  const kpiMetrics = useMemo(() => getKPIMetrics(dateRange), [dateRange, getKPIMetrics]);
  const teamMetrics = useMemo(() => getTeamMetrics(dateRange), [dateRange, getTeamMetrics]);
  const membersMetrics = useMemo(() => getAllMembersMetrics(dateRange), [dateRange, getAllMembersMetrics]);
  const projectsMetrics = useMemo(() => getAllProjectsMetrics(), [getAllProjectsMetrics]);
  const budgetMetrics = useMemo(() => getBudgetMetrics(), [getBudgetMetrics]);

  // Team performance data
  const teamPerformanceData = membersMetrics.slice(0, 5).map(m => ({
    name: m.memberName.split(' ')[0],
    tasks: m.tasksCompleted,
    onTime: m.tasksOnTime,
  }));

  // Project progress data
  const projectProgressData = projectsMetrics.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    progress: p.progress,
    color: p.progress > 80 ? '#10b981' : p.progress > 50 ? '#f59e0b' : '#ef4444',
  }));

  // Budget data
  const budgetData = budgetMetrics.byProject.map((p, i) => ({
    name: p.projectName.length > 12 ? p.projectName.substring(0, 12) + '...' : p.projectName,
    value: p.spent,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Performance metrics and insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as DateRangePreset)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 3 months</option>
              <option value="year">Last year</option>
            </select>
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiMetrics.map((metric) => (
          <KPICard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Team Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" fill="#3b82f6" name="Total Tasks" />
              <Bar dataKey="onTime" fill="#10b981" name="On Time" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Distribution Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Budget Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `€${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Project Progress
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projectProgressData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="progress" fill="#3b82f6">
              {projectProgressData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Task Completion Rate</h4>
          <div className="text-3xl font-bold text-blue-900">
            {teamMetrics.totalTasks > 0 ? Math.round((teamMetrics.completedTasks / teamMetrics.totalTasks) * 100) : 0}%
          </div>
          <p className="text-sm text-blue-700 mt-1">
            {teamMetrics.completedTasks} of {teamMetrics.totalTasks} tasks
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
          <h4 className="text-sm font-medium text-green-700 mb-2">Budget Utilization</h4>
          <div className="text-3xl font-bold text-green-900">
            {budgetMetrics.utilizationRate}%
          </div>
          <p className="text-sm text-green-700 mt-1">
            €{budgetMetrics.totalSpent.toLocaleString()} spent
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200">
          <h4 className="text-sm font-medium text-purple-700 mb-2">Team Utilization</h4>
          <div className="text-3xl font-bold text-purple-900">
            {teamMetrics.averageUtilization}%
          </div>
          <p className="text-sm text-purple-700 mt-1">
            {teamMetrics.activeMembers} active members
          </p>
        </div>
      </div>
    </div>
  );
}
