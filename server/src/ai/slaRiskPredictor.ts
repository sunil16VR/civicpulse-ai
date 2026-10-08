export interface SLARiskResult {
  slaRisk: 'Low' | 'Medium' | 'High';
  reason: string;
}

export function predictSLARisk(params: {
  createdAt: Date;
  slaDeadline: Date;
  status: string;
  priorityScore: number;
  assignedOfficerId?: string | null;
  officerActiveTasksCount?: number;
}): SLARiskResult {
  const now = new Date().getTime();
  const deadline = new Date(params.slaDeadline).getTime();
  const created = new Date(params.createdAt).getTime();

  const totalWindow = deadline - created;
  const elapsed = now - created;

  const hoursRemaining = Math.max(0, (deadline - now) / (1000 * 60 * 60));
  const percentElapsed = totalWindow > 0 ? (elapsed / totalWindow) * 100 : 100;

  // Already expired
  if (now > deadline && params.status !== 'Resolved' && params.status !== 'Verified') {
    return {
      slaRisk: 'High',
      reason: `SLA expired ${Math.abs(Math.round(hoursRemaining))}h ago! Immediate action required.`,
    };
  }

  // Unassigned high priority complaints after 24h
  if (!params.assignedOfficerId && percentElapsed > 40) {
    return {
      slaRisk: 'High',
      reason: 'Complaint remains unassigned to any officer past 40% of SLA time window.',
    };
  }

  // Officer overloaded (>4 active tasks)
  if ((params.officerActiveTasksCount || 0) >= 4) {
    return {
      slaRisk: 'High',
      reason: `Assigned officer is overloaded (${params.officerActiveTasksCount} active complaints).`,
    };
  }

  // Over 70% time elapsed and still not in progress
  if (percentElapsed >= 70 && params.status !== 'In_Progress') {
    return {
      slaRisk: 'High',
      reason: `${Math.round(percentElapsed)}% SLA time elapsed; status is still "${params.status}".`,
    };
  }

  // Moderate risk (50% - 70% elapsed)
  if (percentElapsed >= 50) {
    return {
      slaRisk: 'Medium',
      reason: `50% SLA duration passed (${Math.round(hoursRemaining)}h remaining).`,
    };
  }

  return {
    slaRisk: 'Low',
    reason: `Normal resolution window (${Math.round(hoursRemaining)}h remaining).`,
  };
}
