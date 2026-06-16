import React from 'react';
import { Sliders, RefreshCw } from 'lucide-react';
import { SimulatorDeltas } from '../../utils/simulatorMath';

interface SimulatorControlsProps {
  deltas: SimulatorDeltas;
  onDeltaChange: (key: keyof SimulatorDeltas, value: number) => void;
  onReset: () => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  deltas,
  onDeltaChange,
  onReset
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm lg:col-span-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="text-indigo-600 dark:text-indigo-400" size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
              What-If Performance Simulator
            </h3>
          </div>
          <button
            onClick={onReset}
            data-testid="btn-reset-simulator"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition"
          >
            <RefreshCw size={14} />
            Reset Simulator
          </button>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
          Adjust the socio-economic index (ESCS) and student well-being variables to estimate the hypothetical impact on cognitive test results.
        </p>

        <div className="space-y-5">
          {/* ESCS Index Delta Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">Socio-Economic Support (ESCS)</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                {deltas.escs > 0 ? '+' : ''}{deltas.escs.toFixed(2)} SD
              </span>
            </div>
            <input
              type="range"
              min="-2.00"
              max="2.00"
              step="0.01"
              value={deltas.escs}
              data-testid="slider-escs"
              onChange={(e) => onDeltaChange('escs', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
            />
          </div>

          {/* 5 Well-Being Slider Deltas */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-5">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
              Student Voice Dimensions
            </span>

            {/* Belonging */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Sense of Belonging</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  {deltas.belonging > 0 ? '+' : ''}{deltas.belonging.toFixed(2)} SD
                </span>
              </div>
              <input
                type="range"
                min="-2.00"
                max="2.00"
                step="0.01"
                value={deltas.belonging}
                data-testid="slider-belonging"
                onChange={(e) => onDeltaChange('belonging', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
              />
            </div>

            {/* Disciplinary Climate */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Disciplinary Climate</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  {deltas.disciplinaryClimate > 0 ? '+' : ''}{deltas.disciplinaryClimate.toFixed(2)} SD
                </span>
              </div>
              <input
                type="range"
                min="-2.00"
                max="2.00"
                step="0.01"
                value={deltas.disciplinaryClimate}
                data-testid="slider-disciplinaryClimate"
                onChange={(e) => onDeltaChange('disciplinaryClimate', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
              />
            </div>

            {/* Feeling Safe */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Feeling Safe</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  {deltas.feelingSafe > 0 ? '+' : ''}{deltas.feelingSafe.toFixed(2)} SD
                </span>
              </div>
              <input
                type="range"
                min="-2.00"
                max="2.00"
                step="0.01"
                value={deltas.feelingSafe}
                data-testid="slider-feelingSafe"
                onChange={(e) => onDeltaChange('feelingSafe', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
              />
            </div>

            {/* Teacher Relation */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Teacher Relation</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  {deltas.teacherRelation > 0 ? '+' : ''}{deltas.teacherRelation.toFixed(2)} SD
                </span>
              </div>
              <input
                type="range"
                min="-2.00"
                max="2.00"
                step="0.01"
                value={deltas.teacherRelation}
                data-testid="slider-teacherRelation"
                onChange={(e) => onDeltaChange('teacherRelation', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
              />
            </div>

            {/* Growth Mindset */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Growth Mindset</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  {deltas.growthMindset > 0 ? '+' : ''}{deltas.growthMindset.toFixed(2)} SD
                </span>
              </div>
              <input
                type="range"
                min="-2.00"
                max="2.00"
                step="0.01"
                value={deltas.growthMindset}
                data-testid="slider-growthMindset"
                onChange={(e) => onDeltaChange('growthMindset', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calculations model explanation footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 leading-normal">
        Model: <code className="bg-slate-50 dark:bg-slate-800/80 px-1 py-0.5 rounded">Score + (ESCS * 15) + (AvgVoice * 10)</code>, bounded [300, 700].
      </div>
    </div>
  );
};
