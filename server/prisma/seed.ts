import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CivicPulse AI database seeding...');

  // Clear existing data
  await prisma.overrideLog.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.resolution.deleteMany({});
  await prisma.statusHistory.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.incident.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.insight.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Create Departments
  const electricalDept = await prisma.department.create({
    data: {
      name: 'Electrical Maintenance',
      categoriesHandled: JSON.stringify(['Streetlight/Electrical']),
    },
  });

  const roadsDept = await prisma.department.create({
    data: {
      name: 'Roads & Infrastructure',
      categoriesHandled: JSON.stringify(['Pothole/Road', 'Infrastructure Damage']),
    },
  });

  const waterDept = await prisma.department.create({
    data: {
      name: 'Water Supply & Plumbing',
      categoriesHandled: JSON.stringify(['Water Leakage']),
    },
  });

  const sanitationDept = await prisma.department.create({
    data: {
      name: 'Sanitation & Waste Management',
      categoriesHandled: JSON.stringify(['Garbage/Sanitation', 'Drainage']),
    },
  });

  // 2. Create Users (Admin, Dept Heads, Officers, Citizens)
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin (Chief Control)',
      email: 'admin@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      phone: '+91 9876543210',
    },
  });

  // Department Heads
  const headElectrical = await prisma.user.create({
    data: {
      name: 'Dr. Arul Prakash',
      email: 'head.electrical@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'DEPARTMENT_HEAD',
      departmentId: electricalDept.id,
      phone: '+91 9876543211',
    },
  });

  const headRoads = await prisma.user.create({
    data: {
      name: 'Er. Rajesh Varma',
      email: 'head.roads@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'DEPARTMENT_HEAD',
      departmentId: roadsDept.id,
      phone: '+91 9876543212',
    },
  });

  const headWater = await prisma.user.create({
    data: {
      name: 'Mrs. Sangeetha Nathan',
      email: 'head.water@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'DEPARTMENT_HEAD',
      departmentId: waterDept.id,
      phone: '+91 9876543213',
    },
  });

  const headSanitation = await prisma.user.create({
    data: {
      name: 'Mr. Sundar Raj',
      email: 'head.sanitation@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'DEPARTMENT_HEAD',
      departmentId: sanitationDept.id,
      phone: '+91 9876543214',
    },
  });

  // Field Officers
  const officerRamesh = await prisma.user.create({
    data: {
      name: 'Ramesh Kumar (Electrical Tech)',
      email: 'officer.ramesh@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'OFFICER',
      departmentId: electricalDept.id,
      phone: '+91 9876543220',
    },
  });

  const officerSuresh = await prisma.user.create({
    data: {
      name: 'Suresh Babu (Linesman)',
      email: 'officer.suresh@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'OFFICER',
      departmentId: electricalDept.id,
      phone: '+91 9876543221',
    },
  });

  const officerAnand = await prisma.user.create({
    data: {
      name: 'Anand Civil Overseer',
      email: 'officer.anand@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'OFFICER',
      departmentId: roadsDept.id,
      phone: '+91 9876543222',
    },
  });

  const officerDeepa = await prisma.user.create({
    data: {
      name: 'Deepa Water Inspector',
      email: 'officer.deepa@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'OFFICER',
      departmentId: waterDept.id,
      phone: '+91 9876543223',
    },
  });

  const officerSelvam = await prisma.user.create({
    data: {
      name: 'Selvam Sanitation Supervisor',
      email: 'officer.selvam@civicpulse.org',
      passwordHash: defaultPasswordHash,
      role: 'OFFICER',
      departmentId: sanitationDept.id,
      phone: '+91 9876543224',
    },
  });

  // Citizens
  const citizenPriya = await prisma.user.create({
    data: {
      name: 'Priya Sundaram',
      email: 'priya.citizen@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'CITIZEN',
      phone: '+91 9876543230',
      preferredLanguage: 'ta',
    },
  });

  const citizenKarthik = await prisma.user.create({
    data: {
      name: 'Karthik Student',
      email: 'karthik.student@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'CITIZEN',
      phone: '+91 9876543231',
      preferredLanguage: 'en',
    },
  });

  const citizenAnitha = await prisma.user.create({
    data: {
      name: 'Anitha Resident',
      email: 'anitha.resident@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'CITIZEN',
      phone: '+91 9876543232',
      preferredLanguage: 'en',
    },
  });

  const citizenVikram = await prisma.user.create({
    data: {
      name: 'Vikram Campus Resident',
      email: 'vikram.campus@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'CITIZEN',
      phone: '+91 9876543233',
    },
  });

  const citizenMeena = await prisma.user.create({
    data: {
      name: 'Meena Resident',
      email: 'meena.citizen@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'CITIZEN',
      phone: '+91 9876543234',
      preferredLanguage: 'ta',
    },
  });

  // 3. Create Benchmark Hostel Streetlight Incident Cluster
  const hostelIncident = await prisma.incident.create({
    data: {
      title: 'Cluster: Broken Streetlight at Student Hostel Pathway',
      category: 'Streetlight/Electrical',
      centroidLat: 13.0827,
      centroidLng: 80.2707,
      complaintCount: 5,
      priorityScore: 87,
      departmentId: electricalDept.id,
      status: 'Active',
    },
  });

  // Benchmark Primary Complaint (Exact requirement match)
  const benchmarkSlaDeadline = new Date();
  benchmarkSlaDeadline.setHours(benchmarkSlaDeadline.getHours() + 24);

  const primaryHostelComplaint = await prisma.complaint.create({
    data: {
      displayId: 'CP-2026-0001',
      title: 'Broken Hostel Streetlight',
      description:
        'The streetlight near the college hostel has been broken for two weeks. Students are walking through the area at night.',
      originalLanguage: 'en',
      translatedDescription:
        'The streetlight near the college hostel has been broken for two weeks. Students are walking through the area at night.',
      category: 'Streetlight/Electrical',
      lat: 13.0827,
      lng: 80.2707,
      addressText: 'Hostel Block B Pathway, College Campus',
      images: JSON.stringify([]),
      citizenId: citizenKarthik.id,
      severity: 'High',
      safetyImpact: 'High',
      publicImpact: 'High',
      affectedPeople: 50,
      durationDays: 14,
      priorityScore: 87,
      priorityReasons: JSON.stringify([
        'Safety Risk: Safety Impact rated High (+20 pts)',
        'Severity Level: Severity evaluated as High (+25 pts)',
        'Duplicate Cluster: 5 similar complaints reported (+25 pts)',
        'Unresolved Duration: 14 day(s) persistent issue (+15 pts)',
        'Sensitive Zone: Proximity to student hostel or night foot-traffic zone (+10 pts)',
      ]),
      departmentId: electricalDept.id,
      assignedOfficerId: officerRamesh.id,
      incidentId: hostelIncident.id,
      slaHours: 24,
      slaDeadline: benchmarkSlaDeadline,
      slaRisk: 'High',
      slaRiskReason: 'Proximity to hostel night zone with 5 clustered duplicate reports.',
      status: 'Assigned',
      isDuplicate: true,
    },
  });

  await prisma.statusHistory.create({
    data: {
      complaintId: primaryHostelComplaint.id,
      status: 'Submitted',
      changedBy: 'Karthik Student',
      note: 'Complaint logged and evaluated by AI Engine (Priority Score 87/100)',
    },
  });

  await prisma.statusHistory.create({
    data: {
      complaintId: primaryHostelComplaint.id,
      status: 'Assigned',
      changedBy: 'Dr. Arul Prakash',
      note: 'Assigned to Field Officer Ramesh Kumar (Electrical Tech)',
    },
  });

  // 4 Duplicate Cluster Complaints attached to Hostel Incident
  const hostelDuplicates = [
    {
      displayId: 'CP-2026-0002',
      title: 'Hostel pathway pitch dark at night',
      description: 'Hostel block light is completely off. Pitch dark for girl students coming back from lab.',
      lat: 13.0828,
      lng: 80.2708,
      citizenId: citizenPriya.id,
    },
    {
      displayId: 'CP-2026-0003',
      title: 'மின் விளக்கு எரியவில்லை கல்லூரி விடுதி அருகில்',
      description: 'கல்லூரி விடுதி அருகில் தெரு விளக்கு 2 வாரமாக எரியவில்லை. இரவு நேரத்தில் செல்வது கடினமாக உள்ளது.',
      originalLanguage: 'ta',
      translatedDescription: 'Streetlight near college hostel is broken for 2 weeks. Difficult at night.',
      lat: 13.0826,
      lng: 80.2706,
      citizenId: citizenMeena.id,
    },
    {
      displayId: 'CP-2026-0004',
      title: 'Hostel lamp post flickering & sparking',
      description: 'Lamp post near Hostel B sparking intermittently. Dangerous to pass by.',
      lat: 13.0829,
      lng: 80.2705,
      citizenId: citizenAnitha.id,
    },
    {
      displayId: 'CP-2026-0005',
      title: 'Dark zone near Hostel entrance',
      description: 'Streetlight non functional since two weeks. Needs immediate bulb replacement.',
      lat: 13.0825,
      lng: 80.2709,
      citizenId: citizenVikram.id,
    },
  ];

  for (const dup of hostelDuplicates) {
    const createdDup = await prisma.complaint.create({
      data: {
        displayId: dup.displayId,
        title: dup.title,
        description: dup.description,
        originalLanguage: dup.originalLanguage || 'en',
        translatedDescription: dup.translatedDescription || dup.description,
        category: 'Streetlight/Electrical',
        lat: dup.lat,
        lng: dup.lng,
        addressText: 'Hostel Block B Pathway, College Campus',
        citizenId: dup.citizenId,
        severity: 'High',
        safetyImpact: 'High',
        publicImpact: 'High',
        affectedPeople: 40,
        durationDays: 14,
        priorityScore: 85,
        priorityReasons: JSON.stringify(['Safety Risk: High (+20)', 'Clustered duplicate issue (+25)']),
        departmentId: electricalDept.id,
        assignedOfficerId: officerRamesh.id,
        incidentId: hostelIncident.id,
        slaHours: 24,
        slaDeadline: benchmarkSlaDeadline,
        slaRisk: 'High',
        status: 'Assigned',
        isDuplicate: true,
      },
    });

    await prisma.statusHistory.create({
      data: {
        complaintId: createdDup.id,
        status: 'Submitted',
        changedBy: 'System AI',
        note: 'Auto-clustered into Hostel Incident',
      },
    });
  }

  // 4. Generate 60+ Realistic Complaints across main road, market, hostel, and residential zones
  const areas = [
    { name: 'Main Road Junction', lat: 13.0845, lng: 80.273, dept: roadsDept, cat: 'Pothole/Road' },
    { name: 'Central Market Gate', lat: 13.081, lng: 80.268, dept: sanitationDept, cat: 'Garbage/Sanitation' },
    { name: 'Residential Block A', lat: 13.086, lng: 80.275, dept: waterDept, cat: 'Water Leakage' },
    { name: 'Library Quadrangle', lat: 13.0835, lng: 80.2695, dept: electricalDept, cat: 'Streetlight/Electrical' },
    { name: 'Hostel Block C Drain', lat: 13.082, lng: 80.2715, dept: sanitationDept, cat: 'Drainage' },
    { name: 'Sports Complex Wall', lat: 13.087, lng: 80.278, dept: roadsDept, cat: 'Infrastructure Damage' },
  ];

  const statuses = ['Submitted', 'Assigned', 'In_Progress', 'Resolution_Submitted', 'Resolved', 'Reopened'];
  const citizensList = [citizenPriya, citizenKarthik, citizenAnitha, citizenVikram, citizenMeena];
  const officersList = [officerRamesh, officerSuresh, officerAnand, officerDeepa, officerSelvam];

  let complaintIndex = 6;

  for (let i = 0; i < 65; i++) {
    const area = areas[i % areas.length];
    const statusVal = statuses[i % statuses.length];
    const citizenObj = citizensList[i % citizensList.length];
    const officerObj = officersList[i % officersList.length];

    const isTamil = i % 7 === 0;
    const isCritical = i % 9 === 0;
    const isReopened = statusVal === 'Reopened';
    const isOverridden = i % 11 === 0;

    const displayId = `CP-2026-${String(complaintIndex++).padStart(4, '0')}`;
    const priorityScore = isCritical ? 92 : isReopened ? 88 : Math.floor(Math.random() * 55) + 30;
    const severity = isCritical ? 'Critical' : priorityScore > 65 ? 'High' : 'Medium';

    const slaDeadlineDate = new Date();
    slaDeadlineDate.setHours(slaDeadlineDate.getHours() + (isCritical ? 24 : 72));

    const titleText = isTamil
      ? `குடிநீர் கசிவு பகுதி ${i + 1}`
      : `${area.cat} issue at ${area.name}`;
    const descText = isTamil
      ? `சாலை ஓரத்தில் குடிநீர் குழாய் உடைந்து நீர் வீணாகிறது. உடனே சரி செய்ய வேண்டும்.`
      : `Persistent ${area.cat.toLowerCase()} problem reported near ${area.name}. Causing public inconvenience.`;

    const complaint = await prisma.complaint.create({
      data: {
        displayId,
        title: titleText,
        description: descText,
        originalLanguage: isTamil ? 'ta' : 'en',
        translatedDescription: isTamil ? `Water pipe leakage near roadside area ${i + 1}. Needs urgent repair.` : descText,
        category: area.cat,
        lat: area.lat + (Math.random() - 0.5) * 0.005,
        lng: area.lng + (Math.random() - 0.5) * 0.005,
        addressText: `${area.name}, Sector ${ (i % 4) + 1 }`,
        citizenId: citizenObj.id,
        severity,
        safetyImpact: isCritical ? 'Critical' : 'Medium',
        publicImpact: 'High',
        affectedPeople: Math.floor(Math.random() * 80) + 10,
        durationDays: (i % 10) + 1,
        priorityScore,
        priorityReasons: JSON.stringify([
          `Severity: ${severity} (+${isCritical ? 35 : 20})`,
          `Public Impact: High (+15)`,
          `Duration: ${(i % 10) + 1} day(s) (+10)`,
        ]),
        departmentId: area.dept.id,
        assignedOfficerId: statusVal !== 'Submitted' ? officerObj.id : null,
        slaHours: isCritical ? 24 : 72,
        slaDeadline: slaDeadlineDate,
        slaRisk: isCritical || isReopened ? 'High' : 'Low',
        status: statusVal,
        aiOverridden: isOverridden,
      },
    });

    // Status History Audit Log
    await prisma.statusHistory.create({
      data: {
        complaintId: complaint.id,
        status: 'Submitted',
        changedBy: citizenObj.name,
        note: `Submitted & AI Priority score calculated (${priorityScore}/100)`,
      },
    });

    if (statusVal !== 'Submitted') {
      await prisma.statusHistory.create({
        data: {
          complaintId: complaint.id,
          status: statusVal,
          changedBy: officerObj.name,
          note: `Workflow transitioned to ${statusVal}`,
        },
      });
    }

    // Resolution Proof & Verification for Resolution_Submitted or Resolved
    if (statusVal === 'Resolution_Submitted' || statusVal === 'Resolved') {
      await prisma.resolution.create({
        data: {
          complaintId: complaint.id,
          officerId: officerObj.id,
          description: `Field repair work executed cleanly at ${area.name}. Photo evidence attached.`,
          proofImages: JSON.stringify([]),
          verifiedBy: statusVal === 'Resolved' ? 'System Admin (Chief Control)' : null,
          verifiedAt: statusVal === 'Resolved' ? new Date() : null,
          verificationNote: statusVal === 'Resolved' ? 'Approved resolution proof photo' : null,
        },
      });

      if (statusVal === 'Resolved') {
        await prisma.feedback.create({
          data: {
            complaintId: complaint.id,
            rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
            comment: 'Prompt resolution! Thank you to the field officer and AI dispatch team.',
            citizenConfirmedResolved: true,
          },
        });
      }
    }

    // Override Log if marked overridden
    if (isOverridden) {
      await prisma.overrideLog.create({
        data: {
          complaintId: complaint.id,
          adminId: admin.id,
          field: 'priorityScore',
          oldValue: '45',
          newValue: String(priorityScore),
          reason: 'Admin manual priority escalation due to upcoming campus VIP visit',
        },
      });
    }
  }

  // 5. Seed Initial AI Civic Insights
  await prisma.insight.createMany({
    data: [
      {
        text: '🔥 "Streetlight/Electrical" represents 38% of total reported issues around Student Hostel quarters. High night-safety impact priority.',
        type: 'Hotspot',
      },
      {
        text: '⚠️ Proximity Warning: 5 duplicate complaints automatically merged into unified Incident cluster (Hostel B Pathway).',
        type: 'Trend',
      },
      {
        text: '⏳ Bottleneck Alert: 12 unassigned complaints in Roads & Infrastructure department nearing 50% SLA duration.',
        type: 'Bottleneck',
      },
    ],
  });

  console.log('✅ Seeding complete! Database populated with demo accounts & 70+ complaints.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
