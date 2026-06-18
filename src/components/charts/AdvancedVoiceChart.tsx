import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { BranchData } from '../../data/pisaData';

interface AdvancedVoiceChartProps {
  branch: BranchData;
  voiceScores: {
    belonging: number;
    disciplinaryClimate: number;
    feelingSafe: number;
    teacherRelation: number;
    growthMindset: number;
  };
}

export const AdvancedVoiceChart: React.FC<AdvancedVoiceChartProps> = ({ branch, voiceScores }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const axisColor = isDark ? '#94A3B8' : '#475569';
  const gridColor = isDark ? '#334155' : '#E2E8F0';

  const advancedVoice = branch.advancedVoice;

  // 1. Social & Environment Index (-2.0 to 1.5 SD)
  const environmentData = [
    {
      name: 'Sense of Belonging',
      'Your School': parseFloat(voiceScores.belonging.toFixed(2)),
      'Singapore': -0.10,
      'OECD Average': -0.02
    },
    {
      name: 'Disciplinary Climate',
      'Your School': parseFloat(voiceScores.disciplinaryClimate.toFixed(2)),
      'Singapore': 0.10,
      'OECD Average': 0.02
    },
    {
      name: 'Feeling Safe',
      'Your School': parseFloat(voiceScores.feelingSafe.toFixed(2)),
      'Singapore': 0.10,
      'OECD Average': 0.00
    },
    {
      name: 'Safety at School',
      'Your School': advancedVoice ? parseFloat(advancedVoice.safetyAtSchool.toFixed(2)) : -1.40,
      'Singapore': 0.10,
      'OECD Average': 0.00
    },
    {
      name: 'Bullying Exposure',
      'Your School': advancedVoice ? parseFloat(advancedVoice.bullying.toFixed(2)) : -0.80,
      'Singapore': 0.00,
      'OECD Average': 0.00
    },
    {
      name: 'Family Support',
      'Your School': advancedVoice ? parseFloat(advancedVoice.familySupport.toFixed(2)) : 0.75,
      'Singapore': 0.00,
      'OECD Average': 0.00
    },
    {
      name: 'Teacher Relationship',
      'Your School': parseFloat(voiceScores.teacherRelation.toFixed(2)),
      'Singapore': 0.10,
      'OECD Average': 0.00
    }
  ];

  // 2. Study & Device Time (Hours)
  const timeData = [
    {
      name: 'Homework Time',
      'Your School': advancedVoice ? advancedVoice.homeworkTime : 2.10,
      'Singapore': 2.30,
      'OECD Average': 1.70
    },
    {
      name: 'Digital Device Time',
      'Your School': advancedVoice ? advancedVoice.digitalTime : 2.50,
      'Singapore': 3.10,
      'OECD Average': 3.00
    }
  ];

  // 3. Life Satisfaction (Scale 0-10)
  const satisfactionData = [
    {
      name: 'Life Satisfaction',
      'Your School': advancedVoice ? advancedVoice.lifeSatisfaction : 8.10,
      'Singapore': 6.80,
      'OECD Average': 6.60
    }
  ];

  // Theme-aware colors
  const schoolColor = '#8B5CF6'; // Violet (premium branch accent color)
  const singaporeColor = '#F43F5E'; // Coral / Rose
  const oecdColor = '#94A3B8'; // Gray

  // Custom tooltips
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-lg text-xs text-white">
          <p className="font-bold mb-1.5">{label}</p>
          {payload.map((p: pisaDataPayloadEntry, idx: number) => (
            <p key={idx} style={{ color: p.color }} className="font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}: {p.value} {unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  type pisaDataPayloadEntry = {
    color: string;
    name: string;
    value: number;
  };

  return (
    <div className="space-y-6 w-full text-slate-800 dark:text-slate-100">
      {/* Chart Section 1: Indexes */}
      <div className="bg-slate-50/50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          1. School & Social Indices (Standard Deviation from OECD)
        </h5>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={environmentData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
              <XAxis type="number" domain={[-2.0, 2.0]} stroke={axisColor} tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" stroke={axisColor} width={130} style={{ fontSize: '10px' }} />
              <Tooltip content={<CustomTooltip unit="SD" />} allowEscapeViewBox={{ x: false, y: false }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
              <ReferenceLine x={0} stroke={isDark ? '#64748B' : '#94A3B8'} strokeWidth={1.5} />
              
              <Bar dataKey="Your School" fill={schoolColor} radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="Singapore" fill={singaporeColor} radius={[0, 2, 2, 0]} barSize={8} />
              <Bar dataKey="OECD Average" fill={oecdColor} radius={[0, 2, 2, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Section 2 & 3 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Data */}
        <div className="bg-slate-50/50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            2. Time Spent (Hours per Day)
          </h5>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 4.0]} stroke={axisColor} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke={axisColor} width={110} style={{ fontSize: '10px' }} />
                <Tooltip content={<CustomTooltip unit="hrs" />} allowEscapeViewBox={{ x: false, y: false }} />
                <Bar dataKey="Your School" fill={schoolColor} radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="Singapore" fill={singaporeColor} radius={[0, 2, 2, 0]} barSize={8} />
                <Bar dataKey="OECD Average" fill={oecdColor} radius={[0, 2, 2, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Life Satisfaction */}
        <div className="bg-slate-50/50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            3. Overall Life Satisfaction (Scale 0-10)
          </h5>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={satisfactionData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={true} vertical={false} />
                <XAxis type="number" domain={[5.0, 10.0]} stroke={axisColor} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke={axisColor} width={110} style={{ fontSize: '10px' }} />
                <Tooltip content={<CustomTooltip unit="/10" />} allowEscapeViewBox={{ x: false, y: false }} />
                <Bar dataKey="Your School" fill={schoolColor} radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="Singapore" fill={singaporeColor} radius={[0, 2, 2, 0]} barSize={8} />
                <Bar dataKey="OECD Average" fill={oecdColor} radius={[0, 2, 2, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
