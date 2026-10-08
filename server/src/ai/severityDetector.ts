export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface SeverityAssessment {
  severity: SeverityLevel;
  safetyImpact: SeverityLevel;
  publicImpact: SeverityLevel;
  affectedPeople: number;
}

export function detectSeverityRuleBased(text: string, durationDays: number): SeverityAssessment {
  const lower = text.toLowerCase();

  let severity: SeverityLevel = 'Medium';
  let safetyImpact: SeverityLevel = 'Medium';
  let publicImpact: SeverityLevel = 'Medium';
  let affectedPeople = 15;

  // Critical indicators
  if (
    lower.includes('spark') ||
    lower.includes('electric shock') ||
    lower.includes('fire') ||
    lower.includes('collapse') ||
    lower.includes('live wire') ||
    lower.includes('emergency') ||
    lower.includes('hazard') ||
    lower.includes('accident')
  ) {
    severity = 'Critical';
    safetyImpact = 'Critical';
    publicImpact = 'High';
    affectedPeople = 100;
  }
  // High severity indicators
  else if (
    lower.includes('broken for two weeks') ||
    lower.includes('at night') ||
    lower.includes('hostel') ||
    lower.includes('dark') ||
    lower.includes('unsafe') ||
    lower.includes('student') ||
    lower.includes('main road') ||
    lower.includes('major leak') ||
    durationDays >= 7
  ) {
    severity = 'High';
    safetyImpact = 'High';
    publicImpact = 'High';
    affectedPeople = 50;
  }
  // Low severity indicators
  else if (
    lower.includes('minor') ||
    lower.includes('slight') ||
    lower.includes('aesthetic') ||
    lower.includes('small')
  ) {
    severity = 'Low';
    safetyImpact = 'Low';
    publicImpact = 'Low';
    affectedPeople = 5;
  }

  return {
    severity,
    safetyImpact,
    publicImpact,
    affectedPeople,
  };
}
