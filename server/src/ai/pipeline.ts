import { GoogleGenAI } from '@google/genai';
import { classifyCategoryRuleBased, ComplaintCategory } from './classifier';
import { detectSeverityRuleBased, SeverityAssessment } from './severityDetector';
import { calculatePriorityScore, PriorityScoreResult } from './priorityScorer';
import { formatPriorityExplanation } from './explainer';
import { routeToDepartment } from './router';
import { calculateSLA } from './slaManager';

export interface AIAnalysisOutput {
  originalLanguage: 'en' | 'ta';
  translatedDescription: string;
  category: ComplaintCategory;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  safetyImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  publicImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedPeople: number;
  durationDays: number;
  priorityScore: number;
  priorityReasons: string[];
  recommendedDepartment: string;
  slaHours: number;
  slaDeadline: Date;
}

// Simple Tamil detection helper
function isTamilText(text: string): boolean {
  const tamilRegex = /[\u0B80-\u0BFF]/;
  return tamilRegex.test(text);
}

// Fallback Tamil translation dictionary for common Tamil complaint terms
function translateTamilFallback(text: string): string {
  let translated = text;
  const map: Record<string, string> = {
    'மின் விளக்கு எரியவில்லை': 'Streetlight is not working',
    'தெரு விளக்கு பழுது': 'Streetlight broken',
    'குடிநீர் கசிவு': 'Drinking water leakage',
    'சாக்கடை அடைப்பு': 'Sewage clog overflow',
    'சாலை பழுது': 'Road damaged pothole',
    'குப்பை அள்ளப்படவில்லை': 'Garbage not collected',
    'கல்லூரி விடுதி': 'College hostel',
  };

  for (const [ta, en] of Object.entries(map)) {
    translated = translated.replace(new RegExp(ta, 'g'), en);
  }

  if (translated === text) {
    translated = `[Translated from Tamil]: ${text}`;
  }
  return translated;
}

export async function runAIPipeline(params: {
  title: string;
  description: string;
  durationDays?: number;
}): Promise<AIAnalysisOutput> {
  const durationDays = params.durationDays || 1;
  const fullText = `${params.title} ${params.description}`;
  const isTa = isTamilText(fullText);
  const originalLanguage: 'en' | 'ta' = isTa ? 'ta' : 'en';

  let translatedDescription = params.description;

  const apiKey = process.env.GEMINI_API_KEY;

  // Dual-mode Execution: Try Gemini API if key is available
  if (apiKey && apiKey.trim().length > 0) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are an expert AI Civil Engineering & Public Complaint Intelligence System.
Analyze the following complaint:
Title: "${params.title}"
Description: "${params.description}"
Duration Days: ${durationDays}

Return ONLY valid JSON matching this structure:
{
  "translatedDescription": "English translation if input is Tamil, else original text",
  "category": "Streetlight/Electrical" | "Pothole/Road" | "Water Leakage" | "Garbage/Sanitation" | "Drainage" | "Infrastructure Damage" | "Other",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "safetyImpact": "Low" | "Medium" | "High" | "Critical",
  "publicImpact": "Low" | "Medium" | "High" | "Critical",
  "affectedPeople": number
}
`;
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.category && parsed.severity) {
        translatedDescription = parsed.translatedDescription || params.description;
        const category: ComplaintCategory = parsed.category;
        const severity = parsed.severity;
        const safetyImpact = parsed.safetyImpact || 'Medium';
        const publicImpact = parsed.publicImpact || 'Medium';
        const affectedPeople = parsed.affectedPeople || 20;

        const isHostelArea = fullText.toLowerCase().includes('hostel');

        const scoreRes = calculatePriorityScore({
          severity,
          safetyImpact,
          publicImpact,
          durationDays,
          affectedPeople,
          isHostelArea,
        });

        const explanation = formatPriorityExplanation(scoreRes.score, scoreRes.factors);
        const dept = routeToDepartment(category);
        const sla = calculateSLA(category, severity, scoreRes.score);

        return {
          originalLanguage,
          translatedDescription,
          category,
          severity,
          safetyImpact,
          publicImpact,
          affectedPeople,
          durationDays,
          priorityScore: scoreRes.score,
          priorityReasons: explanation.reasons,
          recommendedDepartment: dept,
          slaHours: sla.slaHours,
          slaDeadline: sla.slaDeadline,
        };
      }
    } catch (err) {
      console.warn('⚡ Gemini API call failed or unconfigured, falling back to rule-based AI engine:', err);
    }
  }

  // Rule-based / Keyword Mock Engine Fallback (Guarantees offline functionality)
  if (isTa) {
    translatedDescription = translateTamilFallback(params.description);
  }

  const category = classifyCategoryRuleBased(`${params.title} ${translatedDescription}`);
  const severityAssessment = detectSeverityRuleBased(
    `${params.title} ${translatedDescription}`,
    durationDays
  );
  const isHostelArea = `${params.title} ${translatedDescription}`.toLowerCase().includes('hostel');

  const scoreRes = calculatePriorityScore({
    severity: severityAssessment.severity,
    safetyImpact: severityAssessment.safetyImpact,
    publicImpact: severityAssessment.publicImpact,
    durationDays,
    affectedPeople: severityAssessment.affectedPeople,
    isHostelArea,
  });

  const explanation = formatPriorityExplanation(scoreRes.score, scoreRes.factors);
  const dept = routeToDepartment(category);
  const sla = calculateSLA(category, severityAssessment.severity, scoreRes.score);

  return {
    originalLanguage,
    translatedDescription,
    category,
    severity: severityAssessment.severity,
    safetyImpact: severityAssessment.safetyImpact,
    publicImpact: severityAssessment.publicImpact,
    affectedPeople: severityAssessment.affectedPeople,
    durationDays,
    priorityScore: scoreRes.score,
    priorityReasons: explanation.reasons,
    recommendedDepartment: dept,
    slaHours: sla.slaHours,
    slaDeadline: sla.slaDeadline,
  };
}
