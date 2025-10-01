'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPIMetric } from '@/types';
import { cn } from '@/lib/utils';

interface KPICardProps {
  metric: KPIMetric;
  className?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  list: '📋',
  check: '✅',
  clock: '⏰',
  users: '👥',
  folder: '📁',
  euro: '💶',
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
};

export function KPICard({ metric, className }: KPICardProps) {
  const getTrendIcon = () => {
    if (!metric.trend) return null;

    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const cardColor = metric.color ? colorMap[metric.color] || colorMap.blue : colorMap.blue;

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4 transition-all hover:shadow-md',
        cardColor,
        className
      )}
    >
      {/* Header with icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{metric.icon ? iconMap[metric.icon] : '📊'}</span>
        {getTrendIcon()}
      </div>

      {/* Label */}
      <div className="text-sm font-medium opacity-80 mb-1">
        {metric.label}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold">
          {metric.value}
        </span>
        {metric.unit && (
          <span className="text-lg font-medium opacity-70">
            {metric.unit}
          </span>
        )}
      </div>

      {/* Trend value or comparison */}
      {(metric.trendValue !== undefined || metric.comparison) && (
        <div className="mt-2 text-xs opacity-70">
          {metric.trendValue !== undefined && (
            <span className={metric.trend === 'up' ? 'text-green-700' : metric.trend === 'down' ? 'text-red-700' : 'text-gray-700'}>
              {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}
              {Math.abs(metric.trendValue)}%
            </span>
          )}
          {metric.comparison && (
            <span className="ml-1">
              {metric.comparison}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
