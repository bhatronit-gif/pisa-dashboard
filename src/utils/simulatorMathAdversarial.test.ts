import { describe, it, expect } from 'vitest';
import {
  clampScore,
  calculateAverageVoiceDelta,
  calculateSimulatedScore
} from './simulatorMath';

describe('simulatorMath Utilities - Adversarial and Type Safety Gaps', () => {

  describe('clampScore inputs and boundaries', () => {
    it('should handle NaN by returning NaN', () => {
      expect(clampScore(NaN)).toBeNaN();
    });

    it('should handle Infinity and -Infinity correctly', () => {
      expect(clampScore(Infinity)).toBe(700);
      expect(clampScore(-Infinity)).toBe(300);
    });

    it('should handle reversed bounds gracefully', () => {
      // In JS Math.max(min, Math.min(max, value))
      // clampScore(500, 700, 300) -> Math.max(700, Math.min(300, 500)) -> Math.max(700, 300) -> 700
      expect(clampScore(500, 700, 300)).toBe(700);
    });
  });

  describe('calculateAverageVoiceDelta with abnormal input values', () => {
    it('should return NaN if any of the dimensions are NaN', () => {
      expect(calculateAverageVoiceDelta(NaN, 1, 1, 1, 1)).toBeNaN();
      expect(calculateAverageVoiceDelta(1, 1, NaN, 1, 1)).toBeNaN();
    });

    it('should propagate Infinity values', () => {
      expect(calculateAverageVoiceDelta(Infinity, 1, 1, 1, 1)).toBe(Infinity);
      expect(calculateAverageVoiceDelta(-Infinity, 1, 1, 1, 1)).toBe(-Infinity);
    });
  });

  describe('calculateSimulatedScore with abnormal deltas', () => {
    it('should return NaN if average voice delta or escs delta is NaN', () => {
      expect(calculateSimulatedScore(500, NaN, 1)).toBeNaN();
      expect(calculateSimulatedScore(500, 1, NaN)).toBeNaN();
      expect(calculateSimulatedScore(500, NaN, NaN)).toBeNaN();
    });

    it('should clamp scores to bounds even with infinite deltas', () => {
      expect(calculateSimulatedScore(500, Infinity, 0)).toBe(700);
      expect(calculateSimulatedScore(500, 0, Infinity)).toBe(700);
      expect(calculateSimulatedScore(500, -Infinity, 0)).toBe(300);
      expect(calculateSimulatedScore(500, 0, -Infinity)).toBe(300);
    });
  });
});
