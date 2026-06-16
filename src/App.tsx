import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { BRANCHES_DATA, BranchData } from './data/pisaData';
import { BranchReport } from './components/BranchReport';
import { ComparativeReport } from './components/ComparativeReport';
import { GraduationCap, HelpCircle } from 'lucide-react';
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

type Tab = 'context' | 'branch' | 'comparative' | 'pr';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('context');
  const [selectedBranch, setSelectedBranch] = useState<BranchData>(BRANCHES_DATA[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const branchParam = params.get('branch');
      if (branchParam) {
        const found = BRANCHES_DATA.find(
          (b) =>
            b.name.toLowerCase() === branchParam.toLowerCase() ||
            b.shortName.toLowerCase() === branchParam.toLowerCase()
        );
        if (found) {
          setSelectedBranch(found);
        } else {
          setSelectedBranch(BRANCHES_DATA[0]);
        }
      } else {
        setSelectedBranch(BRANCHES_DATA[0]);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-hidden">
      {/* Backdrop overlay visible on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static print:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            🎓 PISA 2025
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Children's Academy Group
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1" role="tablist">
          <button
            onClick={() => {
              setActiveTab('context');
              setIsSidebarOpen(false);
            }}
            role="tab"
            aria-selected={activeTab === 'context'}
            data-testid="tab-context"
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'context'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            1. Context: PISA & OECD
          </button>
          <button
            onClick={() => {
              setActiveTab('branch');
              setIsSidebarOpen(false);
            }}
            role="tab"
            aria-selected={activeTab === 'branch'}
            data-testid="tab-branch"
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'branch'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            2. Branch Reports & Simulator
          </button>
          <button
            onClick={() => {
              setActiveTab('comparative');
              setIsSidebarOpen(false);
            }}
            role="tab"
            aria-selected={activeTab === 'comparative'}
            data-testid="tab-comparative"
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'comparative'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            3. Comparative Reports
          </button>
          <button
            onClick={() => {
              setActiveTab('pr');
              setIsSidebarOpen(false);
            }}
            role="tab"
            aria-selected={activeTab === 'pr'}
            data-testid="tab-pr"
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'pr'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            4. PR Showcase (CAGS vs OECD)
          </button>
        </nav>

        {/* Theme Toggle in Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Theme Preference</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Main Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-2">
            <button
              data-testid="btn-hamburger"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus:outline-none"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              {activeTab === 'context' && 'Context: PISA & OECD Baseline'}
              {activeTab === 'branch' && 'Individual Branch Performance & Est. Score Simulator'}
              {activeTab === 'comparative' && 'Comparative Analysis'}
              {activeTab === 'pr' && 'CAGS Network Performance vs OECD'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
              Assessment: PISA 2025
            </span>
          </div>
        </header>

        {/* Tab View Container */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-1">
          {activeTab === 'context' && (
            <ContextTabContent />
          )}
          {activeTab === 'branch' && (
            <BranchReport selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} />
          )}
          {activeTab === 'comparative' && (
            <ComparativeReport />
          )}
          {activeTab === 'pr' && (
            <PRShowcaseContent />
          )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

const ContextTabContent: React.FC = () => {
  const [activeRegion, setActiveRegion] = useState<'emea' | 'apac' | 'americas'>('emea');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Intro section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
              <GraduationCap size={20} /> What is PISA for Schools?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              The <strong>Programme for International Student Assessment (PISA)</strong> is a gold-standard global assessment created by the OECD. 
              Rather than testing raw memory or curriculum content, PISA assesses how well 15-year-old students can apply their knowledge 
              to real-world scenarios in <strong>Reading, Mathematics, and Science</strong>.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-2">
              It also measures crucial non-cognitive skills—student well-being, growth mindset, sense of belonging, and school climate—providing 
              a holistic picture of school health.
            </p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
              <HelpCircle size={20} /> What is the OECD Average?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              The OECD (Organisation for Economic Co-operation and Development) average serves as the global baseline. It represents the combined 
              average of highly developed, top-performing education systems around the world.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-2">
              Scoring "similar to" or "higher than" the OECD average means a school is operating at elite global standards.
            </p>
          </div>
        </div>
      </div>

      {/* Domain Cards */}
      <div>
        <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-4">What does PISA Assess?</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">PISA evaluates student literacy in three core domains. These are not simple subjects, but critical life-readiness dimensions:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Reading */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border-l-4 border-indigo-600 dark:border-indigo-500 shadow-card border-slate-200/60 dark:border-slate-800/80 transition-all hover:-translate-y-1 hover:border-l-8 duration-200">
            <div className="text-3xl mb-3">📖</div>
            <h5 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Reading Literacy</h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The capacity to understand, use, evaluate, reflect on, and engage with texts in order to achieve goals, develop knowledge and potential, and participate effectively in society.
            </p>
          </div>
          {/* Card 2: Math */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border-l-4 border-teal-500 dark:border-teal-400 shadow-card border-slate-200/60 dark:border-slate-800/80 transition-all hover:-translate-y-1 hover:border-l-8 duration-200">
            <div className="text-3xl mb-3">🧮</div>
            <h5 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Mathematical Literacy</h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The capacity to formulate, employ, and interpret mathematics in a variety of contexts to describe, explain, and predict phenomena.
            </p>
          </div>
          {/* Card 3: Science */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border-l-4 border-violet-500 dark:border-violet-400 shadow-card border-slate-200/60 dark:border-slate-800/80 transition-all hover:-translate-y-1 hover:border-l-8 duration-200">
            <div className="text-3xl mb-3">🔬</div>
            <h5 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Scientific Literacy</h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The ability to engage with science-related issues, and with the ideas of science, as a reflective citizen. Requires explaining phenomena scientifically.
            </p>
          </div>
        </div>
      </div>

      {/* OECD Countries */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200/60 dark:border-slate-800/80">
        <h4 className="text-md font-semibold text-slate-850 dark:text-slate-100 mb-2">Which Countries Make up the OECD?</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          The 38 member countries represent a vast majority of the world's wealth and educational advancement. Explored below by region:
        </p>

        {/* Region Selector Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
          <button
            onClick={() => setActiveRegion('emea')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeRegion === 'emea'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            🇪🇺 Europe & Middle East (26)
          </button>
          <button
            onClick={() => setActiveRegion('apac')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeRegion === 'apac'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            🌏 Asia-Pacific (4)
          </button>
          <button
            onClick={() => setActiveRegion('americas')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeRegion === 'americas'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            🇺🇸 Americas (8)
          </button>
        </div>

        {/* Region Content */}
        <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-2">
          {activeRegion === 'emea' && (
            <>
              <p><strong>Western & Central Europe:</strong> United Kingdom, Germany, France, Italy, Spain, Netherlands, Belgium, Switzerland, Austria, Ireland, Luxembourg</p>
              <p><strong>Northern Europe:</strong> Finland, Sweden, Norway, Denmark, Iceland, Estonia, Latvia, Lithuania</p>
              <p><strong>Eastern & Southern Europe:</strong> Poland, Czech Republic, Slovak Republic, Hungary, Slovenia, Portugal, Greece, Türkiye</p>
              <p><strong>Middle East:</strong> Israel</p>
            </>
          )}
          {activeRegion === 'apac' && (
            <>
              <p><strong>East Asia:</strong> Japan, South Korea</p>
              <p><strong>Oceania:</strong> Australia, New Zealand</p>
            </>
          )}
          {activeRegion === 'americas' && (
            <>
              <p><strong>North America:</strong> United States, Canada, Mexico</p>
              <p><strong>South & Central America:</strong> Chile, Colombia, Costa Rica</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PRShowcaseContent: React.FC = () => {
  const cognitiveData = [
    { subject: 'Reading', 'CAGS Network': 484, 'OECD Average': 476 },
    { subject: 'Mathematics', 'CAGS Network': 493, 'OECD Average': 472 },
    { subject: 'Science', 'CAGS Network': 490, 'OECD Average': 485 },
  ];

  const wellBeingData = [
    { metric: 'Family Support', 'CAGS Network': 0.56, 'OECD Average': 0.00 },
    { metric: 'Feeling Safe', 'CAGS Network': 0.49, 'OECD Average': 0.00 },
    { metric: 'Growth Mindset', 'CAGS Network': 0.30, 'OECD Average': 0.02 },
    { metric: 'Teacher Relationship', 'CAGS Network': 0.30, 'OECD Average': 0.00 },
    { metric: 'Sense of Belonging', 'CAGS Network': 0.27, 'OECD Average': -0.02 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
        <h3 className="text-xl font-bold mb-2 text-slate-850 dark:text-slate-100">
          🏆 CAGS Network vs OECD Showcase
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          By consolidating data across all 347 students, the Children's Academy network vividly demonstrates that our educational standards and student well-being <strong>dramatically outperform international baseline averages.</strong>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition duration-200">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Overall Life Satisfaction (CAGS Avg)</span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">7.97 / 10</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block mt-2 font-medium">▲ +1.22 vs OECD</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">OECD Average is 6.75</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition duration-200">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Exposure to Bullying Index (CAGS)</span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">-0.41</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block mt-2 font-medium">▼ -0.41 (Significantly Safer)</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">OECD Average is 0.00 (Standardized)</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition duration-200">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Math Performance (CAGS Avg)</span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">493 Points</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block mt-2 font-medium">▲ +21 vs OECD</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">OECD Average is 472</span>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Cognitive Performance: CAGS vs Global Average</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cognitiveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis domain={[300, 550]} tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip 
                  isAnimationActive={false}
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="CAGS Network" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="OECD Average" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Student Well-Being: CAGS vs Global Average</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wellBeingData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis type="number" domain={[-0.2, 0.7]} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis dataKey="metric" type="category" width={110} tick={{ fill: '#64748B', fontSize: 10 }} />
                <Tooltip 
                  isAnimationActive={false}
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="CAGS Network" fill="#10B981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="OECD Average" fill="#9CA3AF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
