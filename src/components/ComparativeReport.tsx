import React from 'react';
import { ComparativeCognitiveChart } from './charts/ComparativeCognitiveChart';
import { ProficiencyChart } from './charts/ProficiencyChart';
import { GenderGapChart } from './charts/GenderGapChart';
import { BarChart3, PieChart, GitCompare, Info } from 'lucide-react';

export const ComparativeReport: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
          <GitCompare className="text-indigo-600 dark:text-indigo-400" size={20} />
          Cross-Branch & Benchmark Comparative Analytics
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Compare PISA 2025 results across Thakur Complex, Malad, and Ashok Nagar local branches. Benchmarks from Singapore (world leader) and the OECD global averages are plotted to provide international context.
        </p>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Card 1: Cognitive Comparison */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm xl:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={18} />
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                Cognitive Performance Comparison
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Comparing mean subject scores across local school branches, OECD average, and Singapore benchmarks.
              </p>
            </div>
          </div>
          <div data-testid="comparative-scores-chart" className="h-96">
            <ComparativeCognitiveChart />
          </div>
        </div>

        {/* Card 2: Proficiency Level Distributions */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <PieChart className="text-indigo-600 dark:text-indigo-400" size={18} />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  Student Proficiency Distributions
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Percentage of student cohorts in Low, Medium, and High proficiency tiers.
                </p>
              </div>
            </div>
            <div data-testid="proficiency-distribution-chart" className="h-80">
              <ProficiencyChart />
            </div>
          </div>
          <div className="mt-4 flex gap-2 items-start bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg text-[11px] text-slate-700 dark:text-slate-300">
            <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
            <span>
              Tiers reflect standard PISA ranges. Medium represents baseline competency; High represents superior complex problem-solving capabilities.
            </span>
          </div>
        </div>

        {/* Card 3: Gender Performance Gap */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <GitCompare className="text-indigo-600 dark:text-indigo-400" size={18} />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  Gender Equity & Performance Gap
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Visualizing differences in average points between boys and girls.
                </p>
              </div>
            </div>
            <div data-testid="gender-gap-chart" className="h-80">
              <GenderGapChart />
            </div>
          </div>
          <div className="mt-4 flex gap-2 items-start bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg text-[11px] text-slate-700 dark:text-slate-300">
            <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
            <span>
              Dumbbell chart connects girls' average score (Pink) and boys' average score (Blue). The length of the connecting line represents the performance gap.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
