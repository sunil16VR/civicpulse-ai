# CivicPulse AI

> **AI-Powered Public Complaint Intelligence & Predictive Resolution System**
> Built for Colleges, Municipalities, and Residential Communities.

---

## 🌟 Key Capabilities

1. **Smart Intake & Multilingual Engine**: Citizens can submit complaints in English or Tamil (தமிழ்). The AI detects language, translates Tamil internally, and extracts structured fields.
2. **AI Classification & Transparent Priority Scoring**: Categories are assigned automatically (*Streetlight/Electrical, Pothole/Road, Water Leakage, Garbage/Sanitation, Drainage, Infrastructure Damage*). Priority (0–100) is calculated deterministically with transparent point weights (Explainable AI - XAI).
3. **Duplicate Detection & Incident Clustering**: Uses spatial distance (~100m) and text similarity to detect duplicate complaints and auto-aggregate them into unified Incident Clusters with escalated priority.
4. **Predictive SLA Risk Engine**: Calculates SLA deadlines (*Critical 24h, High 48h, Medium 72h, Low 120h*) and flags breach risks based on time elapsed, officer workload, and category benchmarks.
5. **Hero Priority Queue & Command Center**: Real-time executive dashboard for System Admins and Department Heads with quick officer assignment, resolution verification (Approve vs Reject), and AI Overrides audit logs (`OverrideLog`).
6. **Field Officer Proof Portal**: Officers update status (`Assigned` → `In Progress`) and upload resolution photos and work reports for Admin audit.
7. **Spatial Maps & Civic Hotspots**: OpenStreetMap Leaflet map with priority marker colors, clustering, and ranked hotspot density lists.
8. **AI Learning Loop & Civic Insights**: Continuously calculates category resolution stats from completed feedback and generates plain-language Civic Insights.

---

## 🚀 Single-Command Quickstart

Run this single command from the project root to install all dependencies, initialize the database, seed test data, and start both backend and frontend servers concurrently:

```bash
npm run setup && npm run dev
```

The application will be accessible at:
- **Frontend App**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:5000/api`

---

## 🔑 Demo Account Credentials (Password: `password123`)

| Role | Email | Purpose & Demo Workflows |
|---|---|---|
| **System Admin** | `admin@civicpulse.org` | Full Command Center, Priority Queue, AI Overrides, Proof Verification |
| **Dept Head (Electrical)** | `head.electrical@civicpulse.org` | Department Dashboard, Officer Assignment, Queue Filtering |
| **Field Officer** | `officer.ramesh@civicpulse.org` | Officer Task List, Status Updates, Resolution Proof Photo Uploads |
| **Citizen** | `priya.citizen@gmail.com` | Complaint Submission, Timeline Tracking, Confirmation & 5-Star Feedback |
| **Student Citizen** | `karthik.student@gmail.com` | Submitted the benchmark Hostel Streetlight complaint (`CP-2026-0001`) |

---

## 🎯 Benchmark Demo Scenario (`CP-2026-0001`)

To test the exact benchmark scenario:
1. Log in as **Karthik Student** (`karthik.student@gmail.com`) or **Dr. Arul Prakash** (`head.electrical@civicpulse.org`).
2. Search for complaint **`CP-2026-0001`**:
   - **Title**: *"Broken Hostel Streetlight"*
   - **Description**: *"The streetlight near the college hostel has been broken for two weeks. Students are walking through the area at night."*
   - **Category**: `Streetlight/Electrical`
   - **Severity**: `High` | **Safety Impact**: `High`
   - **AI Priority Score**: **87 / 100**
   - **Department**: `Electrical Maintenance`
   - **SLA Window**: `24 Hours` | **SLA Risk**: `High`
   - **Duplicate Cluster**: 5 similar complaints auto-merged into **Hostel Incident Cluster**

---

## 🛠 Tech Stack

- **Frontend**: React (TypeScript), Vite, Tailwind CSS, React Router DOM, Recharts, Leaflet + OpenStreetMap.
- **Backend**: Node.js + Express (TypeScript), Prisma ORM, SQLite (`dev.db`), JWT Auth, bcrypt, Multer (`/uploads`).
- **AI Engine**: Dual-mode Google Gemini API (via `GEMINI_API_KEY`) with fallback Rule-Based / Keyword NLP engine for 100% offline & keyless execution.

---

## 📁 Project Structure

```text
civicpulse/
├── client/                 # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, MapPicker
│   │   ├── context/        # AuthContext, LanguageContext
│   │   ├── pages/          # SubmitComplaint, CitizenDashboard, PriorityQueue, AdminCommandCenter, OfficerTasks, ComplaintDetail, MapView, AnalyticsView
│   │   └── services/       # Axios API client
├── server/                 # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma   # SQLite Database Schema
│   │   └── seed.ts         # Seeding Script (70+ realistic complaints)
│   ├── src/
│   │   ├── ai/             # AI Modules (classifier, priorityScorer, explainer, router, duplicateDetector, incidentGrouper, slaManager, slaRiskPredictor, insightGenerator, learningLoop, pipeline)
│   │   ├── middleware/     # Auth JWT & Multer upload middleware
│   │   ├── routes/         # Auth, Complaints, Departments, Analytics API routes
│   │   └── index.ts        # Express entrypoint
├── uploads/                # Local storage for image evidence & resolution proofs
├── .env.example
├── package.json            # Root setup & start scripts
└── README.md
```
