import { prisma } from '../db/prisma';

export async function calculateCategoryStats() {
  const resolvedComplaints = await prisma.complaint.findMany({
    where: { status: 'Resolved' },
    include: { resolution: true, feedback: true },
  });

  const categoryStats: Record<
    string,
    { totalResolved: number; totalHours: number; avgRating: number; countRating: number }
  > = {};

  for (const c of resolvedComplaints) {
    if (!categoryStats[c.category]) {
      categoryStats[c.category] = { totalResolved: 0, totalHours: 0, avgRating: 0, countRating: 0 };
    }

    const stat = categoryStats[c.category];
    stat.totalResolved += 1;

    if (c.resolution?.submittedAt && c.createdAt) {
      const diffMs = new Date(c.resolution.submittedAt).getTime() - new Date(c.createdAt).getTime();
      const diffHours = Math.max(1, diffMs / (1000 * 60 * 60));
      stat.totalHours += diffHours;
    }

    if (c.feedback?.rating) {
      stat.avgRating += c.feedback.rating;
      stat.countRating += 1;
    }
  }

  const result: Record<string, { avgHours: number; avgRating: number; totalResolved: number }> = {};
  for (const [cat, s] of Object.entries(categoryStats)) {
    result[cat] = {
      avgHours: s.totalResolved > 0 ? Math.round(s.totalHours / s.totalResolved) : 48,
      avgRating: s.countRating > 0 ? Number((s.avgRating / s.countRating).toFixed(1)) : 4.5,
      totalResolved: s.totalResolved,
    };
  }

  return result;
}
