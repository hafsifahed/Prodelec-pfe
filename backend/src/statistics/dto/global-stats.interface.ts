// src/statistics/interfaces/global-stats.interface.ts
export interface GlobalStats {
  totalOrders: number;
  cancelledOrders: number;
  totalProjects: number;
  completedProjects: number;
  lateProjects: number;
  averageAvis: number;
  reclamationRatio: number;
  totalAvis: number;
  newOrders?: number;
  newProjects?: number;
  sessions?: {
    totalEmployees: number;
    connectedEmployees: number;
    totalClients: number;
    connectedClients: number;
  };
  aiAnalysis?: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    overallScore: number;
  };
}

export interface PeriodStats {
  period: string;
  data: GlobalStats;
  comparison?: {
    previousPeriod: string;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  includeAiAnalysis?: boolean;
}