export interface BranchData {
  name: string;
  shortName: string;
  students: number;
  gender: {
    boysPercent: number;
    girlsPercent: number;
  };
  escsIndex: number; // Socio-Economic Index
  cognitiveScores: {
    reading: number;
    math: number;
    science: number;
  };
  proficiencyLevels: {
    reading: { low: number; med: number; high: number };
    math: { low: number; med: number; high: number };
    science: { low: number; med: number; high: number };
  };
  genderScores: {
    reading: { girls: number; boys: number };
    math: { girls: number; boys: number };
    science: { girls: number; boys: number };
  };
  studentVoice: {
    belonging: number;
    disciplinaryClimate: number;
    feelingSafe: number;
    teacherRelation: number;
    growthMindset: number;
  };
}

export const BRANCHES_DATA: BranchData[] = [
  {
    name: 'Thakur Complex',
    shortName: 'Thakur',
    students: 108,
    gender: { boysPercent: 48.1, girlsPercent: 51.9 },
    escsIndex: 0.45,
    cognitiveScores: { reading: 516, math: 500, science: 497 },
    proficiencyLevels: {
      reading: { low: 7, med: 83, high: 10 },
      math: { low: 21, med: 66, high: 13 },
      science: { low: 15, med: 80, high: 5 }
    },
    genderScores: {
      reading: { girls: 515, boys: 518 },
      math: { girls: 494, boys: 507 },
      science: { girls: 493, boys: 501 }
    },
    studentVoice: {
      belonging: 0.18,
      disciplinaryClimate: 0.13,
      feelingSafe: 0.49,
      teacherRelation: 0.28,
      growthMindset: 0.37
    }
  },
  {
    name: 'Malad',
    shortName: 'Malad',
    students: 125,
    gender: { boysPercent: 58.4, girlsPercent: 41.6 },
    escsIndex: 0.25,
    cognitiveScores: { reading: 467, math: 474, science: 476 },
    proficiencyLevels: {
      reading: { low: 23, med: 75, high: 3 },
      math: { low: 28, med: 65, high: 7 },
      science: { low: 22, med: 75, high: 3 }
    },
    genderScores: {
      reading: { girls: 480, boys: 458 },
      math: { girls: 453, boys: 489 },
      science: { girls: 474, boys: 477 }
    },
    studentVoice: {
      belonging: 0.30,
      disciplinaryClimate: -0.04,
      feelingSafe: 0.36,
      teacherRelation: 0.12,
      growthMindset: 0.14
    }
  },
  {
    name: 'Ashok Nagar',
    shortName: 'Ashok Nagar',
    students: 114,
    gender: { boysPercent: 56.1, girlsPercent: 43.9 },
    escsIndex: 0.50,
    cognitiveScores: { reading: 472, math: 508, science: 499 },
    proficiencyLevels: {
      reading: { low: 22, med: 75, high: 3 },
      math: { low: 16, med: 71, high: 13 },
      science: { low: 14, med: 79, high: 6 }
    },
    genderScores: {
      reading: { girls: 479, boys: 466 },
      math: { girls: 500, boys: 514 },
      science: { girls: 492, boys: 507 }
    },
    studentVoice: {
      belonging: 0.33,
      disciplinaryClimate: 0.36,
      feelingSafe: 0.64,
      teacherRelation: 0.51,
      growthMindset: 0.42
    }
  }
];

export interface ReferenceData {
  singapore: {
    cognitiveScores: { reading: number; math: number; science: number };
  };
  oecd: {
    cognitiveScores: { reading: number; math: number; science: number };
    studentVoice: {
      belonging: number;
      disciplinaryClimate: number;
      feelingSafe: number;
      teacherRelation: number;
      growthMindset: number;
    };
  };
}

export const REFERENCE_DATA: ReferenceData = {
  singapore: {
    cognitiveScores: { reading: 543, math: 575, science: 561 }
  },
  oecd: {
    cognitiveScores: { reading: 476, math: 472, science: 485 },
    studentVoice: {
      belonging: -0.02,
      disciplinaryClimate: 0.02,
      feelingSafe: 0.00,
      teacherRelation: 0.00,
      growthMindset: 0.02
    }
  }
};

export interface PRData {
  cognitive: {
    cags: { reading: number; math: number; science: number };
    oecd: { reading: number; math: number; science: number };
  };
  wellBeing: {
    labels: string[];
    cags: number[];
    oecd: number[];
  };
  kpis: {
    lifeSatisfaction: { cags: number; oecd: number; delta: number };
    bullyingIndex: { cags: number; oecd: number; delta: number };
    mathPerformance: { cags: number; oecd: number; delta: number };
  };
}

export const PR_DATA: PRData = {
  cognitive: {
    cags: { reading: 484, math: 493, science: 490 },
    oecd: { reading: 476, math: 472, science: 485 },
  },
  wellBeing: {
    labels: ['Family Support', 'Feeling Safe', 'Growth Mindset', 'Teacher Relationship', 'Sense of Belonging'],
    cags: [0.56, 0.49, 0.30, 0.30, 0.27],
    oecd: [0.00, 0.00, 0.02, 0.00, -0.02],
  },
  kpis: {
    lifeSatisfaction: { cags: 7.97, oecd: 6.75, delta: 1.22 },
    bullyingIndex: { cags: -0.41, oecd: 0.00, delta: -0.41 },
    mathPerformance: { cags: 493, oecd: 472, delta: 21 },
  }
};

export const COLOR_MAP = {
  thakur: '#6366F1',     // Indigo
  malad: '#14B8A6',      // Teal
  ashok: '#8B5CF6',      // Violet
  oecd: '#9CA3AF',       // Muted Gray
  singapore: '#F43F5E',  // Coral Red
  girls: '#EC4899',      // Pink
  boys: '#3B82F6',       // Blue
  cags: '#4F46E5',       // Deep Indigo
};
