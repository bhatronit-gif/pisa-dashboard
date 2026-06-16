import React from 'react';
import { BranchData, REFERENCE_DATA } from '../data/pisaData';
import { BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';

interface NarrativeInsightsProps {
  branch: BranchData;
  simulatedScores: { reading: number; math: number; science: number };
  voiceScores: {
    belonging: number;
    disciplinaryClimate: number;
    feelingSafe: number;
    teacherRelation: number;
    growthMindset: number;
  };
  escsDelta: number;
}

export const NarrativeInsights: React.FC<NarrativeInsightsProps> = ({
  branch,
  simulatedScores,
  voiceScores,
  escsDelta
}) => {
  const oecd = REFERENCE_DATA.oecd.cognitiveScores;
  const sg = REFERENCE_DATA.singapore.cognitiveScores;

  // 1. Generate Academic Summary
  const isSimulated = 
    Math.round(simulatedScores.reading) !== branch.cognitiveScores.reading ||
    Math.round(simulatedScores.math) !== branch.cognitiveScores.math ||
    Math.round(simulatedScores.science) !== branch.cognitiveScores.science;

  const averageBranchScore = Math.round(
    (simulatedScores.reading + simulatedScores.math + simulatedScores.science) / 3
  );
  const averageOecdScore = Math.round(
    (oecd.reading + oecd.math + oecd.science) / 3
  );
  const averageSgScore = Math.round(
    (sg.reading + sg.math + sg.science) / 3
  );

  const diffOecd = averageBranchScore - averageOecdScore;
  const diffSg = averageSgScore - averageBranchScore;

  let academicSummaryText = `${branch.name} has an overall estimated academic average of ${averageBranchScore} PISA points, which is `;
  
  if (diffOecd >= 0) {
    academicSummaryText += `${diffOecd} points higher than the OECD average of ${averageOecdScore} points. `;
  } else {
    academicSummaryText += `${Math.abs(diffOecd)} points lower than the OECD average of ${averageOecdScore} points. `;
  }

  academicSummaryText += `Currently, the branch trails Singapore's world-leading average benchmark by ${diffSg} points. `;

  if (isSimulated) {
    const rDelta = Math.round(simulatedScores.reading - branch.cognitiveScores.reading);
    const mDelta = Math.round(simulatedScores.math - branch.cognitiveScores.math);
    const sDelta = Math.round(simulatedScores.science - branch.cognitiveScores.science);
    
    academicSummaryText += `Under the current policy simulation (Socio-Economic ESCS Delta of ${escsDelta > 0 ? '+' : ''}${escsDelta.toFixed(2)} SD), the branch is projected to achieve score shifts of: `;
    academicSummaryText += `Reading (${rDelta >= 0 ? '+' : ''}${rDelta} pts), `;
    academicSummaryText += `Math (${mDelta >= 0 ? '+' : ''}${mDelta} pts), and `;
    academicSummaryText += `Science (${sDelta >= 0 ? '+' : ''}${sDelta} pts) relative to baseline values.`;
  } else {
    academicSummaryText += `This represents the baseline academic footprint prior to simulating developmental interventions.`;
  }

  // 2. Generate Opportunities and Strengths
  const strengths: string[] = [];
  const opportunities: string[] = [];

  // Cognitive score comparisons
  if (simulatedScores.reading >= oecd.reading) {
    strengths.push(`Reading performance is strong, outperforming the OECD average by ${Math.round(simulatedScores.reading - oecd.reading)} points.`);
  } else {
    opportunities.push(`Reading average lags the OECD standard by ${Math.round(oecd.reading - simulatedScores.reading)} points. Targeted reading circles and guided literacy strategies are recommended.`);
  }

  if (simulatedScores.math >= oecd.math) {
    strengths.push(`Mathematics average is highly competitive, scoring ${Math.round(simulatedScores.math - oecd.math)} points above the international average.`);
  } else {
    opportunities.push(`Mathematics scores are currently ${Math.round(oecd.math - simulatedScores.math)} points below the OECD benchmark. Integrating supplemental problem-solving workshops could help close this gap.`);
  }

  if (simulatedScores.science >= oecd.science) {
    strengths.push(`Scientific reasoning metrics exceed the OECD benchmark by ${Math.round(simulatedScores.science - oecd.science)} points, showing robust research capabilities.`);
  } else {
    opportunities.push(`Science averages are ${Math.round(oecd.science - simulatedScores.science)} points behind the OECD baseline. Introducing more laboratory modules and inquiry-based learning is suggested.`);
  }

  // Student Voice indicators
  if (voiceScores.disciplinaryClimate < 0.05) {
    opportunities.push(`The disciplinary climate is negative or near-zero (${voiceScores.disciplinaryClimate.toFixed(2)} SD), suggesting that classroom noise and disruptions hinder focus. Structured classroom management protocols could elevate student focus.`);
  } else if (voiceScores.disciplinaryClimate >= 0.3) {
    strengths.push(`Disciplinary climate sits at an exceptional level (${voiceScores.disciplinaryClimate.toFixed(2)} SD), reflecting orderly classrooms optimized for learning.`);
  }

  if (voiceScores.belonging < 0.20) {
    opportunities.push(`Student sense of school belonging index is low (${voiceScores.belonging.toFixed(2)} SD). Implementing social integration programs and student-led clubs is recommended to improve school affinity.`);
  } else if (voiceScores.belonging >= 0.3) {
    strengths.push(`Sense of belonging is highly positive (${voiceScores.belonging.toFixed(2)} SD), showing strong alignment between student cohort identity and school culture.`);
  }

  if (voiceScores.growthMindset < 0.20) {
    opportunities.push(`Growth mindset is moderate to low (${voiceScores.growthMindset.toFixed(2)} SD). Integrating resilience-building curriculums and effort-focused reward schemes is advised.`);
  } else if (voiceScores.growthMindset >= 0.35) {
    strengths.push(`Growth mindset index is outstanding (${voiceScores.growthMindset.toFixed(2)} SD), showing that students view challenge as an opportunity for learning.`);
  }

  // Gender Gap checks
  const mathGap = Math.abs(branch.genderScores.math.boys - branch.genderScores.math.girls);
  if (mathGap > 10) {
    const leader = branch.genderScores.math.boys > branch.genderScores.math.girls ? 'Boys' : 'Girls';
    const lagging = leader === 'Boys' ? 'girls' : 'boys';
    opportunities.push(`A noticeable gender gap of ${mathGap.toFixed(0)} points in Mathematics performance exists, with ${leader} leading. Consider targeted STEM engagement programs for ${lagging} to bridge the equity gap.`);
  }

  const readingGap = Math.abs(branch.genderScores.reading.boys - branch.genderScores.reading.girls);
  if (readingGap > 10) {
    const leader = branch.genderScores.reading.boys > branch.genderScores.reading.girls ? 'Boys' : 'Girls';
    const lagging = leader === 'Boys' ? 'girls' : 'boys';
    opportunities.push(`A significant gender gap of ${readingGap.toFixed(0)} points in Reading exists, where ${leader} outperform. Structured literature clubs aimed at ${lagging} are recommended.`);
  }

  if (opportunities.length === 0) {
    opportunities.push("No significant structural performance issues identified. Continue monitoring student performance across all modules.");
  }

  return (
    <div data-testid="narrative-insights" className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column: Academic Summary */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
            <BookOpen size={18} />
            <h4 className="text-sm font-bold uppercase tracking-wider">Academic Summary</h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {academicSummaryText}
          </p>
        </div>

        {strengths.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-2 text-emerald-800 dark:text-emerald-400">
              <TrendingUp size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Key Strengths</span>
            </div>
            <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300 list-disc list-inside">
              {strengths.map((strength, idx) => (
                <li key={idx}>{strength}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right Column: Opportunities for Growth */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-500">
          <AlertTriangle size={18} />
          <h4 className="text-sm font-bold uppercase tracking-wider">Opportunities for Growth</h4>
        </div>
        <ul className="space-y-2.5">
          {opportunities.map((opp, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300 items-start">
              <span className="text-amber-500 mt-1.5 shrink-0 block h-1.5 w-1.5 rounded-full bg-current" />
              <span>{opp}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
