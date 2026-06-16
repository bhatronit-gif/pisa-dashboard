import React, { useState } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { REFERENCE_DATA, COLOR_MAP } from '../../data/pisaData';

interface CognitiveChartProps {
  simulatedScores: { reading: number; math: number; science: number };
  baselineScores: { reading: number; math: number; science: number };
  branchColor: string;
}

export const CognitiveChart: React.FC<CognitiveChartProps> = ({
  simulatedScores,
  baselineScores,
  branchColor
}) => {
  const { theme } = useTheme();
  const [showBaseline, setShowBaseline] = useState(true);

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#94A3B8' : '#475569'; // slate-400 vs slate-600
  const gridColor = isDark ? '#334155' : '#E2E8F0'; // slate-700 vs slate-200

  const data = [
    {
      subject: 'Reading',
      Simulated: Math.round(simulatedScores.reading),
      Baseline: Math.round(baselineScores.reading),
      OECD: REFERENCE_DATA.oecd.cognitiveScores.reading,
      Singapore: REFERENCE_DATA.singapore.cognitiveScores.reading,
    },
    {
      subject: 'Mathematics',
      Simulated: Math.round(simulatedScores.math),
      Baseline: Math.round(baselineScores.math),
      OECD: REFERENCE_DATA.oecd.cognitiveScores.math,
      Singapore: REFERENCE_DATA.singapore.cognitiveScores.math,
    },
    {
      subject: 'Science',
      Simulated: Math.round(simulatedScores.science),
      Baseline: Math.round(baselineScores.science),
      OECD: REFERENCE_DATA.oecd.cognitiveScores.science,
      Singapore: REFERENCE_DATA.singapore.cognitiveScores.science,
    }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Cognitive Performance vs Benchmarks
        </span>
        <button
          onClick={() => setShowBaseline(!showBaseline)}
          className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
            showBaseline
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {showBaseline ? 'Hide Baseline Dots' : 'Show Baseline Dots'}
        </button>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="subject" stroke={axisColor} />
            <YAxis domain={[300, 700]} stroke={axisColor} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                color: isDark ? '#F8FAFC' : '#0F172A',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            
            {/* Bars for Simulated (Current Active) Scores and Global Benchmarks */}
            <Bar dataKey="Simulated" fill={branchColor} name="Estimated / Current Score" radius={[4, 4, 0, 0]} barSize={35} />
            <Bar dataKey="OECD" fill={COLOR_MAP.oecd} name="OECD Average" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="Singapore" fill={COLOR_MAP.singapore} name="Singapore Benchmark" radius={[4, 4, 0, 0]} barSize={20} />
            
            {/* Scatter dots representing original baselines */}
            {showBaseline && (
              <Scatter
                dataKey="Baseline"
                fill={isDark ? '#FBBF24' : '#B45309'}
                stroke={isDark ? '#78350F' : '#78350F'}
                strokeWidth={1}
                name="Baseline Score"
                shape="circle"
                legendType="circle"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
