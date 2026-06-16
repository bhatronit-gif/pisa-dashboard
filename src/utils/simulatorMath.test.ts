import { describe, it, expect } from 'vitest';
import {
  clampScore,
  calculateAverageVoiceDelta,
  calculateSimulatedScore
} from './simulatorMath';

describe('simulatorMath utilities', () => {
  describe('clampScore', () => {
    it('should return the value if within bounds', () => {
      expect(clampScore(500)).toBe(500);
      expect(clampScore(300)).toBe(300);
      expect(clampScore(700)).toBe(700);
    });

    it('should clamp to min if value is below min', () => {
      expect(clampScore(200)).toBe(300);
      expect(clampScore(0)).toBe(300);
      expect(clampScore(-100)).toBe(300);
    });

    it('should clamp to max if value is above max', () => {
      expect(clampScore(800)).toBe(700);
      expect(clampScore(1000)).toBe(700);
    });

    it('should support custom min and max values', () => {
      expect(clampScore(10, 20, 50)).toBe(20);
      expect(clampScore(100, 20, 50)).toBe(50);
      expect(clampScore(35, 20, 50)).toBe(35);
    });
  });

  describe('calculateAverageVoiceDelta', () => {
    it('should calculate the average of 5 values correctly', () => {
      expect(calculateAverageVoiceDelta(1, 1, 1, 1, 1)).toBe(1);
      expect(calculateAverageVoiceDelta(0, 0, 0, 0, 0)).toBe(0);
      expect(calculateAverageVoiceDelta(-1, -1, -1, -1, -1)).toBe(-1);
      expect(calculateAverageVoiceDelta(0.5, 0.5, 0.5, 0.5, 0.5)).toBe(0.5);
    });

    it('should handle mixed positive and negative values', () => {
      expect(calculateAverageVoiceDelta(1, -1, 1, -1, 0)).toBe(0);
      expect(calculateAverageVoiceDelta(1.5, 0.5, -0.5, -1.5, 0)).toBe(0);
      expect(calculateAverageVoiceDelta(2.0, 1.5, 1.0, 0.5, 0.0)).toBe(1.0);
    });
  });

  describe('calculateSimulatedScore', () => {
    it('should compute simulated score using baseline, escs delta, and average voice delta', () => {
      // Baseline: 500, escsDelta: 1, averageVoiceDelta: 1
      // Calculation: 500 + (1 * 15) + (1 * 10) = 525
      expect(calculateSimulatedScore(500, 1, 1)).toBe(525);
    });

    it('should round the calculated score to the nearest integer', () => {
      // Baseline: 500, escsDelta: 0.1, averageVoiceDelta: 0.1
      // Calculation: 500 + 1.5 + 1 = 502.5 -> rounds to 503
      expect(calculateSimulatedScore(500, 0.1, 0.1)).toBe(503);

      // Baseline: 500, escsDelta: 0.05, averageVoiceDelta: 0.05
      // Calculation: 500 + 0.75 + 0.5 = 501.25 -> rounds to 501
      expect(calculateSimulatedScore(500, 0.05, 0.05)).toBe(501);
    });

    it('should clamp the final rounded score between 300 and 700', () => {
      // Very low input should clamp to 300
      expect(calculateSimulatedScore(310, -2.0, -2.0)).toBe(300);

      // Very high input should clamp to 700
      expect(calculateSimulatedScore(690, 2.0, 2.0)).toBe(700);
    });

    it('should handle extreme delta scenarios and mixed extremes correctly', () => {
      // All deltas set to +2.00
      expect(calculateSimulatedScore(500, 2.0, 2.0)).toBe(550);
      expect(calculateSimulatedScore(660, 2.0, 2.0)).toBe(700); // 660 + 50 = 710 -> clamps to 700

      // All deltas set to -2.00
      expect(calculateSimulatedScore(500, -2.0, -2.0)).toBe(450);
      expect(calculateSimulatedScore(340, -2.0, -2.0)).toBe(300); // 340 - 50 = 290 -> clamps to 300

      // Mixed extremes: ESCS = +2.00, average voice delta = -2.00
      expect(calculateSimulatedScore(500, 2.0, -2.0)).toBe(510); // 500 + 30 - 20 = 510

      // Mixed extremes: ESCS = -2.00, average voice delta = +2.00
      expect(calculateSimulatedScore(500, -2.0, 2.0)).toBe(490); // 500 - 30 + 20 = 490
    });

    it('should handle boundary rounding values and floating point precision correctly', () => {
      // Round up from .55
      expect(calculateSimulatedScore(500, 0.03, 0.01)).toBe(501); // 500 + 0.45 + 0.1 = 500.55 -> 501

      // Round down from .45
      expect(calculateSimulatedScore(500, -0.03, -0.01)).toBe(499); // 500 - 0.45 - 0.1 = 499.45 -> 499

      // Round up from .5 exactly
      expect(calculateSimulatedScore(500, 0.01, 0.035)).toBe(501); // 500 + 0.15 + 0.35 = 500.5 -> 501

      // JS Math.round behavior for .5 exactly on a negative change
      expect(calculateSimulatedScore(500, -0.01, -0.035)).toBe(500); // 500 - 0.15 - 0.35 = 499.5 -> rounds to 500 in JS

      // Extreme low baseline clamping
      expect(calculateSimulatedScore(299, 0, 0)).toBe(300);

      // Extreme high baseline clamping
      expect(calculateSimulatedScore(701, 0, 0)).toBe(700);
    });

    it('should clamp at 300 when baseline is 300 and deltas are negative', () => {
      expect(calculateSimulatedScore(300, -2.0, -2.0)).toBe(300);
      expect(calculateSimulatedScore(300, -5.0, -5.0)).toBe(300);
    });

    it('should clamp at 700 when baseline is 700 and deltas are positive', () => {
      expect(calculateSimulatedScore(700, 2.0, 2.0)).toBe(700);
      expect(calculateSimulatedScore(700, 5.0, 5.0)).toBe(700);
    });

    it('should calculate correctly under mixed extreme scenarios', () => {
      // baseline = 500, escs = 2.00, voice = -2.00
      // 500 + 2.00 * 15 + (-2.00) * 10 = 500 + 30 - 20 = 510
      expect(calculateSimulatedScore(500, 2.0, -2.0)).toBe(510);

      // baseline = 500, escs = -2.00, voice = 2.00
      // 500 - 30 + 20 = 490
      expect(calculateSimulatedScore(500, -2.0, 2.0)).toBe(490);
    });

    it('should round positive and negative values correctly', () => {
      // Math.round of positive .5 goes up
      // 500 + 0.1 * 15 + 0.1 * 10 = 500 + 1.5 + 1.0 = 502.5 -> 503
      expect(calculateSimulatedScore(500, 0.1, 0.1)).toBe(503);

      // 500 - 0.1 * 15 - 0.1 * 10 = 500 - 1.5 - 1.0 = 497.5 -> 498 (Math.round behavior in JS)
      expect(calculateSimulatedScore(500, -0.1, -0.1)).toBe(498);
    });
  });
});

