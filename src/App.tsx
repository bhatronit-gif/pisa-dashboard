import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { BRANCHES_DATA, BranchData } from './data/pisaData';
import { BranchReport } from './components/BranchReport';
import { ComparativeReport } from './components/ComparativeReport';

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
            <div className="space-y-6">
              <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-100 dark:border-slate-800/60">
                <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">PISA & OECD Global Baseline</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Display of overall global PISA contexts. Details of cognitive baseline, scores, and country comparison metrics go here.
                </p>
              </div>
            </div>
          )}
          {activeTab === 'branch' && (
            <BranchReport selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} />
          )}
          {activeTab === 'comparative' && (
            <ComparativeReport />
          )}
          {activeTab === 'pr' && (
            <div className="space-y-6">
              <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-100 dark:border-slate-800/60">
                <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">CAGS Network vs OECD Showcase</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Consolidated PR showcasing aggregated Children's Academy Group of Schools (CAGS) performance compared to the global OECD avg.
                </p>
              </div>
            </div>
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

export default App;
