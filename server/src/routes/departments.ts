import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get All Departments
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        users: {
          select: { id: true, name: true, role: true, email: true, phone: true },
        },
        _count: {
          select: { complaints: true, incidents: true },
        },
      },
    });

    res.json({ departments });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get Officers for Assignment with Workload Count
router.get('/officers', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { departmentId } = req.query;

    const where: any = { role: 'OFFICER' };
    if (departmentId) where.departmentId = String(departmentId);

    const officers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        departmentId: true,
        department: { select: { name: true } },
        assignedComplaints: {
          where: { status: { notIn: ['Resolved', 'Verified'] } },
          select: { id: true, priorityScore: true, status: true },
        },
      },
    });

    const officersWithWorkload = officers.map((o) => ({
      id: o.id,
      name: o.name,
      email: o.email,
      phone: o.phone,
      departmentId: o.departmentId,
      departmentName: o.department?.name,
      activeTasksCount: o.assignedComplaints.length,
      highPriorityCount: o.assignedComplaints.filter((c) => c.priorityScore >= 70).length,
    }));

    res.json({ officers: officersWithWorkload });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch officers' });
  }
});

export default router;
