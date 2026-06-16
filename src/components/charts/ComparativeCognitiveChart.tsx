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
import { BRANCHES_DATA, REFERENCE_DATA, COLOR_MAP } from '../../data/pisaData';

export const ComparativeCognitiveChart: React.FC = () => {
  const { theme } = useTheme();

  // State to track visibility of each data series (toggled via Legend click)
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    BRANCHES_DATA.forEach((branch) => {
      initial[branch.name] = true;
    });
    initial['OECD Average'] = true;
    initial['Singapore'] = true;
    return initial;
  });

  const isDark = theme === 'dark';
  const axisColor = isDark ? '#94A3B8' : '#475569';
  const gridColor = isDark ? '#334155' : '#E2E8F0';

  // Dynamically build data from BRANCHES_DATA and REFERENCE_DATA
  const subjects: Array<{ key: 'reading' | 'math' | 'science'; label: string }> = [
    { key: 'reading', label: 'Reading' },
    { key: 'math', label: 'Math' },
    { key: 'science', label: 'Science' }
  ];

  const data = subjects.map((subj) => {
    const item: Record<string, number | string> = { subject: subj.label };
    
    // Add branch scores
    BRANCHES_DATA.forEach((branch) => {
      item[branch.name] = branch.cognitiveScores[subj.key];
    });

    // Add reference benchmark scores
    item['OECD Average'] = REFERENCE_DATA.oecd.cognitiveScores[subj.key];
    item['Singapore'] = REFERENCE_DATA.singapore.cognitiveScores[subj.key];

    return item;
  });



  const hasVisibleSeries = Object.values(visibleKeys).some(Boolean);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[320px] relative">
        {!hasVisibleSeries && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 z-10 rounded-lg pointer-events-none">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Select at least one branch/benchmark in the legend to display data
            </span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="subject" stroke={axisColor} />
            <YAxis domain={[300, 600]} stroke={axisColor} />
            <Tooltip
              isAnimationActive={false}
              allowEscapeViewBox={{ x: false, y: false }}
              contentStyle={{
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                color: isDark ? '#F8FAFC' : '#0F172A',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend
              content={(props) => {
                const { payload } = props;
                if (!payload) return null;
                return (
                  <ul className="recharts-default-legend" style={{ padding: '0px', margin: '0px', textAlign: 'center' }}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {payload.map((entry: any, index: number) => {
                      const key = entry.dataKey;
                      const isVisible = visibleKeys[key];
                      return (
                        <li
                          key={`item-${index}`}
                          className="recharts-legend-item"
                          style={{
                            display: 'inline-block',
                            marginRight: '10px',
                            cursor: 'pointer',
                            opacity: isVisible ? 1 : 0.35,
                            fontSize: '11px',
                            userSelect: 'none'
                          }}
                          onClick={() => {
                            setVisibleKeys((prev) => ({
                              ...prev,
                              [key]: !prev[key]
                            }));
                          }}
                        >
                          <span
                            className="recharts-legend-icon"
                            style={{
                              display: 'inline-block',
                              width: '10px',
                              height: '10px',
                              backgroundColor: entry.color,
                              marginRight: '4px',
                              borderRadius: '2px'
                            }}
                          />
                          <span className="recharts-legend-item-text" style={{ color: isDark ? '#94A3B8' : '#475569' }}>
                            {entry.value}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }}
              wrapperStyle={{ fontSize: '11px', cursor: 'pointer', paddingTop: '10px' }}
            />
            
            {BRANCHES_DATA.map((branch) => {
              // Retrieve corresponding color from COLOR_MAP
              // map shortName (e.g. 'Thakur', 'Malad', 'Ashok Nagar') to lower case key (e.g. 'thakur', 'malad', 'ashok')
              const nameLower = branch.shortName.toLowerCase().split(' ')[0];
              const color = COLOR_MAP[nameLower as keyof typeof COLOR_MAP] || COLOR_MAP.cags;
              
              return (
                <Bar
                  key={branch.name}
                  dataKey={branch.name}
                  fill={color}
                  name={branch.name}
                  radius={[4, 4, 0, 0]}
                  hide={!visibleKeys[branch.name]}
                />
              );
            })}
            
            <Bar dataKey="OECD Average" fill={COLOR_MAP.oecd} name="OECD Average" radius={[4, 4, 0, 0]} hide={!visibleKeys['OECD Average']} />
            <Bar dataKey="Singapore" fill={COLOR_MAP.singapore} name="Singapore Benchmark" radius={[4, 4, 0, 0]} hide={!visibleKeys['Singapore']} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
