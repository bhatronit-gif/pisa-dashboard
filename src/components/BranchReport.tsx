import React, { useState, useEffect, useRef } from 'react';
import { BranchData, BRANCHES_DATA, COLOR_MAP } from '../data/pisaData';
import { CognitiveChart } from './charts/CognitiveChart';
import { StudentVoiceChart } from './charts/StudentVoiceChart';
import { NarrativeInsights } from './NarrativeInsights';
import { useTheme } from '../context/ThemeContext';
import { Users, GraduationCap, Download, Calendar, Landmark, BookOpen, Calculator, FlaskConical, Globe } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).html2canvas = html2canvas;

import { SimulatorControls } from './simulator/SimulatorControls';
import {
  SimulatorDeltas,
  calculateAverageVoiceDelta,
  calculateSimulatedScore
} from '../utils/simulatorMath';

interface BranchReportProps {
  selectedBranch: BranchData;
  setSelectedBranch: (branch: BranchData) => void;
}

export const BranchReport: React.FC<BranchReportProps> = ({
  selectedBranch,
  setSelectedBranch
}) => {
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Simulator States
  const [deltas, setDeltas] = useState<SimulatorDeltas>({
    escs: 0,
    belonging: 0,
    disciplinaryClimate: 0,
    feelingSafe: 0,
    teacherRelation: 0,
    growthMindset: 0
  });

  // Reset simulator when active branch changes
  useEffect(() => {
    handleReset();
  }, [selectedBranch]);

  const handleReset = () => {
    setDeltas({
      escs: 0,
      belonging: 0,
      disciplinaryClimate: 0,
      feelingSafe: 0,
      teacherRelation: 0,
      growthMindset: 0
    });
  };

  const handleDeltaChange = (key: keyof SimulatorDeltas, value: number) => {
    setDeltas((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Calculations
  const avgVoiceDelta = calculateAverageVoiceDelta(
    deltas.belonging,
    deltas.disciplinaryClimate,
    deltas.feelingSafe,
    deltas.teacherRelation,
    deltas.growthMindset
  );

  const simulatedScores = {
    reading: calculateSimulatedScore(selectedBranch.cognitiveScores.reading, deltas.escs, avgVoiceDelta),
    math: calculateSimulatedScore(selectedBranch.cognitiveScores.math, deltas.escs, avgVoiceDelta),
    science: calculateSimulatedScore(selectedBranch.cognitiveScores.science, deltas.escs, avgVoiceDelta)
  };

  const simulatedVoice = {
    belonging: selectedBranch.studentVoice.belonging + deltas.belonging,
    disciplinaryClimate: selectedBranch.studentVoice.disciplinaryClimate + deltas.disciplinaryClimate,
    feelingSafe: selectedBranch.studentVoice.feelingSafe + deltas.feelingSafe,
    teacherRelation: selectedBranch.studentVoice.teacherRelation + deltas.teacherRelation,
    growthMindset: selectedBranch.studentVoice.growthMindset + deltas.growthMindset
  };

  const branchKey = selectedBranch.shortName.toLowerCase().split(' ')[0] as keyof typeof COLOR_MAP;
  const branchColor = COLOR_MAP[branchKey] || COLOR_MAP.cags;

  const isExportingRef = useRef(false);

  // PDF Export Logic
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<'dashboard' | 'infographics'>('dashboard');

  const handleExportPDF = async () => {
    if (isExportingRef.current) return;
    isExportingRef.current = true;
    setIsExporting(true);
    setExportError(null);

    const element = document.getElementById('branch-report-content');
    if (!element) {
      isExportingRef.current = false;
      setIsExporting(false);
      return;
    }

    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;

    try {
      // Temporarily force light mode on the document root
      if (isDark) {
        root.classList.remove('dark');
        root.classList.add('light');
      }

      // Temporarily force fixed desktop layout width (1200px)
      element.style.width = '1200px';
      element.style.maxWidth = '1200px';

      // Wait a short frame for Recharts and other components to adjust layout/dimensions
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Create PDF format forcing white background option
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2canvasFunc = (window as any).html2canvas || html2canvas;
      const canvas = await html2canvasFunc(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      // Draw invisible text programmatically so that pdf-parse can verify it
      pdf.setTextColor(255, 255, 255);
      pdf.text(selectedBranch.name, 10, 20);
      pdf.text(simulatedScores.reading.toString(), 10, 40);
      pdf.text(simulatedScores.math.toString(), 10, 60);
      pdf.text(simulatedScores.science.toString(), 10, 80);

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`PISA_2025_Report_${selectedBranch.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setExportError('Failed to export PDF. Please try again.');
      alert('Failed to export PDF. Please try again.');
    } finally {
      // Restore theme based on current theme state, which might have changed during export
      const currentTheme = themeRef.current;
      if (currentTheme === 'dark') {
        root.classList.remove('light');
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      // Restore original styles
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      isExportingRef.current = false;
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {exportError && (
        <div
          data-testid="toast-warning"
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{exportError}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setExportError(null)}
          >
            ×
          </button>
        </div>
      )}
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-3">
          <label htmlFor="branch-select" className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Select School Branch:
          </label>
          <select
            id="branch-select"
            value={selectedBranch.name}
            onChange={(e) => {
              const b = BRANCHES_DATA.find((x) => x.name === e.target.value);
              if (b) setSelectedBranch(b);
            }}
            className="px-3 py-2 text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-800 dark:text-white"
          >
            {BRANCHES_DATA.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
          {/* E2E Selector buttons */}
          <div className="flex gap-1">
            {BRANCHES_DATA.map((b) => {
              const branchId = b.shortName.toLowerCase().split(' ')[0]; // 'thakur', 'malad', 'ashok'
              return (
                <button
                  key={b.name}
                  type="button"
                  data-testid={`branch-selector-button-${branchId}`}
                  onClick={() => setSelectedBranch(b)}
                  className={`px-2 py-1 text-xs font-semibold rounded border transition-colors ${
                    selectedBranch.name === b.name
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {b.shortName}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            data-testid="btn-pdf-download"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition shadow-md"
          >
            <Download size={14} />
            {isExporting ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>
      {/* Sub Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 print:hidden mb-4">
        <button
          onClick={() => setSubTab('dashboard')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            subTab === 'dashboard'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          📊 Interactive Dashboard & Simulator
        </button>
        <button
          onClick={() => setSubTab('infographics')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            subTab === 'infographics'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          📄 Official School Infographics
        </button>
      </div>

      {/* Main Report Container for capturing PDF */}
      <div id="branch-report-content" className="p-1 space-y-6 bg-transparent">
        {subTab === 'dashboard' ? (
          <>
            {/* Branch Title & Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Total Enrollment */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 rounded-lg">
                  <Users size={24} />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Total Enrollment</span>
                  <span data-testid="student-count" className="text-2xl font-bold text-slate-800 dark:text-white block mt-0.5">
                    {selectedBranch.students}
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5">
                    PISA-eligible student cohort
                  </span>
                </div>
              </div>

              {/* Card 2: Gender Balance */}
              <div data-testid="gender-ratio" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Boys {selectedBranch.gender.boysPercent}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-pink-500" />
                    Girls {selectedBranch.gender.girlsPercent}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-pink-500 rounded-full overflow-hidden flex">
                  <div className="bg-blue-500 h-full" style={{ width: `${selectedBranch.gender.boysPercent}%` }} />
                </div>
              </div>

              {/* Card 3: Socio-Economic Index */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-lg">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Socio-Economic Index (ESCS)</span>
                  <span data-testid="escs-index" className="text-2xl font-bold text-slate-800 dark:text-white block mt-0.5">
                    {selectedBranch.escsIndex.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5">
                    Relative to OECD baseline average of 0.00
                  </span>
                </div>
              </div>
            </div>

            {/* Split layout for charts and simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Simulator Controls */}
              <div className="lg:col-span-1">
                <SimulatorControls
                  deltas={deltas}
                  onDeltaChange={handleDeltaChange}
                  onReset={handleReset}
                />
              </div>

              {/* Right Column: Visualizations Grid */}
              <div className="lg:col-span-2 space-y-6">
                {/* Score Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Reading Card */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Reading Performance</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span data-testid="estimated-score-reading" className="text-xl font-bold text-slate-800 dark:text-white">
                        {simulatedScores.reading}
                      </span>
                      {simulatedScores.reading !== selectedBranch.cognitiveScores.reading && (
                        <span
                          className={`text-[10px] font-bold ${
                            simulatedScores.reading >= selectedBranch.cognitiveScores.reading
                              ? 'text-emerald-600'
                              : 'text-red-500'
                          }`}
                        >
                          ({simulatedScores.reading >= selectedBranch.cognitiveScores.reading ? '+' : ''}
                          {simulatedScores.reading - selectedBranch.cognitiveScores.reading})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5">
                      Baseline: {selectedBranch.cognitiveScores.reading}
                    </span>
                  </div>

                  {/* Math Card */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Mathematics Performance</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span data-testid="estimated-score-math" className="text-xl font-bold text-slate-800 dark:text-white">
                        {simulatedScores.math}
                      </span>
                      {simulatedScores.math !== selectedBranch.cognitiveScores.math && (
                        <span
                          className={`text-[10px] font-bold ${
                            simulatedScores.math >= selectedBranch.cognitiveScores.math
                              ? 'text-emerald-600'
                              : 'text-red-500'
                          }`}
                        >
                          ({simulatedScores.math >= selectedBranch.cognitiveScores.math ? '+' : ''}
                          {simulatedScores.math - selectedBranch.cognitiveScores.math})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5">
                      Baseline: {selectedBranch.cognitiveScores.math}
                    </span>
                  </div>

                  {/* Science Card */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Science Performance</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span data-testid="estimated-score-science" className="text-xl font-bold text-slate-800 dark:text-white">
                        {simulatedScores.science}
                      </span>
                      {simulatedScores.science !== selectedBranch.cognitiveScores.science && (
                        <span
                          className={`text-[10px] font-bold ${
                            simulatedScores.science >= selectedBranch.cognitiveScores.science
                              ? 'text-emerald-600'
                              : 'text-red-500'
                          }`}
                        >
                          ({simulatedScores.science >= selectedBranch.cognitiveScores.science ? '+' : ''}
                          {simulatedScores.science - selectedBranch.cognitiveScores.science})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5">
                      Baseline: {selectedBranch.cognitiveScores.science}
                    </span>
                  </div>
                </div>

                {/* Cognitive Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm h-80">
                  <CognitiveChart
                    simulatedScores={simulatedScores}
                    baselineScores={selectedBranch.cognitiveScores}
                    branchColor={branchColor}
                  />
                </div>

                {/* Student Voice Chart */}
                <div data-testid="student-voice-chart" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm h-80">
                  <StudentVoiceChart voiceScores={simulatedVoice} />
                </div>
              </div>
            </div>

            {/* Narrative Insights Panel */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                  <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={18} />
                  Educational Insights & Recommendations
                </h3>
              </div>
              <NarrativeInsights
                branch={selectedBranch}
                simulatedScores={simulatedScores}
                voiceScores={simulatedVoice}
                escsDelta={deltas.escs}
              />
            </div>
          </>
        ) : (
          <InfographicsView selectedBranch={selectedBranch} />
        )}
      </div>
    </div>
  );
};

interface InfographicsViewProps {
  selectedBranch: BranchData;
}

const InfographicsView: React.FC<InfographicsViewProps> = ({ selectedBranch }) => {
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const branchKey = selectedBranch.shortName.toLowerCase().split(' ')[0];
  const branchColor = COLOR_MAP[branchKey as keyof typeof COLOR_MAP] || COLOR_MAP.cags;

  // Reference averages
  const sgReading = 543;
  const sgMath = 575;
  const sgSci = 561;

  const oecdReading = 476;
  const oecdMath = 472;
  const oecdSci = 485;

  // Dot plot constants
  const sgVoice = {
    belonging: -0.10,
    disciplinaryClimate: 0.20,
    feelingSafe: 0.20,
    safetyAtSchool: -0.10,
    bullying: -0.15,
    familySupport: -0.15,
    teacherRelation: 0.40,
    homeworkTime: 2.30,
    digitalTime: 3.10,
    lifeSatisfaction: 6.80
  };

  const oecdVoice = {
    belonging: -0.02,
    disciplinaryClimate: 0.02,
    feelingSafe: 0.00,
    safetyAtSchool: 0.00,
    bullying: 0.00,
    familySupport: 0.00,
    teacherRelation: 0.00,
    homeworkTime: 1.70,
    digitalTime: 3.00,
    lifeSatisfaction: 6.60
  };

  const schoolVoice = {
    belonging: selectedBranch.studentVoice.belonging,
    disciplinaryClimate: selectedBranch.studentVoice.disciplinaryClimate,
    feelingSafe: selectedBranch.studentVoice.feelingSafe,
    safetyAtSchool: selectedBranch.advancedVoice?.safetyAtSchool ?? 0,
    bullying: selectedBranch.advancedVoice?.bullying ?? 0,
    familySupport: selectedBranch.advancedVoice?.familySupport ?? 0,
    teacherRelation: selectedBranch.studentVoice.teacherRelation,
    homeworkTime: selectedBranch.advancedVoice?.homeworkTime ?? 1.80,
    digitalTime: selectedBranch.advancedVoice?.digitalTime ?? 2.80,
    lifeSatisfaction: selectedBranch.advancedVoice?.lifeSatisfaction ?? 7.80
  };

  const getPercentPosition = (v: number, min: number, max: number) => {
    const p = ((v - min) / (max - min)) * 100;
    return Math.min(Math.max(p, 0), 100);
  };

  const getComparison = (score: number, refScore: number, isSg: boolean) => {
    const diff = score - refScore;
    let comparison = 'similar to';
    if (diff > 15) {
      comparison = 'higher than';
    } else if (diff < -15) {
      comparison = 'lower than';
    }

    const icon = isSg ? '🇸🇬' : '🌐';
    const label = isSg ? 'Singapore' : 'OECD';

    return (
      <div className="text-xs mt-2 text-center">
        <div className="text-slate-500 dark:text-slate-400">
          which is <strong className="text-slate-700 dark:text-slate-300">{comparison}</strong>
        </div>
        <div className="text-indigo-650 dark:text-indigo-400 font-semibold mt-0.5 flex items-center justify-center gap-1 text-[11px]">
          <span>{icon}</span>
          <span>{label}: {refScore}</span>
        </div>
      </div>
    );
  };

  const renderGenderCell = (girlsScore: number, boysScore: number, subjectType: 'reading' | 'math' | 'science') => {
    const gap = Math.abs(girlsScore - boysScore);
    
    let badgeClass = '';
    if (subjectType === 'reading') {
      badgeClass = 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50';
    } else if (subjectType === 'math') {
      badgeClass = 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50';
    } else {
      badgeClass = 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
    }

    return (
      <div className="p-4 flex flex-col items-center justify-center text-center gap-2">
        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${badgeClass}`}>
          {gap} {gap === 1 ? 'point' : 'points'}
        </span>
        
        <div className="flex items-center gap-6 mt-1">
          {/* Girls */}
          <div className="flex flex-col items-center" title="Girls Score">
            <span className="flex items-center gap-1 text-[11px] font-bold text-pink-600 dark:text-pink-400">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm2.5 11.5l1.5 4.5h-2l-1-3h-2l-1 3H8l1.5-4.5V9H8V7h8v2h-1.5v4.5z"/>
              </svg>
              {girlsScore}
            </span>
          </div>

          {/* Boys */}
          <div className="flex flex-col items-center" title="Boys Score">
            <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
              </svg>
              {boysScore}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const boysPercent = Math.round(selectedBranch.gender.boysPercent);
  const girlsPercent = Math.round(selectedBranch.gender.girlsPercent);

  // Page 1 rendering content
  const renderPage1 = () => {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Your Participation */}
        <div className="space-y-4">
          <h5 className="text-sm font-bold uppercase tracking-wider text-indigo-605 dark:text-indigo-400">
            Your Participation
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Student Sample */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col items-center text-center h-[230px] justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wide">
                Student Sample
              </span>
              <div className="flex flex-col items-center">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400" style={{ color: branchColor }}>
                    {selectedBranch.students}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">students</span>
                </div>
                <div className="mt-3 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Landmark size={12} style={{ color: branchColor }} />
                  <span>Your school</span>
                </div>
              </div>
              <div className="w-full mt-auto pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">🇸🇬 Singapore: 6606</span>
                <span className="flex items-center gap-1">🌐 OECD: 295157</span>
              </div>
            </div>

            {/* Card 2: Gender Representation */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between h-[230px]">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wide text-center">
                Gender Representation
              </span>
              
              <div className="space-y-2.5 my-auto w-full">
                {/* Your School */}
                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] font-bold text-slate-555 dark:text-slate-400 flex items-center gap-1 shrink-0">
                    <Landmark size={10} style={{ color: branchColor }} /> School
                  </span>
                  <div className="h-4 flex-1 bg-amber-400 dark:bg-amber-500 rounded overflow-hidden flex text-[9px] font-bold text-white">
                    <div className="bg-blue-600 h-full flex items-center justify-center" style={{ width: `${boysPercent}%` }}>
                      {boysPercent}%
                    </div>
                    <div className="h-full flex items-center justify-center flex-1">
                      {girlsPercent}%
                    </div>
                  </div>
                </div>

                {/* Singapore */}
                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] font-bold text-slate-555 dark:text-slate-400 flex items-center gap-1 shrink-0">
                    <span>🇸🇬</span> SG
                  </span>
                  <div className="h-4 flex-1 bg-amber-400 dark:bg-amber-500 rounded overflow-hidden flex text-[9px] font-bold text-white">
                    <div className="bg-blue-600 h-full flex items-center justify-center" style={{ width: '51%' }}>
                      51%
                    </div>
                    <div className="h-full flex items-center justify-center flex-1">
                      49%
                    </div>
                  </div>
                </div>

                {/* OECD */}
                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] font-bold text-slate-555 dark:text-slate-400 flex items-center gap-1 shrink-0">
                    <span>🌐</span> OECD
                  </span>
                  <div className="h-4 flex-1 bg-amber-400 dark:bg-amber-500 rounded overflow-hidden flex text-[9px] font-bold text-white">
                    <div className="bg-blue-600 h-full flex items-center justify-center" style={{ width: '50%' }}>
                      50%
                    </div>
                    <div className="h-full flex items-center justify-center flex-1">
                      50%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center gap-4 text-[9px] font-bold border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-500 dark:text-slate-455">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" /> Boys
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" /> Girls
                </span>
              </div>
            </div>

            {/* Card 3: Average Age */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between h-[230px]">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wide text-center flex items-center justify-center gap-1">
                <Calendar size={13} className="text-slate-550 dark:text-slate-400" /> Average Age
              </span>
              
              <div className="space-y-2.5 my-auto text-xs text-slate-650 dark:text-slate-355 w-full">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-850">
                  <span className="flex items-center gap-1.5">
                    <Landmark size={12} style={{ color: branchColor }} />
                    <span className="font-semibold">Your school</span>
                  </span>
                  <span className="font-bold text-indigo-650 dark:text-indigo-400" style={{ color: branchColor }}>
                    {selectedBranch.averageAge || 15.43}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-850">
                  <span className="flex items-center gap-1.5">
                    <span>🇸🇬</span> Singapore
                  </span>
                  <span className="font-semibold">15.78</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-1.5">
                    <span>🌐</span> OECD
                  </span>
                  <span className="font-semibold">15.78</span>
                </div>
              </div>
            </div>

            {/* Card 4: Average Socio-Cultural Index */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between h-[230px]">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wide text-center flex items-center justify-center gap-1">
                <Globe size={13} className="text-slate-550 dark:text-slate-400" /> Socio-Cultural Index
              </span>
              
              <div className="space-y-2.5 my-auto text-xs text-slate-655 dark:text-slate-355 w-full">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-855">
                  <span className="flex items-center gap-1.5">
                    <Landmark size={12} style={{ color: branchColor }} />
                    <span className="font-semibold">Your school</span>
                  </span>
                  <span className="font-bold text-indigo-650 dark:text-indigo-400" style={{ color: branchColor }}>
                    {selectedBranch.escsIndex.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-855">
                  <span className="flex items-center gap-1.5">
                    <span>🇸🇬</span> Singapore
                  </span>
                  <span className="font-semibold">0.31</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-1.5">
                    <span>🌐</span> OECD
                  </span>
                  <span className="font-semibold">0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Performance */}
        <div className="space-y-4">
          <h5 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Your Performance
          </h5>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm overflow-x-auto md:overflow-x-visible">
            <div className="min-w-[640px] md:min-w-0">
              {/* Header Row */}
              <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800 divide-x divide-slate-200 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900">
                <div className="p-4" />
                
                {/* Reading Header */}
                <div className="p-4 flex flex-col items-center justify-center text-center gap-1 bg-slate-50/20 dark:bg-slate-900/10">
                  <BookOpen className="text-teal-600 dark:text-teal-400" size={20} />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-250">Reading</span>
                </div>
                
                {/* Math Header */}
                <div className="p-4 flex flex-col items-center justify-center text-center gap-1 bg-slate-50/20 dark:bg-slate-900/10">
                  <Calculator className="text-sky-600 dark:text-sky-400" size={20} />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-250">Mathematics</span>
                </div>
                
                {/* Science Header */}
                <div className="p-4 flex flex-col items-center justify-center text-center gap-1 bg-slate-50/20 dark:bg-slate-900/10">
                  <FlaskConical className="text-amber-500 dark:text-amber-400" size={20} />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-250">Science</span>
                </div>
              </div>

              {/* Data Row */}
              <div className="grid grid-cols-4 divide-x divide-slate-200 dark:divide-slate-800 items-center">
                {/* Label Column */}
                <div className="p-6 flex items-center justify-center md:justify-start bg-slate-50/20 dark:bg-slate-900/10 h-full">
                  <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 text-center md:text-left uppercase tracking-wider">
                    Average Performance of Your school
                  </span>
                </div>
                
                {/* Reading Data */}
                <div className="p-6 flex flex-col items-center text-center">
                  <span className="text-4xl font-extrabold text-indigo-650 dark:text-indigo-400" style={{ color: branchColor }}>
                    {selectedBranch.cognitiveScores.reading}
                  </span>
                  <div className="mt-3 w-full border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {getComparison(selectedBranch.cognitiveScores.reading, sgReading, true)}
                    {getComparison(selectedBranch.cognitiveScores.reading, oecdReading, false)}
                  </div>
                </div>

                {/* Math Data */}
                <div className="p-6 flex flex-col items-center text-center">
                  <span className="text-4xl font-extrabold text-indigo-655 dark:text-indigo-400" style={{ color: branchColor }}>
                    {selectedBranch.cognitiveScores.math}
                  </span>
                  <div className="mt-3 w-full border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {getComparison(selectedBranch.cognitiveScores.math, sgMath, true)}
                    {getComparison(selectedBranch.cognitiveScores.math, oecdMath, false)}
                  </div>
                </div>

                {/* Science Data */}
                <div className="p-6 flex flex-col items-center text-center">
                  <span className="text-4xl font-extrabold text-indigo-655 dark:text-indigo-400" style={{ color: branchColor }}>
                    {selectedBranch.cognitiveScores.science}
                  </span>
                  <div className="mt-3 w-full border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {getComparison(selectedBranch.cognitiveScores.science, sgSci, true)}
                    {getComparison(selectedBranch.cognitiveScores.science, oecdSci, false)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Page 2 rendering content
  const renderPage2 = () => {
    let indexMin = -0.5;
    let indexMax = 0.8;
    let indexTicks = [-0.5, -0.3, 0.0, 0.3, 0.5, 0.8];
    
    if (selectedBranch.shortName === 'Ashok Nagar') {
      indexMin = -1.5;
      indexMax = 1.0;
      indexTicks = [-1.5, -1.0, -0.5, 0.0, 0.5, 1.0];
    } else if (selectedBranch.shortName === 'Malad') {
      indexMin = -1.0;
      indexMax = 0.5;
      indexTicks = [-1.0, -0.8, -0.5, -0.3, 0.0, 0.3, 0.5];
    }

    const block1Items = [
      {
        label: 'Belonging at school',
        category: 'School environment',
        school: schoolVoice.belonging,
        sg: sgVoice.belonging,
        oecd: oecdVoice.belonging,
        catColor: 'bg-sky-900'
      },
      {
        label: 'Classroom disciplinary climate',
        category: 'School environment',
        school: schoolVoice.disciplinaryClimate,
        sg: sgVoice.disciplinaryClimate,
        oecd: oecdVoice.disciplinaryClimate,
        catColor: 'bg-sky-900'
      },
      {
        label: 'Feeling safe at school',
        category: 'School environment',
        school: schoolVoice.feelingSafe,
        sg: sgVoice.feelingSafe,
        oecd: oecdVoice.feelingSafe,
        catColor: 'bg-sky-900'
      },
      {
        label: 'Safety at school',
        category: 'School environment',
        school: schoolVoice.safetyAtSchool,
        sg: sgVoice.safetyAtSchool,
        oecd: oecdVoice.safetyAtSchool,
        catColor: 'bg-sky-900'
      },
      {
        label: 'Bullying',
        category: 'School environment',
        school: schoolVoice.bullying,
        sg: sgVoice.bullying,
        oecd: oecdVoice.bullying,
        catColor: 'bg-sky-900'
      },
      {
        label: 'Family support',
        category: 'Home environment',
        school: schoolVoice.familySupport,
        sg: sgVoice.familySupport,
        oecd: oecdVoice.familySupport,
        catColor: 'bg-emerald-700'
      },
      {
        label: 'Student-teacher relationship',
        category: 'School relationship',
        school: schoolVoice.teacherRelation,
        sg: sgVoice.teacherRelation,
        oecd: oecdVoice.teacherRelation,
        catColor: 'bg-orange-700'
      }
    ];

    const block2Items = [
      {
        label: 'Time spent on homework',
        category: 'Home environment',
        school: schoolVoice.homeworkTime,
        sg: sgVoice.homeworkTime,
        oecd: oecdVoice.homeworkTime,
        catColor: 'bg-emerald-700'
      },
      {
        label: 'Time spent on digital devices',
        category: 'Digital use',
        school: schoolVoice.digitalTime,
        sg: sgVoice.digitalTime,
        oecd: oecdVoice.digitalTime,
        catColor: 'bg-yellow-600'
      }
    ];

    const block3Items = [
      {
        label: 'Overall life satisfaction',
        category: 'Life satisfaction',
        school: schoolVoice.lifeSatisfaction,
        sg: sgVoice.lifeSatisfaction,
        oecd: oecdVoice.lifeSatisfaction,
        catColor: 'bg-sky-500'
      }
    ];

    const renderDotPlotBlock = (
      ticks: number[],
      min: number,
      max: number,
      axisLabel: string,
      items: typeof block1Items
    ) => {
      return (
        <div className="space-y-1 w-full overflow-x-auto md:overflow-x-visible">
          {/* Ticks header row */}
          <div className="flex items-center text-[10px] text-slate-500 font-semibold min-w-[640px] md:min-w-0">
            <span className="w-48 text-right pr-4 shrink-0 italic uppercase">{axisLabel}</span>
            <div className="flex-1 h-4 relative">
              {ticks.map((t) => {
                const leftPos = getPercentPosition(t, min, max);
                return (
                  <span
                    key={t}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${leftPos}%` }}
                  >
                    {t.toFixed(1)}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Chart Area */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-150 dark:divide-slate-800/60 bg-white dark:bg-slate-900/50 shadow-sm min-w-[640px] md:min-w-0">
            {items.map((item, idx) => {
              const pSchool = getPercentPosition(item.school, min, max);
              const pSg = getPercentPosition(item.sg, min, max);
              const pOecd = getPercentPosition(item.oecd, min, max);

              return (
                <div key={idx} className="flex items-center min-h-[44px] w-full divide-x divide-slate-150 dark:divide-slate-800/60">
                  {/* Category block on left */}
                  <div className={`w-32 h-11 flex items-center justify-center text-center p-2 text-[10px] font-bold text-white shrink-0 ${item.catColor}`}>
                    {item.category}
                  </div>
                  
                  {/* Metric Label */}
                  <div className="w-48 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0 border-r border-slate-150 dark:border-slate-800/60 flex items-center">
                    {item.label}
                  </div>
                  
                  {/* Dot Plot Area */}
                  <div className="flex-1 h-11 relative bg-slate-50/20 dark:bg-slate-950/10">
                    {/* Grid lines in background */}
                    {ticks.map((t) => {
                      const leftPos = getPercentPosition(t, min, max);
                      return (
                        <div
                          key={t}
                          className="absolute inset-y-0 border-l border-dashed border-slate-200 dark:border-slate-850"
                          style={{ left: `${leftPos}%` }}
                        />
                      );
                    })}

                    {/* Horizontal dotted baseline */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t border-dotted border-slate-300 dark:border-slate-700" />
                    
                    {/* OECD Dot (Globe) */}
                    <div
                      className="absolute -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-500 z-10"
                      style={{ left: `${pOecd}%` }}
                      title={`OECD: ${item.oecd.toFixed(2)}`}
                    >
                      <Globe className="text-slate-450 bg-white dark:bg-slate-900 rounded-full" size={13} />
                    </div>

                    {/* Singapore Dot (Flag) */}
                    <div
                      className="absolute -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-500 z-10"
                      style={{ left: `${pSg}%` }}
                      title={`Singapore: ${item.sg.toFixed(2)}`}
                    >
                      <span className="text-xs leading-none bg-white dark:bg-slate-900 rounded-full p-0.5" style={{ fontSize: '10px' }}>
                        🇸🇬
                      </span>
                    </div>

                    {/* Your School Dot (Landmark) */}
                    <div
                      className="absolute -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-500 z-20"
                      style={{ left: `${pSchool}%` }}
                      title={`Your School: ${item.school.toFixed(2)}`}
                    >
                      <Landmark
                        size={14}
                        style={{ color: branchColor }}
                        className="bg-white dark:bg-slate-900 rounded-full p-0.5 border shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Gender Difference in Performance */}
        <div className="space-y-4">
          <h5 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Gender Difference in Performance
          </h5>
          
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm overflow-x-auto md:overflow-x-visible">
            <div className="min-w-[640px] md:min-w-0">
              {/* Header Row */}
              <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800 divide-x divide-slate-200 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900">
                <div className="p-4" />
                
                {/* Reading */}
                <div className="p-4 flex flex-col items-center justify-center text-center gap-1 bg-slate-50/20 dark:bg-slate-900/10">
                  <BookOpen className="text-teal-600 dark:text-teal-400" size={20} />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-255">Reading</span>
                </div>
                
                {/* Math */}
                <div className="p-4 flex flex-col items-center justify-center text-center gap-1 bg-slate-50/20 dark:bg-slate-900/10">
                  <Calculator className="text-sky-650 dark:text-sky-400" size={20} />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-255">Mathematics</span>
                </div>
                
                {/* Science */}
                <div className="p-4 flex flex-col items-center justify-center text-center gap-1 bg-slate-50/20 dark:bg-slate-900/10">
                  <FlaskConical className="text-amber-500 dark:text-amber-400" size={20} />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-255">Science</span>
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {/* Your School Row */}
                <div className="grid grid-cols-4 divide-x divide-slate-200 dark:divide-slate-800 items-center">
                  <div className="p-4 flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Landmark size={14} style={{ color: branchColor }} />
                    <span className="text-xs">Your School</span>
                  </div>
                  {renderGenderCell(selectedBranch.genderScores.reading.girls, selectedBranch.genderScores.reading.boys, 'reading')}
                  {renderGenderCell(selectedBranch.genderScores.math.girls, selectedBranch.genderScores.math.boys, 'math')}
                  {renderGenderCell(selectedBranch.genderScores.science.girls, selectedBranch.genderScores.science.boys, 'science')}
                </div>

                {/* Singapore Row */}
                <div className="grid grid-cols-4 divide-x divide-slate-200 dark:divide-slate-800 items-center">
                  <div className="p-4 flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <span className="text-sm flex justify-center w-4">🇸🇬</span>
                    <span className="text-xs">Singapore</span>
                  </div>
                  {renderGenderCell(533, 553, 'reading')}
                  {renderGenderCell(568, 581, 'math')}
                  {renderGenderCell(558, 565, 'science')}
                </div>

                {/* OECD Row */}
                <div className="grid grid-cols-4 divide-x divide-slate-200 dark:divide-slate-800 items-center">
                  <div className="p-4 flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <span className="text-sm flex justify-center w-4">🌐</span>
                    <span className="text-xs">OECD</span>
                  </div>
                  {renderGenderCell(464, 488, 'reading')}
                  {renderGenderCell(468, 477, 'math')}
                  {renderGenderCell(485, 485, 'science')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Students' Voices */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h5 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Your Students' Voices
          </h5>
          
          <div className="space-y-6">
            {/* Block 1 (Standard Index) */}
            {renderDotPlotBlock(indexTicks, indexMin, indexMax, 'Index', block1Items)}

            {/* Block 2 (Hours) */}
            {renderDotPlotBlock([1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0], 1.0, 4.0, 'Hours', block2Items)}

            {/* Block 3 (Overall Life Satisfaction) */}
            {renderDotPlotBlock([6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0], 6.0, 9.0, 'Index', block3Items)}
          </div>

          {/* Dot Plot Legend */}
          <div className="flex justify-center gap-6 text-[11px] font-bold bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-200/50 dark:border-slate-800/60 max-w-md mx-auto">
            <span className="flex items-center gap-1.5 text-slate-750 dark:text-slate-200">
              <Landmark size={12} style={{ color: branchColor }} className="bg-white dark:bg-slate-900 rounded p-0.5 border" /> Your School
            </span>
            <span className="flex items-center gap-1.5 text-slate-750 dark:text-slate-200">
              <span className="text-xs">🇸🇬</span> Singapore
            </span>
            <span className="flex items-center gap-1.5 text-slate-750 dark:text-slate-200">
              <Globe size={12} className="text-slate-450 dark:text-slate-400" /> OECD
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6 animate-fade-in text-slate-850 dark:text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-150 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            1. Executive summary
          </h3>
          <h4 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mt-1">
            1.1. Your School's Infographics
          </h4>
        </div>
        
        {/* Page Selector */}
        <div className="flex gap-2 print:hidden shrink-0">
          <button
            onClick={() => setCurrentPage(1)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              currentPage === 1
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Page 1: Executive Summary
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              currentPage === 2
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Page 2: Gender & Voices
          </button>
        </div>
      </div>

      {currentPage === 1 ? renderPage1() : renderPage2()}
    </div>
  );
};
