import { Injectable, Logger } from '@nestjs/common';
import { ChartsStatistics } from './dto/charts-stats.interface';
import { GlobalStats } from './dto/global-stats.interface';
import { GeminiService } from './gemini.service';

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);

  constructor(private readonly geminiService: GeminiService) {}

  // -----------------------------
  // Analyse globale
  // -----------------------------
  async analyzeGlobalStats(stats: GlobalStats, period: string = 'month'): Promise<GlobalStats> {
    try {
      if (this.shouldSkipAnalysis(stats)) {
        return {
          ...stats,
          aiAnalysis: this.getDefaultAnalysisResponse(),
        };
      }

      const prompt = `
En tant qu'expert en analyse de données d'entreprise, analyse ces statistiques globales pour la période ${period} et fournis une analyse complète :

STATISTIQUES :
- Commandes totales : ${stats.totalOrders}
- Commandes annulées : ${stats.cancelledOrders} (${stats.totalOrders > 0 ? ((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1) : 0}%)
- Projets total : ${stats.totalProjects}
- Projets complétés : ${stats.completedProjects} (${stats.totalProjects > 0 ? ((stats.completedProjects / stats.totalProjects) * 100).toFixed(1) : 0}%)
- Projets en retard : ${stats.lateProjects} (${stats.totalProjects > 0 ? ((stats.lateProjects / stats.totalProjects) * 100).toFixed(1) : 0}%)
- Note moyenne des avis : ${stats.averageAvis}/100
- Ratio de réclamation : ${stats.reclamationRatio}%
- Total des avis : ${stats.totalAvis}

FORMAT DE RÉPONSE (JSON strict) :
{
  "summary": "Analyse globale en 2-3 phrases",
  "strengths": ["point fort 1", "point fort 2"],
  "weaknesses": ["point faible 1", "point faible 2"],
  "recommendations": ["recommandation 1", "recommandation 2"],
  "overallScore": 85
}

Réponds uniquement avec le JSON valide, sans autre texte.
      `;

      const analysisText = await this.geminiService.analyzeStatistics(prompt);
      const aiAnalysis = this.parseAnalysisResponse(analysisText);

      return { ...stats, aiAnalysis };
    } catch (error) {
      this.logger.error('Erreur analyse IA stats globales', error);
      return { ...stats, aiAnalysis: this.getDefaultAnalysisResponse() };
    }
  }

  // -----------------------------
  // Analyse des graphiques
  // -----------------------------
  async analyzeChartsStatistics(charts: ChartsStatistics): Promise<ChartsStatistics> {
    try {
      const prompt = `
Analyse ces statistiques détaillées et fournis des insights et recommandations actionnables :

DONNÉES DES GRAPHIQUES :
Reclamations : ${charts.reclamations.total}, Cahiers : ${charts.cahiersDesCharges.total}, Devis : ${charts.devis.total}, Projets : ${charts.projects.total}, Avis : ${charts.avis.totalAvis}

FORMAT DE RÉPONSE (JSON strict) :
{
  "insights": "Principales observations en 2-3 phrases",
  "trends": ["tendance 1", "tendance 2"],
  "recommendations": ["recommandation 1", "recommandation 2"],
  "riskAreas": ["zone risque 1", "zone risque 2"]
}

Réponds uniquement avec le JSON valide, sans autre texte.
      `;

      const analysisText = await this.geminiService.analyzeStatistics(prompt);
      const aiAnalysis = this.parseAnalysisResponse(analysisText);

      return { ...charts, aiAnalysis };
    } catch (error) {
      this.logger.error('Erreur analyse IA graphiques', error);
      return {
        ...charts,
        aiAnalysis: {
          insights: 'Analyse temporairement indisponible',
          trends: [],
          recommendations: [],
          riskAreas: [],
        },
      };
    }
  }

  // -----------------------------
  // Helpers
  // -----------------------------
  private parseAnalysisResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (typeof parsed.overallScore === 'number') {
          parsed.overallScore = Math.min(Math.max(parsed.overallScore, 0), 100);
        }
        return parsed;
      }
      throw new Error('Format JSON non trouvé');
    } catch (error) {
      this.logger.warn('Réponse IA mal formatée, utilisation des valeurs par défaut');
      return this.getDefaultAnalysisResponse();
    }
  }

  private shouldSkipAnalysis(stats: GlobalStats): boolean {
    return stats.totalOrders === 0 && stats.totalProjects === 0 && stats.totalAvis === 0;
  }

  private getDefaultAnalysisResponse() {
    return {
      summary: 'Analyse temporairement indisponible',
      strengths: [],
      weaknesses: [],
      recommendations: ['Réessayer plus tard'],
      overallScore: 0,
      insights: 'Impossible de générer des insights automatiques',
      trends: [],
      riskAreas: [],
    };
  }
}
