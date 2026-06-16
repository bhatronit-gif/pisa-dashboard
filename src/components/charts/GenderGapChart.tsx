import React, { useState } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { BRANCHES_DATA, COLOR_MAP } from '../../data/pisaData';

type Subject = 'reading' | 'math' | 'science';

export const GenderGapChart: React.FC = () => {
  const { theme } = useTheme();
  const [activeSubject, setActiveSubject] = useState<Subject>('reading');

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#94A3B8' : '#475569';
  const gridColor = isDark ? '#334155' : '#E2E8F0';

  // Dynamically load gender scores for each subject from BRANCHES_DATA
  const dataMap: Record<Subject, Array<{ name: string; boys: number; girls: number; range: [number, number] }>> = {
    reading: BRANCHES_DATA.map((branch) => {
      const { boys, girls } = branch.genderScores.reading;
      return {
        name: branch.name,
        boys,
        girls,
        range: [Math.min(boys, girls), Math.max(boys, girls)]
      };
    }),
    math: BRANCHES_DATA.map((branch) => {
      const { boys, girls } = branch.genderScores.math;
      return {
        name: branch.name,
        boys,
        girls,
        range: [Math.min(boys, girls), Math.max(boys, girls)]
      };
    }),
    science: BRANCHES_DATA.map((branch) => {
      const { boys, girls } = branch.genderScores.science;
      return {
        name: branch.name,
        boys,
        girls,
        range: [Math.min(boys, girls), Math.max(boys, girls)]
      };
    })
  };

  // Custom Shape renderer to draw a thin connecting line
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomBar = (props: any) => {
    const { x, y, width, height } = props;
    // We draw a thin line vertically centered within the category band
    return (
      <rect
        x={x}
        y={y + height / 2 - 1.5}
        width={width}
        height={3}
        fill={isDark ? '#475569' : '#CBD5E1'}
        rx={1.5}
      />
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomDumbbellTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const gapVal = Math.abs(data.girls - data.boys);
      const higherGroup = data.girls > data.boys ? 'Girls' : 'Boys';
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-md text-xs">
          <p className="font-bold text-slate-800 dark:text-white mb-1.5">{data.name}</p>
          <p className="text-pink-500 font-medium flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-pink-500" />
            Girls Average: {data.girls}
          </p>
          <p className="text-blue-500 font-medium flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Boys Average: {data.boys}
          </p>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold border-t border-slate-100 dark:border-slate-800 mt-2 pt-1.5">
            Gap: {gapVal} pts ({higherGroup} leading)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Gender Performance Gap (Boys vs Girls)
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
          <ComposedChart
            data={dataMap[activeSubject]}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis type="number" domain={[430, 530]} stroke={axisColor} />
            <YAxis dataKey="name" type="category" stroke={axisColor} width={110} style={{ fontSize: '11px' }} />
            
            <Tooltip content={<CustomDumbbellTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            
            {/* Connecting line (rendered as a thin floating bar) */}
            <Bar dataKey="range" shape={<CustomBar />} name="Gap Range" fill="#9CA3AF" />
            
            {/* Endpoint markers */}
            <Scatter dataKey="girls" fill={COLOR_MAP.girls} name="Girls Avg" shape="circle" />
            <Scatter dataKey="boys" fill={COLOR_MAP.boys} name="Boys Avg" shape="circle" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
