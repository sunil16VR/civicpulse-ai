import { SeverityLevel } from './severityDetector';

export interface PriorityFactor {
  name: string;
  points: number;
  description: string;
}

export interface PriorityScoreResult {
  score: number;
  factors: PriorityFactor[];
}

export function calculatePriorityScore(params: {
  severity: SeverityLevel;
  safetyImpact: SeverityLevel;
  publicImpact: SeverityLevel;
  durationDays: number;
  affectedPeople: number;
  duplicateCount?: number;
  isHostelArea?: boolean;
}): PriorityScoreResult {
  const factors: PriorityFactor[] = [];
  let totalScore = 0;

  // 1. Severity Contribution
  let severityPoints = 15;
  if (params.severity === 'Critical') severityPoints = 35;
  else if (params.severity === 'High') severityPoints = 25;
  else if (params.severity === 'Medium') severityPoints = 15;
  else if (params.severity === 'Low') severityPoints = 5;

  factors.push({
    name: 'Severity Level',
    points: severityPoints,
    description: `Severity evaluated as ${params.severity} (+${severityPoints} pts)`,
  });
  totalScore += severityPoints;

  // 2. Safety Impact
  let safetyPoints = 10;
  if (params.safetyImpact === 'Critical') safetyPoints = 30;
  else if (params.safetyImpact === 'High') safetyPoints = 20;
  else if (params.safetyImpact === 'Medium') safetyPoints = 10;
  else if (params.safetyImpact === 'Low') safetyPoints = 0;

  if (safetyPoints > 0) {
    factors.push({
      name: 'Safety Risk',
      points: safetyPoints,
      description: `Safety Impact rated ${params.safetyImpact} (+${safetyPoints} pts)`,
    });
    totalScore += safetyPoints;
  }

  // 3. Public Impact
  let publicPoints = 10;
  if (params.publicImpact === 'Critical') publicPoints = 20;
  else if (params.publicImpact === 'High') publicPoints = 15;
  else if (params.publicImpact === 'Medium') publicPoints = 10;
  else if (params.publicImpact === 'Low') publicPoints = 5;

  factors.push({
    name: 'Public Impact',
    points: publicPoints,
    description: `Public disruption rated ${params.publicImpact} (+${publicPoints} pts)`,
  });
  totalScore += publicPoints;

  // 4. Duration
  let durationPoints = 5;
  if (params.durationDays >= 14) durationPoints = 20;
  else if (params.durationDays >= 7) durationPoints = 15;
  else if (params.durationDays >= 3) durationPoints = 10;

  factors.push({
    name: 'Unresolved Duration',
    points: durationPoints,
    description: `${params.durationDays} day(s) persistent issue (+${durationPoints} pts)`,
  });
  totalScore += durationPoints;

  // 5. Affected Population
  let affectedPoints = 5;
  if (params.affectedPeople > 50) affectedPoints = 15;
  else if (params.affectedPeople >= 20) affectedPoints = 10;

  factors.push({
    name: 'Affected People',
    points: affectedPoints,
    description: `Est. ${params.affectedPeople}+ citizens affected (+${affectedPoints} pts)`,
  });
  totalScore += affectedPoints;

  // 6. Duplicate Complaints Aggregation
  const duplicates = params.duplicateCount || 0;
  if (duplicates > 0) {
    const dupPoints = Math.min(25, duplicates * 5);
    factors.push({
      name: 'Duplicate Cluster',
      points: dupPoints,
      description: `${duplicates} similar complaint(s) reported (+${dupPoints} pts)`,
    });
    totalScore += dupPoints;
  }

  // 7. Special Sensitivity Location (Hostels, Main Junctions)
  if (params.isHostelArea) {
    factors.push({
      name: 'Sensitive Zone',
      points: 10,
      description: 'Proximity to student hostel or night foot-traffic zone (+10 pts)',
    });
    totalScore += 10;
  }

  const finalScore = Math.min(100, Math.max(1, totalScore));

  return {
    score: finalScore,
    factors,
  };
}
