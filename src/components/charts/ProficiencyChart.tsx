import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { BRANCHES_DATA } from '../../data/pisaData';

type Subject = 'reading' | 'math' | 'science';

export const ProficiencyChart: React.FC = () => {
  const { theme } = useTheme();
  const [activeSubject, setActiveSubject] = useState<Subject>('reading');

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#94A3B8' : '#475569';
  const gridColor = isDark ? '#334155' : '#E2E8F0';

  // Normalize percentages so they sum to exactly 100%
  const getNormalizedData = (subject: Subject) => {
    return BRANCHES_DATA.map((b) => {
      const { low, med, high } = b.proficiencyLevels[subject];
      const sum = low + med + high;
      
      const normLow = parseFloat(((low / sum) * 100).toFixed(1));
      const normMed = parseFloat(((med / sum) * 100).toFixed(1));
      const normHigh = parseFloat((100 - normLow - normMed).toFixed(1));

      return {
        name: b.name,
        Low: normLow,
        Medium: normMed,
        High: normHigh,
        rawLow: low,
        rawMed: med,
        rawHigh: high
      };
    });
  };

  const chartData = getNormalizedData(activeSubject);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Proficiency Distribution (Low / Medium / High)
        </span>
        <div className="flex gap-2">
          {(['reading', 'math', 'science'] as const).map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
                activeSubject === sub
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {sub.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" stroke={axisColor} />
            <YAxis dataKey="name" type="category" stroke={axisColor} width={110} style={{ fontSize: '11px' }} />
            <Tooltip
              formatter={(value) => `${value}%`}
              contentStyle={{
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                color: isDark ? '#F8FAFC' : '#0F172A',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            
            <Bar dataKey="Low" stackId="a" fill="#EF4444" name="Low Proficiency" />
            <Bar dataKey="Medium" stackId="a" fill="#FBBF24" name="Medium Proficiency" />
            <Bar dataKey="High" stackId="a" fill="#10B981" name="High Proficiency" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
