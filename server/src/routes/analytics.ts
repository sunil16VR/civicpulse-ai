import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { generateCivicInsights } from '../ai/insightGenerator';
import { calculateCategoryStats } from '../ai/learningLoop';
import { predictSLARisk } from '../ai/slaRiskPredictor';

const router = Router();

// 1. Executive Command Center KPIs Summary
router.get('/summary', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalComplaints = await prisma.complaint.count();
    const criticalIssues = await prisma.complaint.count({
      where: { severity: 'Critical' },
    });
    const pending = await prisma.complaint.count({
      where: { status: 'Submitted' },
    });
    const active = await prisma.complaint.count({
      where: { status: { in: ['AI_Analyzed', 'Assigned', 'In_Progress', 'Resolution_Submitted', 'Reopened'] } },
    });
    const resolved = await prisma.complaint.count({
      where: { status: 'Resolved' },
    });
    const duplicatesMerged = await prisma.complaint.count({
      where: { isDuplicate: true },
    });

    const activeComplaints = await prisma.complaint.findMany({
      where: { status: { notIn: ['Resolved', 'Verified'] } },
    });

    const slaAtRisk = activeComplaints.filter((c) => {
      const risk = predictSLARisk({
        createdAt: c.createdAt,
        slaDeadline: c.slaDeadline,
        status: c.status,
        priorityScore: c.priorityScore,
        assignedOfficerId: c.assignedOfficerId,
      });
      return risk.slaRisk === 'High';
    }).length;

    res.json({
      totalComplaints,
      criticalIssues,
      pending,
      active,
      resolved,
      slaAtRisk,
      duplicatesMerged,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

// 2. Hotspots & Spatial Heatmap Aggregation
router.get('/hotspots', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaints = await prisma.complaint.findMany({
      select: { id: true, displayId: true, title: true, category: true, lat: true, lng: true, priorityScore: true, addressText: true },
    });

    // Grid aggregation (~150m grid rounding ~ 0.0015 deg)
    const grid: Record<string, { lat: number; lng: number; count: number; totalPriority: number; categories: Record<string, number>; address: string }> = {};

    complaints.forEach((c) => {
      const key = `${c.lat.toFixed(3)},${c.lng.toFixed(3)}`;
      if (!grid[key]) {
        grid[key] = {
          lat: c.lat,
          lng: c.lng,
          count: 0,
          totalPriority: 0,
          categories: {},
          address: c.addressText || 'Campus Area',
        };
      }
      grid[key].count += 1;
      grid[key].totalPriority += c.priorityScore;
      grid[key].categories[c.category] = (grid[key].categories[c.category] || 0) + 1;
    });

    const hotspots = Object.values(grid).map((g) => {
      const dominantCategory = Object.entries(g.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';
      const avgPriority = Math.round(g.totalPriority / g.count);

      return {
        lat: g.lat,
        lng: g.lng,
        count: g.count,
        avgPriority,
        dominantCategory,
        address: g.address,
        intensity: Math.min(1.0, g.count / 8 + avgPriority / 100),
      };
    }).sort((a, b) => b.count - a.count);

    res.json({
      hotspots,
      points: complaints.map((c) => ({
        id: c.id,
        displayId: c.displayId,
        title: c.title,
        category: c.category,
        lat: c.lat,
        lng: c.lng,
        priority: c.priorityScore,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch hotspots' });
  }
});

// 3. Analytics Charts Data (Recharts)
router.get('/charts', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: { department: true, feedback: true },
    });

    // Category Distribution
    const categoryCounts: Record<string, number> = {};
    complaints.forEach((c) => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Status Distribution
    const statusCounts: Record<string, number> = {};
    complaints.forEach((c) => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });

    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Department Performance
    const departments = await prisma.department.findMany({
      include: { complaints: { include: { feedback: true, resolution: true } } },
    });

    const deptPerformance = departments.map((d) => {
      const total = d.complaints.length;
      const resolved = d.complaints.filter((c) => c.status === 'Resolved').length;
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;

      const ratings = d.complaints
        .map((c) => c.feedback?.rating)
        .filter((r): r is number => r !== undefined);
      const avgRating = ratings.length > 0 ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : 4.5;

      return {
        name: d.name,
        total,
        resolved,
        resolutionRate: rate,
        avgRating,
      };
    });

    // Category Benchmarks from Learning Loop
    const categoryStats = await calculateCategoryStats();

    res.json({
      categoryDistribution,
      statusDistribution,
      deptPerformance,
      categoryStats,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch analytics charts' });
  }
});

// 4. AI Civic Insights
router.get('/insights', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let insights = await prisma.insight.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (insights.length === 0) {
      const generated = await generateCivicInsights();
      for (const item of generated) {
        await prisma.insight.create({
          data: { text: item.text, type: item.type },
        });
      }
      insights = await prisma.insight.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    }

    res.json({ insights });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// 5. Regenerate AI Civic Insights
router.post('/insights/regenerate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.insight.deleteMany({});
    const generated = await generateCivicInsights();
    for (const item of generated) {
      await prisma.insight.create({
        data: { text: item.text, type: item.type },
      });
    }

    const insights = await prisma.insight.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ insights });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to regenerate insights' });
  }
});

export default router;
