import { SeverityLevel } from './severityDetector';

export function calculateSLA(
  category: string,
  severity: SeverityLevel,
  priorityScore: number
): { slaHours: number; slaDeadline: Date } {
  let hours = 72; // default 72h (Medium)

  if (severity === 'Critical' || priorityScore >= 80) {
    hours = 24; // Critical 24 hours
  } else if (severity === 'High' || priorityScore >= 60) {
    hours = 48; // High 48 hours
  } else if (priorityScore >= 35) {
    hours = 72; // Medium 72 hours
  } else {
    hours = 120; // Low 120 hours (5 days)
  }

  const slaDeadline = new Date();
  slaDeadline.setHours(slaDeadline.getHours() + hours);

  return {
    slaHours: hours,
    slaDeadline,
  };
}
