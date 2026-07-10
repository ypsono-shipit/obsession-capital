export interface MetricConfig {
  name: string;
  unit: string;
  weeklyGoal: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  value: number;
  note: string;
}

export interface ForgeIdea {
  id: string;
  title: string;
  category: "Side Hustle" | "Career Advancement" | "Negotiation" | "Skill Prototypes";
  description: string;
  metricsGoals: string;
  githubUrl?: string;
  bizInfo?: string;
  createdAt: string;
  critique?: string;
  assumption?: string;
  experiments?: string[];
  status: "Draft" | "Validation Active" | "Verified" | "Killed";
}

export interface PodMember {
  name: string;
  role: string;
  streak: number;
  commitment: string;
  heatmapSeed: number[]; // Array of 0-4 values for mock mini heatmaps
}

export interface Pod {
  id: string;
  name: string;
  description: string;
  category: string;
  weeklyTarget: string;
  myCommitment: string;
  membersCount: number;
  mockMembers: PodMember[];
}

export interface CodexPlaybook {
  id: string;
  title: string;
  category: string;
  author: string;
  difficulty: string;
  timeline: string;
  metrics: string;
  summary: string;
  steps: string[];
  tests: string[];
}
