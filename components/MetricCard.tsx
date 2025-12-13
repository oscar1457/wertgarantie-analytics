import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, trendDirection, subtitle, icon, active }) => {
  return (
    <div className={`p-2 rounded-xl transition-all duration-300 h-full flex flex-col justify-between ${
        active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm hover:shadow-md'
    }`}>
      <div className="flex justify-between items-start mb-1">
        <div className={`p-1.5 rounded-lg ${
            active
            ? 'bg-white/20'
            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
        }`}>
          {icon || <HelpCircle size={14} />}
        </div>
        {trend && (
          <div className={`flex items-center text-[10px] font-semibold ${
            active ? 'text-white' :
            trendDirection === 'up' ? 'text-green-500' :
            trendDirection === 'down' ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'
          }`}>
            {trend}
            {trendDirection === 'up' && <ArrowUpRight size={10} className="ml-0.5" />}
            {trendDirection === 'down' && <ArrowDownRight size={10} className="ml-0.5" />}
            {trendDirection === 'neutral' && <Minus size={10} className="ml-0.5" />}
          </div>
        )}
      </div>
      <div>
        <h3 className={`text-[10px] font-medium mb-0.5 ${active ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{title}</h3>
        <div className="text-lg font-bold tracking-tight">{value}</div>
        {subtitle && <p className={`text-[9px] mt-0.5 ${active ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>{subtitle}</p>}
      </div>
    </div>
  );
};
