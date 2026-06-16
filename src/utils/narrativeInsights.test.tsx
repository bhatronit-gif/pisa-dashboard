import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NarrativeInsights } from '../components/NarrativeInsights';
import { BranchData } from '../data/pisaData';

import '@testing-library/jest-dom';

const mockBranchBase: BranchData = {
  name: 'Test Branch',
  shortName: 'Test',
  students: 100,
  gender: { boysPercent: 50, girlsPercent: 50 },
  escsIndex: 0.0,
  cognitiveScores: { reading: 476, math: 472, science: 485 }, // matches OECD exactly
  proficiencyLevels: {
    reading: { low: 10, med: 80, high: 10 },
    math: { low: 10, med: 80, high: 10 },
    science: { low: 10, med: 80, high: 10 }
  },
  genderScores: {
    reading: { girls: 476, boys: 476 },
    math: { girls: 472, boys: 472 },
    science: { girls: 485, boys: 485 }
  },
  studentVoice: {
    belonging: 0.25, // intermediate
    disciplinaryClimate: 0.15, // intermediate
    feelingSafe: 0.0,
    teacherRelation: 0.0,
    growthMindset: 0.30 // intermediate
  }
};

describe('NarrativeInsights Component Coverage Tests', () => {
  it('should render correct text when scores exactly match OECD average', () => {
    render(
      <NarrativeInsights
        branch={mockBranchBase}
        simulatedScores={{ reading: 476, math: 472, science: 485 }}
        voiceScores={{
          belonging: 0.25,
          disciplinaryClimate: 0.15,
          feelingSafe: 0.0,
          teacherRelation: 0.0,
          growthMindset: 0.30
        }}
        escsDelta={0}
      />
    );

    const summary = screen.getByText(/Test Branch has an overall estimated academic average/i);
    expect(summary).toBeInTheDocument();
    expect(summary).toHaveTextContent('0 points higher than the OECD average of 478 points');
  });

  it('should cover the fallback "No significant structural performance issues identified" when opportunities are empty', () => {
    render(
      <NarrativeInsights
        branch={mockBranchBase}
        simulatedScores={{ reading: 500, math: 500, science: 500 }} // higher than OECD
        voiceScores={{
          belonging: 0.25, // in [0.20, 0.30) -> no opportunity, no strength
          disciplinaryClimate: 0.15, // in [0.05, 0.3) -> no opportunity, no strength
          feelingSafe: 0.0,
          teacherRelation: 0.0,
          growthMindset: 0.30 // in [0.20, 0.35) -> no opportunity, no strength
        }}
        escsDelta={0}
      />
    );

    expect(screen.getByText(/No significant structural performance issues identified/i)).toBeInTheDocument();
  });

  it('should render warning for gender gap and low voice scores when present', () => {
    const branchWithGaps: BranchData = {
      ...mockBranchBase,
      genderScores: {
        reading: { girls: 500, boys: 480 }, // gap 20 > 10
        math: { girls: 450, boys: 470 }, // gap 20 > 10
        science: { girls: 485, boys: 485 }
      }
    };

    render(
      <NarrativeInsights
        branch={branchWithGaps}
        simulatedScores={{ reading: 450, math: 450, science: 450 }} // below OECD
        voiceScores={{
          belonging: 0.1, // < 0.20 -> opportunity
          disciplinaryClimate: 0.01, // < 0.05 -> opportunity
          feelingSafe: 0.0,
          teacherRelation: 0.0,
          growthMindset: 0.15 // < 0.20 -> opportunity
        }}
        escsDelta={-0.5}
      />
    );

    expect(screen.getByText(/A noticeable gender gap of 20 points in Mathematics/i)).toBeInTheDocument();
    expect(screen.getByText(/A significant gender gap of 20 points in Reading/i)).toBeInTheDocument();
    expect(screen.getByText(/student sense of school belonging index is low/i)).toBeInTheDocument();
    expect(screen.getByText(/disciplinary climate is negative or near-zero/i)).toBeInTheDocument();
    expect(screen.getByText(/growth mindset is moderate to low/i)).toBeInTheDocument();
  });

  it('should render key strengths when voice scores and cognitive scores are high', () => {
    render(
      <NarrativeInsights
        branch={mockBranchBase}
        simulatedScores={{ reading: 520, math: 510, science: 530 }} // above OECD
        voiceScores={{
          belonging: 0.4, // >= 0.3 -> strength
          disciplinaryClimate: 0.35, // >= 0.3 -> strength
          feelingSafe: 0.0,
          teacherRelation: 0.0,
          growthMindset: 0.45 // >= 0.35 -> strength
        }}
        escsDelta={1.5}
      />
    );

    expect(screen.getByText(/Reading performance is strong/i)).toBeInTheDocument();
    expect(screen.getByText(/Mathematics average is highly competitive/i)).toBeInTheDocument();
    expect(screen.getByText(/Scientific reasoning metrics exceed/i)).toBeInTheDocument();
    expect(screen.getByText(/Disciplinary climate sits at an exceptional level/i)).toBeInTheDocument();
    expect(screen.getByText(/Sense of belonging is highly positive/i)).toBeInTheDocument();
    expect(screen.getByText(/Growth mindset index is outstanding/i)).toBeInTheDocument();
  });
});
