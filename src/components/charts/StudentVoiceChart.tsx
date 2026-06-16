import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { REFERENCE_DATA } from '../../data/pisaData';

interface StudentVoiceChartProps {
  voiceScores: {
    belonging: number;
    disciplinaryClimate: number;
    feelingSafe: number;
    teacherRelation: number;
    growthMindset: number;
  };
}

export const StudentVoiceChart: React.FC<StudentVoiceChartProps> = ({ voiceScores }) => {
  const { theme } = useTheme();
  const [chartType, setChartType] = useState<'bar' | 'radar'>('bar');

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#94A3B8' : '#475569';
  const gridColor = isDark ? '#334155' : '#E2E8F0';

  const voiceData = [
    {
      name: 'Belonging',
      Score: parseFloat(voiceScores.belonging.toFixed(2)),
      OECD: REFERENCE_DATA.oecd.studentVoice.belonging
    },
    {
      name: 'Disciplinary Climate',
      Score: parseFloat(voiceScores.disciplinaryClimate.toFixed(2)),
      OECD: REFERENCE_DATA.oecd.studentVoice.disciplinaryClimate
    },
    {
      name: 'Feeling Safe',
      Score: parseFloat(voiceScores.feelingSafe.toFixed(2)),
      OECD: REFERENCE_DATA.oecd.studentVoice.feelingSafe
    },
    {
      name: 'Teacher Relation',
      Score: parseFloat(voiceScores.teacherRelation.toFixed(2)),
      OECD: REFERENCE_DATA.oecd.studentVoice.teacherRelation
    },
    {
      name: 'Growth Mindset',
      Score: parseFloat(voiceScores.growthMindset.toFixed(2)),
      OECD: REFERENCE_DATA.oecd.studentVoice.growthMindset
    }
  ];

  const allScores = voiceData.flatMap(d => [d.Score, d.OECD]);
  const minVal = Math.min(...allScores);
  const maxVal = Math.max(...allScores);
  const dynamicDomain: [number, number] = [
    minVal < -1.0 ? Math.floor(minVal) : -1.0,
    maxVal > 2.0 ? Math.ceil(maxVal) : 2.0
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Student Voice Profile (SD relative to OECD Average)
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
              chartType === 'bar'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Bar View
          </button>
          <button
            onClick={() => setChartType('radar')}
            className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
              chartType === 'radar'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Radar View
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={voiceData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
              <XAxis type="number" domain={[-2.5, 2.5]} stroke={axisColor} />
              <YAxis dataKey="name" type="category" stroke={axisColor} width={120} style={{ fontSize: '11px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
              <ReferenceLine x={0} stroke={isDark ? '#64748B' : '#94A3B8'} strokeWidth={1.5} />
              
              <Bar dataKey="Score" name="Estimated Index" radius={[0, 4, 4, 0]} barSize={15}>
                {voiceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.Score >= 0 ? '#10B981' : '#EF4444'} // Green if positive, Red if negative
                  />
                ))}
              </Bar>
              <Bar dataKey="OECD" name="OECD Baseline" fill="#9CA3AF" barSize={10} radius={[0, 2, 2, 0]} />
            </BarChart>
          ) : (
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={voiceData}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="name" stroke={axisColor} style={{ fontSize: '10px' }} />
              <PolarRadiusAxis angle={30} domain={dynamicDomain} stroke={axisColor} style={{ fontSize: '10px' }} />
              <Radar name="Estimated Index" dataKey="Score" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
              <Radar name="OECD Baseline" dataKey="OECD" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.2} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
