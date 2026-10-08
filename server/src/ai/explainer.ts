import { PriorityFactor } from './priorityScorer';

export function formatPriorityExplanation(score: number, factors: PriorityFactor[]): {
  summaryText: string;
  reasons: string[];
} {
  const sorted = [...factors].sort((a, b) => b.points - a.points);
  
  const reasons = sorted.map(
    (f) => `${f.name} ${f.description.includes('rated') ? '' : ''}: +${f.points} pts (${f.description})`
  );

  const topThree = sorted.slice(0, 3).map((f) => `${f.name} (+${f.points})`).join(' | ');
  const summaryText = `Priority ${score}/100 driven by: ${topThree}`;

  return {
    summaryText,
    reasons,
  };
}
