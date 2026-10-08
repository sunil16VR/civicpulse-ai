import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { runAIPipeline } from '../ai/pipeline';
import { evaluateDuplicate } from '../ai/duplicateDetector';
import { groupOrUpdateIncident } from '../ai/incidentGrouper';
import { predictSLARisk } from '../ai/slaRiskPredictor';

const router = Router();

// 1. Submit Complaint (Smart Submission)
router.post(
  '/',
  authenticateToken,
  upload.array('images', 5),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });

      const { title, description, category: userCategory, lat, lng, addressText, durationDays } = req.body;

      if (!title || !description || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Title, description, lat, and lng are required' });
      }

      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      const parsedDuration = durationDays ? parseInt(durationDays) : 1;

      // Image paths
      const files = req.files as Express.Multer.File[] | undefined;
      const imageUrls = files ? files.map((f) => `/uploads/${f.filename}`) : [];

      // 1. Run AI Core Pipeline
      const aiResult = await runAIPipeline({
        title,
        description,
        durationDays: parsedDuration,
      });

      // Override AI category if user explicitly chose a valid category
      const categoryToUse = userCategory || aiResult.category;

      // Find matching department for category
      const department = await prisma.department.findFirst({
        where: { name: aiResult.recommendedDepartment },
      });

      // Generate display ID (e.g. CP-2026-0001)
      const count = await prisma.complaint.count();
      const year = new Date().getFullYear();
      const displayId = `CP-${year}-${String(count + 1).padStart(4, '0')}`;

      // 2. Evaluate Duplicates against existing active complaints
      const existingActive = await prisma.complaint.findMany({
        where: {
          status: { notIn: ['Resolved', 'Verified'] },
        },
      });

      const dupResult = evaluateDuplicate(
        {
          category: categoryToUse,
          lat: parsedLat,
          lng: parsedLng,
          title,
          description: aiResult.translatedDescription,
        },
        existingActive
      );

      // Adjust priority if duplicates exist
      let finalPriorityScore = aiResult.priorityScore;
      let reasons = [...aiResult.priorityReasons];

      if (dupResult.isDuplicate) {
        finalPriorityScore = Math.min(100, finalPriorityScore + 15);
        reasons.push(`Duplicate Cluster: Matched duplicate complaint (${dupResult.reason})`);
      }

      // Create Complaint in DB
      const complaint = await prisma.complaint.create({
        data: {
          displayId,
          title,
          description,
          originalLanguage: aiResult.originalLanguage,
          translatedDescription: aiResult.translatedDescription,
          category: categoryToUse,
          lat: parsedLat,
          lng: parsedLng,
          addressText: addressText || 'Campus Area',
          images: JSON.stringify(imageUrls),
          citizenId: req.user.id,
          severity: aiResult.severity,
          safetyImpact: aiResult.safetyImpact,
          publicImpact: aiResult.publicImpact,
          affectedPeople: aiResult.affectedPeople,
          durationDays: parsedDuration,
          priorityScore: finalPriorityScore,
          priorityReasons: JSON.stringify(reasons),
          departmentId: department?.id || null,
          slaHours: aiResult.slaHours,
          slaDeadline: aiResult.slaDeadline,
          slaRisk: 'Low',
          status: 'Submitted',
          isDuplicate: dupResult.isDuplicate,
        },
        include: {
          department: true,
          citizen: { select: { id: true, name: true, email: true } },
        },
      });

      // Group into Incident if duplicate
      let incidentId: string | null = null;
      if (dupResult.isDuplicate && dupResult.matchedComplaintId) {
        incidentId = await groupOrUpdateIncident(complaint.id, dupResult.matchedComplaintId);
      }

      // Record Initial Status History
      await prisma.statusHistory.create({
        data: {
          complaintId: complaint.id,
          status: 'Submitted',
          changedBy: String(req.user.name),
          note: `Complaint submitted and analyzed by AI (Priority Score: ${finalPriorityScore}/100)`,
        },
      });

      // Return created complaint with full AI analysis output
      res.status(201).json({
        complaint,
        aiAnalysis: {
          ...aiResult,
          duplicateDetected: dupResult.isDuplicate,
          duplicateReason: dupResult.reason,
          incidentId,
        },
      });
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
      res.status(500).json({ error: error.message || 'Failed to submit complaint' });
    }
  }
);

// 2. Search & Filter Complaints (Admin Command Center & Priority Queue)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      category,
      departmentId,
      status,
      slaRisk,
      priorityMin,
      priorityMax,
      sortBy,
      order,
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { displayId: { contains: String(search) } },
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
        { addressText: { contains: String(search) } },
      ];
    }

    if (category) where.category = String(category);
    if (departmentId) where.departmentId = String(departmentId);
    if (status) where.status = String(status);
    if (slaRisk) where.slaRisk = String(slaRisk);

    if (priorityMin || priorityMax) {
      where.priorityScore = {};
      if (priorityMin) where.priorityScore.gte = parseInt(String(priorityMin));
      if (priorityMax) where.priorityScore.lte = parseInt(String(priorityMax));
    }

    const sortField = sortBy ? String(sortBy) : 'priorityScore';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      include: {
        department: true,
        citizen: { select: { id: true, name: true, email: true } },
        assignedOfficer: { select: { id: true, name: true, email: true, phone: true } },
        incident: true,
        resolution: true,
        feedback: true,
      },
    });

    // Predict real-time SLA risk for active complaints
    const complaintsWithRisk = complaints.map((c) => {
      const riskPredict = predictSLARisk({
        createdAt: c.createdAt,
        slaDeadline: c.slaDeadline,
        status: c.status,
        priorityScore: c.priorityScore,
        assignedOfficerId: c.assignedOfficerId,
      });

      return {
        ...c,
        calculatedSlaRisk: riskPredict.slaRisk,
        slaRiskReason: riskPredict.reason,
      };
    });

    res.json({ complaints: complaintsWithRisk });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// 3. Citizen's My Complaints List
router.get('/my', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });

    const complaints = await prisma.complaint.findMany({
      where: { citizenId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        department: true,
        assignedOfficer: { select: { id: true, name: true, phone: true } },
        resolution: true,
        feedback: true,
        incident: true,
      },
    });

    res.json({ complaints });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch citizen complaints' });
  }
});

// 4. Officer's Assigned Complaints
router.get('/assigned', authenticateToken, requireRole('OFFICER', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });

    const complaints = await prisma.complaint.findMany({
      where: { assignedOfficerId: req.user.id },
      orderBy: [{ priorityScore: 'desc' }, { slaDeadline: 'asc' }],
      include: {
        department: true,
        citizen: { select: { id: true, name: true, phone: true } },
        resolution: true,
        incident: true,
      },
    });

    res.json({ complaints });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch officer tasks' });
  }
});

// 5. Department Complaints (Department Head View)
router.get('/department', authenticateToken, requireRole('DEPARTMENT_HEAD', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });

    const deptId = req.user.departmentId;
    const complaints = await prisma.complaint.findMany({
      where: deptId ? { departmentId: deptId } : {},
      orderBy: { priorityScore: 'desc' },
      include: {
        department: true,
        citizen: { select: { id: true, name: true } },
        assignedOfficer: { select: { id: true, name: true, phone: true } },
        resolution: true,
        feedback: true,
      },
    });

    res.json({ complaints });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch department complaints' });
  }
});

// 6. Get Complaint Details by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaintId = String(req.params.id);
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        department: true,
        citizen: { select: { id: true, name: true, email: true, phone: true } },
        assignedOfficer: { select: { id: true, name: true, email: true, phone: true } },
        incident: {
          include: {
            complaints: { select: { id: true, displayId: true, title: true, priorityScore: true, status: true } },
          },
        },
        statusHistory: { orderBy: { timestamp: 'asc' } },
        resolution: true,
        feedback: true,
        overrideLogs: { orderBy: { timestamp: 'desc' } },
      },
    });

    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const riskPredict = predictSLARisk({
      createdAt: complaint.createdAt,
      slaDeadline: complaint.slaDeadline,
      status: complaint.status,
      priorityScore: complaint.priorityScore,
      assignedOfficerId: complaint.assignedOfficerId,
    });

    res.json({
      complaint: {
        ...complaint,
        calculatedSlaRisk: riskPredict.slaRisk,
        slaRiskReason: riskPredict.reason,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch complaint details' });
  }
});

// 7. Officer Assignment (Admin / Department Head)
router.put('/:id/assign', authenticateToken, requireRole('ADMIN', 'DEPARTMENT_HEAD'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaintId = String(req.params.id);
    const { officerId } = req.body;
    if (!officerId) return res.status(400).json({ error: 'Officer ID is required' });

    const officer = await prisma.user.findUnique({ where: { id: String(officerId) } });
    if (!officer) return res.status(404).json({ error: 'Officer not found' });

    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        assignedOfficerId: String(officerId),
        status: 'Assigned',
      },
      include: { assignedOfficer: true, department: true },
    });

    const userName = req.user ? String(req.user.name) : 'Admin';
    await prisma.statusHistory.create({
      data: {
        complaintId: complaint.id,
        status: 'Assigned',
        changedBy: userName,
        note: `Assigned to Field Officer ${officer.name}`,
      },
    });

    res.json({ complaint });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to assign officer' });
  }
});

// 8. Officer Status Update (Assigned -> In_Progress)
router.put('/:id/status', authenticateToken, requireRole('OFFICER', 'ADMIN', 'DEPARTMENT_HEAD'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaintId = String(req.params.id);
    const { status, note } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status: String(status) },
    });

    const userName = req.user ? String(req.user.name) : 'Officer';
    await prisma.statusHistory.create({
      data: {
        complaintId: complaint.id,
        status: String(status),
        changedBy: userName,
        note: note ? String(note) : `Status updated to ${status}`,
      },
    });

    res.json({ complaint });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// 9. Submit Resolution Proof (Officer)
router.post(
  '/:id/resolution',
  authenticateToken,
  requireRole('OFFICER', 'ADMIN'),
  upload.array('proofImages', 5),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const complaintId = String(req.params.id);
      const { description } = req.body;
      if (!description) return res.status(400).json({ error: 'Resolution description is required' });

      const files = req.files as Express.Multer.File[] | undefined;
      const proofImageUrls = files ? files.map((f) => `/uploads/${f.filename}`) : [];

      const resolution = await prisma.resolution.upsert({
        where: { complaintId },
        update: {
          officerId: String(req.user!.id),
          description: String(description),
          proofImages: JSON.stringify(proofImageUrls),
          submittedAt: new Date(),
          rejected: false,
        },
        create: {
          complaintId,
          officerId: String(req.user!.id),
          description: String(description),
          proofImages: JSON.stringify(proofImageUrls),
        },
      });

      const complaint = await prisma.complaint.update({
        where: { id: complaintId },
        data: { status: 'Resolution_Submitted' },
      });

      const userName = req.user ? String(req.user.name) : 'Officer';
      await prisma.statusHistory.create({
        data: {
          complaintId: complaint.id,
          status: 'Resolution_Submitted',
          changedBy: userName,
          note: 'Resolution proof submitted; pending Admin verification',
        },
      });

      res.json({ complaint, resolution });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to submit resolution proof' });
    }
  }
);

// 10. Admin Resolution Verification (Verify vs Reject)
router.put('/:id/verify', authenticateToken, requireRole('ADMIN', 'DEPARTMENT_HEAD'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaintId = String(req.params.id);
    const { approved, verificationNote } = req.body;

    const resolution = await prisma.resolution.findUnique({
      where: { complaintId },
    });

    if (!resolution) return res.status(404).json({ error: 'Resolution proof not found' });

    const userName = req.user ? String(req.user.name) : 'Admin';

    if (approved) {
      await prisma.resolution.update({
        where: { complaintId },
        data: {
          verifiedBy: userName,
          verifiedAt: new Date(),
          verificationNote: verificationNote ? String(verificationNote) : 'Approved by Admin',
          rejected: false,
        },
      });

      const complaint = await prisma.complaint.update({
        where: { id: complaintId },
        data: { status: 'Resolved' },
      });

      await prisma.statusHistory.create({
        data: {
          complaintId: complaint.id,
          status: 'Resolved',
          changedBy: userName,
          note: 'Resolution verified and approved. Pending citizen confirmation.',
        },
      });

      res.json({ complaint, message: 'Resolution verified successfully' });
    } else {
      // Rejection sends complaint back to In_Progress
      await prisma.resolution.update({
        where: { complaintId },
        data: {
          rejected: true,
          verificationNote: verificationNote ? String(verificationNote) : 'Rejected by Admin',
        },
      });

      const complaint = await prisma.complaint.update({
        where: { id: complaintId },
        data: { status: 'In_Progress' },
      });

      await prisma.statusHistory.create({
        data: {
          complaintId: complaint.id,
          status: 'In_Progress',
          changedBy: userName,
          note: `Resolution proof rejected: ${verificationNote ? String(verificationNote) : 'Requires additional work'}`,
        },
      });

      res.json({ complaint, message: 'Resolution rejected and returned to officer' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to verify resolution' });
  }
});

// 11. Citizen Confirmation & Reopening
router.post('/:id/confirm', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaintId = String(req.params.id);
    const { confirmed } = req.body;
    const userName = req.user ? String(req.user.name) : 'Citizen';

    if (confirmed) {
      await prisma.feedback.upsert({
        where: { complaintId },
        update: { citizenConfirmedResolved: true },
        create: {
          complaintId,
          rating: 5,
          citizenConfirmedResolved: true,
        },
      });

      await prisma.statusHistory.create({
        data: {
          complaintId,
          status: 'Resolved',
          changedBy: userName,
          note: 'Citizen confirmed resolution: Fixed! 🎉',
        },
      });

      res.json({ message: 'Resolution confirmed by citizen' });
    } else {
      res.json({ message: 'Citizen indicated issue is not fixed' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to process confirmation' });
  }
});

// 12. Complaint Reopening
router.post('/:id/reopen', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaintId = String(req.params.id);
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Reopen reason is required' });

    const existing = await prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!existing) return res.status(404).json({ error: 'Complaint not found' });

    const userName = req.user ? String(req.user.name) : 'Citizen';

    // Boost priority score by 20 pts for reopened issues
    const boostedScore = Math.min(100, existing.priorityScore + 20);
    const existingReasons = JSON.parse(existing.priorityReasons || '[]');
    existingReasons.push(`Reopened by Citizen (+20 pts): ${reason}`);

    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: 'Reopened',
        priorityScore: boostedScore,
        priorityReasons: JSON.stringify(existingReasons),
      },
    });

    await prisma.statusHistory.create({
      data: {
        complaintId: complaint.id,
        status: 'Reopened',
        changedBy: userName,
        note: `Complaint reopened by citizen: "${reason}". Priority boosted to ${boostedScore}/100.`,
      },
    });

    res.json({ complaint });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reopen complaint' });
  }
});

// 13. Submit Feedback & Rating
router.post('/:id/feedback', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaintId = String(req.params.id);
    const { rating, comment, citizenConfirmedResolved } = req.body;
    if (!rating) return res.status(400).json({ error: 'Rating (1-5) is required' });

    const feedback = await prisma.feedback.upsert({
      where: { complaintId },
      update: {
        rating: parseInt(String(rating)),
        comment: comment ? String(comment) : null,
        citizenConfirmedResolved: citizenConfirmedResolved !== undefined ? Boolean(citizenConfirmedResolved) : true,
      },
      create: {
        complaintId,
        rating: parseInt(String(rating)),
        comment: comment ? String(comment) : null,
        citizenConfirmedResolved: citizenConfirmedResolved !== undefined ? Boolean(citizenConfirmedResolved) : true,
      },
    });

    res.json({ feedback });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// 14. AI / Admin Override
router.post('/:id/override', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaintId = String(req.params.id);
    const { field, newValue, reason } = req.body;
    if (!field || newValue === undefined || !reason) {
      return res.status(400).json({ error: 'Field, newValue, and reason are required' });
    }

    const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const fieldStr = String(field);
    const newValueStr = String(newValue);
    const reasonStr = String(reason);
    const oldValue = String((complaint as any)[fieldStr] ?? '');

    const updateData: any = {
      aiOverridden: true,
    };

    if (fieldStr === 'priorityScore') {
      updateData.priorityScore = parseInt(newValueStr);
    } else if (fieldStr === 'category') {
      updateData.category = newValueStr;
    } else if (fieldStr === 'departmentId') {
      updateData.departmentId = newValueStr;
    } else if (fieldStr === 'assignedOfficerId') {
      updateData.assignedOfficerId = newValueStr;
      updateData.status = 'Assigned';
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: updateData,
    });

    const adminName = req.user ? String(req.user.name) : 'Admin';
    const adminId = req.user ? String(req.user.id) : 'admin-id';

    await prisma.overrideLog.create({
      data: {
        complaintId: complaint.id,
        adminId,
        field: fieldStr,
        oldValue,
        newValue: newValueStr,
        reason: reasonStr,
      },
    });

    await prisma.statusHistory.create({
      data: {
        complaintId: complaint.id,
        status: updatedComplaint.status,
        changedBy: `${adminName} (Admin Override)`,
        note: `AI Override on ${fieldStr}: changed from "${oldValue}" to "${newValueStr}". Reason: ${reasonStr}`,
      },
    });

    res.json({ complaint: updatedComplaint });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to log override' });
  }
});

export default router;
