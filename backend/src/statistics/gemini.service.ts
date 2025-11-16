import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenAI;
  private readonly logger = new Logger(GeminiService.name);

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.error('❌ GEMINI_API_KEY manquante');
      throw new Error('GEMINI_API_KEY requise');
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  // Génération de texte
  async generateText(prompt: string, model = 'models/gemini-2.5-flash'): Promise<string> {
    try {
      const resp = await this.client.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return resp.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Analyse non disponible';
    } catch (err) {
      this.logger.error('Erreur Gemini.generateText', err);
      return 'Erreur lors de la génération IA';
    }
  }

  // Embeddings
  async embedText(text: string, model = 'models/embedding-001'): Promise<number[]> {
    try {
      const resp = await this.client.models.embedContent({
        model,
        contents: [{ role: 'user', parts: [{ text }] }],
      });
      return resp.embeddings?.[0]?.values ?? [];
    } catch (err) {
      this.logger.error('Erreur Gemini.embedText', err);
      return [];
    }
  }

  // Utilisé par AiAnalysisService pour faire l'analyse
  async analyzeStatistics(prompt: string, model = 'models/gemini-2.5-flash'): Promise<string> {
    return this.generateText(prompt, model);
  }
}
