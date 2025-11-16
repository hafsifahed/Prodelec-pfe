// src/statistics/interfaces/charts-stats.interface.ts
export interface ChartData {
  series: number[];
  labels: string[];
  colors: string[];
  total: number;
}

export interface AvisDetail {
  username: string;
  partnerName: string;
  score: number;
}

export interface ChartsStatistics {
  reclamations: ChartData;
  cahiersDesCharges: ChartData;
  devis: ChartData;
  projects: ChartData;
  avis: ChartData & {
    average: number;
    totalAvis: number;
    details: AvisDetail[];
  };
  aiAnalysis?: {
    insights: string;
    trends: string[];
    recommendations: string[];
    riskAreas: string[];
  };
}

export interface UserFilter {
  id: number;
  email: string;
  username: string;
  partner?: { id: number; name: string };
}

export interface PartnerFilter {
  id: number;
  name: string;
}