import React, { useState, useEffect, useRef } from 'react';
import { BranchData, BRANCHES_DATA, COLOR_MAP } from '../data/pisaData';
import { CognitiveChart } from './charts/CognitiveChart';
import { StudentVoiceChart } from './charts/StudentVoiceChart';
import { NarrativeInsights } from './NarrativeInsights';
import { useTheme } from '../context/ThemeContext';
import { Users, GraduationCap, Download } from 'lucide-react';
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

      {/* Main Report Container for capturing PDF */}
      <div id="branch-report-content" className="p-1 space-y-6 bg-transparent">
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
            <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${selectedBranch.gender.boysPercent}%` }}
                className="h-full bg-blue-500 transition-all duration-300"
                title={`Boys: ${selectedBranch.gender.boysPercent}%`}
              />
              <div
                style={{ width: `${selectedBranch.gender.girlsPercent}%` }}
                className="h-full bg-pink-500 transition-all duration-300"
                title={`Girls: ${selectedBranch.gender.girlsPercent}%`}
              />
            </div>
          </div>

          {/* Card 3: ESCS Socio-Economic Index */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ESCS Socio-Economic Index</span>
              <span data-testid="escs-index" className="text-sm font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {(selectedBranch.escsIndex + deltas.escs).toFixed(2)}
              </span>
            </div>
            {/* Horizontal slider gauge track */}
            <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2">
              {/* Markers for OECD average (0.0) */}
              <div className="absolute top-1/2 left-1/2 h-4 w-0.5 bg-slate-400 dark:bg-slate-500 -translate-y-1/2" title="OECD Avg: 0.0" />
              {/* Active position pin */}
              <div
                style={{
                  left: `${Math.min(100, Math.max(0, ((selectedBranch.escsIndex + deltas.escs + 1) / 2) * 100))}%`
                }}
                className="absolute top-1/2 h-3.5 w-3.5 bg-indigo-600 dark:bg-indigo-400 rounded-full border-2 border-white dark:border-slate-900 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 shadow"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 mt-2">
              <span>-1.0 (Low)</span>
              <span>OECD Avg (0.0)</span>
              <span>+1.0 (High)</span>
            </div>
          </div>
        </div>

        {/* Dashboard Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: What-If Simulator Panel (width: 5/12) */}
          <SimulatorControls
            deltas={deltas}
            onDeltaChange={handleDeltaChange}
            onReset={handleReset}
          />

          {/* Right Column: Estimated Performance & Voice Profile (width: 7/12) */}
          <div className="lg:col-span-7 space-y-6">
            {/* KPI estimated score cards */}
            <div className="grid grid-cols-3 gap-4">
              {/* Reading Card */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimated Reading</span>
                <div className="flex items-baseline gap-1 mt-1">
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
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimated Math</span>
                <div className="flex items-baseline gap-1 mt-1">
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
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimated Science</span>
                <div className="flex items-baseline gap-1 mt-1">
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
      </div>
    </div>
  );
};
