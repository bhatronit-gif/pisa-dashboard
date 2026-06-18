import React, { useState } from 'react';
import { ComparativeCognitiveChart } from './charts/ComparativeCognitiveChart';
import { ProficiencyChart } from './charts/ProficiencyChart';
import { GenderGapChart } from './charts/GenderGapChart';
import { BarChart3, PieChart, GitCompare, Info, Award, TrendingDown, BookOpen, Home, HeartHandshake, Clock } from 'lucide-react';

const HEADCOUNT_DATA = {
  math: {
    title: 'Mathematics Proficiency (Headcount)',
    subtitle: 'Level 2 is the baseline. Students below Level 2 require foundational intervention. Students at Levels 5 & 6 are top-tier performers.',
    headers: ['Proficiency Tier', 'Thakur Complex (108 Total)', 'Malad (125 Total)', 'Ashok Nagar (114 Total)', 'Network Total (347)'],
    rows: [
      { tier: 'High (Levels 5-6)', thakur: '14 students (13.15%)', malad: '9 students (7.12%)', ashok: '15 students (13.16%)', network: '38 students' },
      { tier: 'Medium (Levels 2-4)', thakur: '72 students (66.20%)', malad: '81 students (64.72%)', ashok: '81 students (71.23%)', network: '234 students' },
      { tier: 'Low (Below Level 2)', thakur: '22 students (20.65%)', malad: '35 students (28.16%)', ashok: '18 students (15.61%)', network: '75 students' }
    ]
  },
  reading: {
    title: 'Reading Proficiency (Headcount)',
    subtitle: 'Consolidated reading literacy profiles and performance levels.',
    headers: ['Proficiency Tier', 'Thakur Complex (108 Total)', 'Malad (125 Total)', 'Ashok Nagar (114 Total)', 'Network Total (347)'],
    rows: [
      { tier: 'High (Levels 5-6)', thakur: '11 students (9.91%)', malad: '4 students (2.80%)', ashok: '3 students (2.98%)', network: '18 students' },
      { tier: 'Medium (Levels 2-4)', thakur: '90 students (83.33%)', malad: '93 students (74.64%)', ashok: '86 students (75.09%)', network: '269 students' },
      { tier: 'Low (Below Level 2)', thakur: '7 students (6.76%)', malad: '28 students (22.56%)', ashok: '25 students (21.93%)', network: '60 students' }
    ]
  },
  science: {
    title: 'Science Proficiency (Headcount)',
    subtitle: 'Consolidated scientific literacy and application capability levels.',
    headers: ['Proficiency Tier', 'Thakur Complex (108 Total)', 'Malad (125 Total)', 'Ashok Nagar (114 Total)', 'Network Total (347)'],
    rows: [
      { tier: 'High (Levels 5-6)', thakur: '6 students (5.19%)', malad: '4 students (3.36%)', ashok: '7 students (6.23%)', network: '17 students' },
      { tier: 'Medium (Levels 2-4)', thakur: '86 students (79.91%)', malad: '94 students (75.04%)', ashok: '91 students (79.47%)', network: '271 students' },
      { tier: 'Low (Below Level 2)', thakur: '16 students (14.91%)', malad: '27 students (21.60%)', ashok: '16 students (14.30%)', network: '59 students' }
    ]
  }
};

const TAKEAWAYS = [
  {
    type: 'warning',
    title: 'Mathematics Deficit at Malad',
    text: 'The Malad Math Deficit is substantial in terms of headcounts: Looking at percentages (28.16%) is one thing, but realizing there are 35 actual students at Malad failing to meet the baseline proficiency in Mathematics makes the intervention sizing much clearer. It tells you exactly how many seats you need if you set up a remedial support program. This correlates with the behavioral issues we previously discussed.'
  },
  {
    type: 'info',
    title: "Ashok Nagar's Math Strength",
    text: "Ashok Nagar not only has the highest percentage of top-tier math students, but they actually have the highest raw headcount of them (15 students), despite having a smaller overall cohort than Malad."
  },
  {
    type: 'success',
    title: "Thakur Complex's Reading Dominance",
    text: 'Thakur Complex possesses 11 of the 18 top-tier readers in your entire network. Moreover, only 7 of their students failed to meet the Reading baseline, compared to nearly 30 in the other branches. If you want to build cross-branch peer mentoring for literacy or want to find successful reading pedagogies, Thakur Complex is your clear resource hub.'
  }
];

const HOME_ENV_DATA = {
  title: '1. Home Environment Data',
  description: 'This section looks at how supported students feel at home and the amount of effort they put into independent learning. (For index scores, higher numbers indicate a more positive/supportive environment than the OECD average).',
  headers: ['Metric', 'Thakur Complex', 'Malad', 'Ashok Nagar', 'Singapore Avg', 'OECD Avg'],
  rows: [
    { metric: 'Family Support (Index)', thakur: '0.58', malad: '0.43', ashok: '0.67', singapore: '-0.20', oecd: '0.00', boldAshok: true },
    { metric: 'Time Spent on Homework (Hours/Day)', thakur: '1.95', malad: '2.08', ashok: '2.13', singapore: '2.33', oecd: '1.54', boldAshok: true }
  ],
  takeaways: [
    {
      title: 'A Network Strength',
      text: 'Across the board, CAGS students report incredibly high levels of Family Support compared to the global average and Singapore. Even Malad, the lowest of the three, is significantly above international peers.'
    },
    {
      title: 'Homework Sweet Spot',
      text: 'All branches hover around 2 hours of homework per day. As noted in the PISA report, 1 to 2 hours is the "Goldilocks" zone associated with higher math scores, while anything significantly higher yields diminishing returns.'
    }
  ]
};

const ENGAGEMENT_INDICES_DATA = {
  title: '2. Student Engagement Data (Indices)',
  description: "This data measures students' internal mindsets and their qualitative relationships with their educators. (For index scores, higher numbers indicate a more positive/supportive environment than the OECD average).",
  headers: ['Metric', 'Thakur Complex', 'Malad', 'Ashok Nagar', 'Singapore Avg', 'OECD Avg'],
  rows: [
    { metric: 'Student-Teacher Relationship (Index)', thakur: '0.28', malad: '0.12', ashok: '0.51', singapore: '0.21', oecd: '0.00', boldAshok: true },
    { metric: 'Growth Mindset (Index)', thakur: '0.37', malad: '0.14', ashok: '0.42', singapore: '0.33', oecd: '0.02', boldAshok: true }
  ],
  takeaways: [
    {
      title: 'Ashok Nagar Leads',
      text: 'Ashok Nagar excels in building strong, supportive bonds between students and teachers (0.51), which directly feeds into their students\' high Growth Mindset (0.42).'
    },
    {
      title: 'Malad\'s Disconnect',
      text: 'Malad struggles here. A Growth Mindset of just 0.14 means these students are much more likely to give up when work gets difficult because they lack the strong, trusting teacher relationships (0.12) needed to guide them through failure.'
    }
  ]
};

const ATTENDANCE_DATA = {
  title: '3. Student Engagement Data (Attendance & Truancy)',
  description: 'This section tracks absenteeism and lateness based on students\' self-reporting. It represents behaviors in the two full weeks prior to the PISA test (except for Long-Term Absence, which is historical).',
  headers: ['Metric', 'Thakur Complex', 'Malad', 'Ashok Nagar', 'Singapore Avg', 'OECD Avg'],
  rows: [
    { metric: 'Skipped School/Classes (Yes, 1 or more times)', thakur: '30.84%', malad: '50.00%', ashok: '46.02%', singapore: '13.32%', oecd: '31.30%', boldThakur: true },
    { metric: 'Never Skipped', thakur: '69.16%', malad: '50.00%', ashok: '53.98%', singapore: '86.68%', oecd: '68.70%' },
    { metric: 'Arrived Late (More than 3 times)', thakur: '4.67%', malad: '10.66%', ashok: '8.85%', singapore: '8.11%', oecd: '16.43%' },
    { metric: 'Arrived Late (1 or 2 times)', thakur: '28.97%', malad: '25.41%', ashok: '28.32%', singapore: '21.90%', oecd: '28.91%' },
    { metric: 'Never Arrived Late', thakur: '66.36%', malad: '63.93%', ashok: '62.83%', singapore: '69.99%', oecd: '54.66%' },
    { metric: 'Long-Term Absence (Missed >3 consecutive months in the past)', thakur: '3.70%', malad: '4.03%', ashok: '2.63%', singapore: '4.80%', oecd: '7.59%', boldAshok: true }
  ]
};

export const ComparativeReport: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState<'math' | 'reading' | 'science'>('math');
  const [activeTab, setActiveTab] = useState<'academic' | 'engagement'>('academic');

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

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 print:hidden mb-6">
        <button
          onClick={() => setActiveTab('academic')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'academic'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          📊 Academic & Proficiency Comparison
        </button>
        <button
          onClick={() => setActiveTab('engagement')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'engagement'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          🏡 Environment & Student Engagement
        </button>
      </div>

      {activeTab === 'academic' ? (
        <div className="space-y-6">
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

          {/* Headcount and Takeaways Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Award className="text-indigo-655 dark:text-indigo-405" size={20} />
                  CAGS Network Proficiency Headcount Analysis
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Exact student counts and percentages categorized by standard PISA proficiency tiers.
                </p>
              </div>
              
              {/* Tab selector */}
              <div className="flex bg-slate-50 dark:bg-slate-800/40 p-1 rounded-lg border border-slate-200/40 dark:border-slate-700/40">
                {(['math', 'reading', 'science'] as const).map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setActiveSubject(subject)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      activeSubject === subject
                        ? 'bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {subject === 'math' && 'Mathematics'}
                    {subject === 'reading' && 'Reading'}
                    {subject === 'science' && 'Science'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Table Area (2/3 width) */}
              <div className="lg:col-span-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200/60 dark:border-slate-800/80 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 dark:bg-slate-800/40">
                    <tr>
                      {HEADCOUNT_DATA[activeSubject].headers.map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-150 dark:divide-slate-800">
                    {HEADCOUNT_DATA[activeSubject].rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                          {row.tier}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                          {row.thakur}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                          {row.malad}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                          {row.ashok}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-indigo-650 dark:text-indigo-400 bg-slate-50/20 dark:bg-slate-800/10">
                          {row.network}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  * {HEADCOUNT_DATA[activeSubject].subtitle}
                </p>
              </div>

              {/* Key Takeaways Area (1/3 width) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                  Improvement Plan Takeaways
                </h4>
                
                <div className="space-y-3.5">
                  {TAKEAWAYS.map((takeaway, i) => {
                    let cardClass = '';
                    let titleColor = '';
                    let icon = null;
                    
                    if (takeaway.type === 'warning') {
                      cardClass = 'bg-red-50/40 dark:bg-red-950/10 border-red-200/60 dark:border-red-900/30';
                      titleColor = 'text-red-700 dark:text-red-400';
                      icon = <TrendingDown className="text-red-500 shrink-0" size={16} />;
                    } else if (takeaway.type === 'success') {
                      cardClass = 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/30';
                      titleColor = 'text-emerald-700 dark:text-emerald-400';
                      icon = <BookOpen className="text-emerald-500 shrink-0" size={16} />;
                    } else {
                      cardClass = 'bg-blue-50/40 dark:bg-blue-950/10 border-blue-200/60 dark:border-blue-900/30';
                      titleColor = 'text-blue-700 dark:text-blue-400';
                      icon = <Award className="text-blue-500 shrink-0" size={16} />;
                    }
                    
                    return (
                      <div key={i} className={`p-4 rounded-xl border ${cardClass} space-y-2 shadow-sm`}>
                        <div className="flex items-center gap-2 font-bold text-xs">
                          {icon}
                          <span className={titleColor}>{takeaway.title}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-655 dark:text-slate-355">
                          {takeaway.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Card 1: Home Environment Data */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Home className="text-indigo-650 dark:text-indigo-405" size={20} />
                {HOME_ENV_DATA.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {HOME_ENV_DATA.description}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200/60 dark:border-slate-800/80 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 dark:bg-slate-800/40">
                    <tr>
                      {HOME_ENV_DATA.headers.map((h, i) => (
                        <th key={i} className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-150 dark:divide-slate-800">
                    {HOME_ENV_DATA.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{row.metric}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.thakur}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.malad}</td>
                        <td className={`px-4 py-3 text-xs text-slate-600 dark:text-slate-300 ${row.boldAshok ? 'font-bold text-slate-800 dark:text-white' : ''}`}>{row.ashok}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.singapore}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.oecd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">Key Takeaways</h4>
                <div className="space-y-3">
                  {HOME_ENV_DATA.takeaways.map((takeaway, i) => (
                    <div key={i} className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/30 dark:bg-indigo-950/10 space-y-1 shadow-sm">
                      <div className="font-bold text-xs text-indigo-700 dark:text-indigo-400">{takeaway.title}</div>
                      <p className="text-[11px] leading-relaxed text-slate-655 dark:text-slate-355">{takeaway.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Student Engagement Data (Indices) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <HeartHandshake className="text-indigo-650 dark:text-indigo-405" size={20} />
                {ENGAGEMENT_INDICES_DATA.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {ENGAGEMENT_INDICES_DATA.description}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200/60 dark:border-slate-800/80 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 dark:bg-slate-800/40">
                    <tr>
                      {ENGAGEMENT_INDICES_DATA.headers.map((h, i) => (
                        <th key={i} className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-150 dark:divide-slate-800">
                    {ENGAGEMENT_INDICES_DATA.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{row.metric}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.thakur}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.malad}</td>
                        <td className={`px-4 py-3 text-xs text-slate-600 dark:text-slate-300 ${row.boldAshok ? 'font-bold text-slate-800 dark:text-white' : ''}`}>{row.ashok}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.singapore}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.oecd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">Key Takeaways</h4>
                <div className="space-y-3">
                  {ENGAGEMENT_INDICES_DATA.takeaways.map((takeaway, i) => (
                    <div key={i} className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/30 dark:bg-indigo-950/10 space-y-1 shadow-sm">
                      <div className="font-bold text-xs text-indigo-700 dark:text-indigo-405">{takeaway.title}</div>
                      <p className="text-[11px] leading-relaxed text-slate-655 dark:text-slate-355">{takeaway.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Attendance & Truancy */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Clock className="text-indigo-650 dark:text-indigo-405" size={20} />
                {ATTENDANCE_DATA.title}
              </h3>
              <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">
                {ATTENDANCE_DATA.description}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200/60 dark:border-slate-800/80 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 dark:bg-slate-800/40">
                  <tr>
                    {ATTENDANCE_DATA.headers.map((h, i) => (
                      <th key={i} className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-150 dark:divide-slate-800">
                  {ATTENDANCE_DATA.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{row.metric}</td>
                      <td className={`px-4 py-3 text-xs text-slate-600 dark:text-slate-300 ${row.boldThakur ? 'font-bold text-slate-800 dark:text-white' : ''}`}>{row.thakur}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.malad}</td>
                      <td className={`px-4 py-3 text-xs text-slate-600 dark:text-slate-300 ${row.boldAshok ? 'font-bold text-slate-800 dark:text-white' : ''}`}>{row.ashok}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.singapore}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{row.oecd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
