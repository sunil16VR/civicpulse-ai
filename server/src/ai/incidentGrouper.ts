import { prisma } from '../db/prisma';

export async function groupOrUpdateIncident(complaintId: string, matchedComplaintId?: string) {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
  });

  if (!complaint) return null;

  let incidentIdToUse: string | null = null;

  // Case 1: Matched existing duplicate has an incident already
  if (matchedComplaintId) {
    const matched = await prisma.complaint.findUnique({
      where: { id: matchedComplaintId },
    });
    if (matched?.incidentId) {
      incidentIdToUse = matched.incidentId;
    }
  }

  // Case 2: Create a new incident if duplicate found but no incident exists yet
  if (!incidentIdToUse && matchedComplaintId) {
    const matched = await prisma.complaint.findUnique({
      where: { id: matchedComplaintId },
    });

    if (matched) {
      const newIncident = await prisma.incident.create({
        data: {
          title: `Cluster: ${complaint.category} (${complaint.addressText || 'Campus Area'})`,
          category: complaint.category,
          centroidLat: (complaint.lat + matched.lat) / 2,
          centroidLng: (complaint.lng + matched.lng) / 2,
          complaintCount: 2,
          priorityScore: Math.min(100, Math.max(complaint.priorityScore, matched.priorityScore) + 15),
          departmentId: complaint.departmentId,
          status: 'Active',
        },
      });

      incidentIdToUse = newIncident.id;

      // Attach matched complaint to new incident
      await prisma.complaint.update({
        where: { id: matched.id },
        data: { incidentId: incidentIdToUse, isDuplicate: true },
      });
    }
  }

  // Attach new complaint to incident if resolved
  if (incidentIdToUse) {
    await prisma.complaint.update({
      where: { id: complaint.id },
      data: { incidentId: incidentIdToUse, isDuplicate: true },
    });

    // Recalculate Incident Centroid and Aggregated Priority
    const allClusterComplaints = await prisma.complaint.findMany({
      where: { incidentId: incidentIdToUse },
    });

    const totalCount = allClusterComplaints.length;
    const sumLat = allClusterComplaints.reduce((acc, c) => acc + c.lat, 0);
    const sumLng = allClusterComplaints.reduce((acc, c) => acc + c.lng, 0);
    const maxPriority = Math.max(...allClusterComplaints.map((c) => c.priorityScore));
    
    // Priority escalates with cluster size (+5 pts per extra complaint)
    const aggregatedPriority = Math.min(100, maxPriority + (totalCount - 1) * 5);

    await prisma.incident.update({
      where: { id: incidentIdToUse },
      data: {
        centroidLat: sumLat / totalCount,
        centroidLng: sumLng / totalCount,
        complaintCount: totalCount,
        priorityScore: aggregatedPriority,
      },
    });

    return incidentIdToUse;
  }

  return null;
}
