/**
 * Mathematical utilities for the What-If performance simulator.
 */

export interface SimulatorDeltas {
  escs: number;
  belonging: number;
  disciplinaryClimate: number;
  feelingSafe: number;
  teacherRelation: number;
  growthMindset: number;
}

/**
 * Clamps a score between the specified minimum and maximum bounds.
 */
export const clampScore = (value: number, min = 300, max = 700): number => {
  const safeMin = min ?? 300;
  const safeMax = max ?? 700;
  if (value === null || value === undefined) {
    return safeMin;
  }
  if (typeof value !== 'number' || isNaN(value)) {
    return NaN;
  }
  return Math.max(safeMin, Math.min(safeMax, value));
};

/**
 * Calculates the average of the student voice delta inputs.
 */
export const calculateAverageVoiceDelta = (
  belonging: number,
  disciplinaryClimate: number,
  feelingSafe: number,
  teacherRelation: number,
  growthMindset: number
): number => {
  if (
    [belonging, disciplinaryClimate, feelingSafe, teacherRelation, growthMindset].some(
      val => typeof val === 'number' && isNaN(val)
    )
  ) {
    return NaN;
  }

  const safeBelonging = belonging ?? 0;
  const safeDisciplinary = disciplinaryClimate ?? 0;
  const safeSafe = feelingSafe ?? 0;
  const safeTeacher = teacherRelation ?? 0;
  const safeGrowth = growthMindset ?? 0;

  return (safeBelonging + safeDisciplinary + safeSafe + safeTeacher + safeGrowth) / 5;
};

/**
 * Computes the simulated PISA score based on baseline score, socio-economic delta, and average student voice delta.
 */
export const calculateSimulatedScore = (
  baseline: number,
  escsDelta: number,
  averageVoiceDelta: number
): number => {
  if (
    (typeof baseline === 'number' && isNaN(baseline)) ||
    (typeof escsDelta === 'number' && isNaN(escsDelta)) ||
    (typeof averageVoiceDelta === 'number' && isNaN(averageVoiceDelta))
  ) {
    return NaN;
  }

  const safeBaseline = baseline ?? 500;
  const safeEscs = escsDelta ?? 0;
  const safeVoice = averageVoiceDelta ?? 0;

  return clampScore(Math.round(safeBaseline + safeEscs * 15 + safeVoice * 10));
};
