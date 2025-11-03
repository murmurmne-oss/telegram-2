import { ReactNode } from 'react';
import { IconType } from 'react-icons';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  gradient: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  gradient
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            change.trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.trend === 'up' ? '↑' : '↓'}
            {Math.abs(change.value)}%
          </div>
        )}
      </div>

      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
