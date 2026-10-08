import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPicker } from '../components/MapPicker';
import {
  Sparkles,
  Building,
  Clock,
  AlertTriangle,
  User,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Languages,
  Layers,
  ArrowLeft,
  Star,
  RotateCcw,
  Edit,
} from 'lucide-react';

export const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [complaint, setComplaint] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.complaint);
    } catch (err) {
      console.error('Failed to load complaint detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
        Loading complaint intelligence report & audit trail...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Complaint record not found or access denied.
      </div>
    );
  }

  const priorityReasons = JSON.parse(complaint.priorityReasons || '[]');
  const images: string[] = JSON.parse(complaint.images || '[]');
  const proofImages: string[] = complaint.resolution?.proofImages
    ? JSON.parse(complaint.resolution.proofImages)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Navigation</span>
        </Link>
        <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/30">
          Display ID: {complaint.displayId}
        </span>
      </div>

      {/* Main Title & Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{complaint.title}</h1>
              {complaint.isDuplicate && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Clustered Incident
                </span>
              )}
              {complaint.aiOverridden && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI Overridden
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Reported by: <strong className="text-slate-200">{complaint.citizen?.name}</strong> •{' '}
              {new Date(complaint.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-left">
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Status</div>
              <div className="text-sm font-bold text-sky-400">{complaint.status}</div>
            </div>

            <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-left">
              <div className="text-[10px] uppercase font-bold text-rose-400">AI Priority Score</div>
              <div className="text-sm font-black font-mono text-rose-300">
                {complaint.priorityScore} / 100
              </div>
            </div>
          </div>
        </div>

        {/* Tamil Translation Notice */}
        {complaint.originalLanguage === 'ta' && (
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs space-y-1">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Languages className="w-4 h-4" />
              <span>Multilingual Intake Notice (Tamil to English)</span>
            </div>
            <p className="text-slate-300">
              <strong>Original Tamil:</strong> {complaint.description}
            </p>
            <p className="text-sky-300">
              <strong>Translated English:</strong> {complaint.translatedDescription}
            </p>
          </div>
        )}

        {/* Description Text */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
          {complaint.translatedDescription || complaint.description}
        </div>

        {/* Image Evidence Gallery */}
        {images.length > 0 && (
          <div>
            <span className="block text-xs font-bold text-slate-300 mb-2">Evidence Photo Attachments</span>
            <div className="flex flex-wrap gap-3">
              {images.map((imgUrl, i) => (
                <a key={i} href={imgUrl} target="_blank" rel="noreferrer" className="block w-28 h-28 rounded-xl overflow-hidden border border-slate-700 hover:opacity-90">
                  <img src={imgUrl} alt="Evidence" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid: AI Analysis Breakdown & Location Map */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Analysis Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5" />
            <span>AI Predictive Evaluation</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Category</span>
              <p className="font-bold text-white mt-0.5">{complaint.category}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Department</span>
              <p className="font-bold text-sky-400 mt-0.5">{complaint.department?.name || 'General'}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Severity</span>
              <p className="font-bold text-amber-300 mt-0.5">{complaint.severity}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Safety Risk</span>
              <p className="font-bold text-rose-400 mt-0.5">{complaint.safetyImpact}</p>
            </div>
          </div>

          {/* Why This Priority Factors */}
          <div>
            <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">
              Priority Factors (Explainable AI)
            </h4>
            <div className="space-y-2">
              {priorityReasons.map((r: string, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  {r}
                </div>
              ))}
            </div>
          </div>

          {/* SLA & Predictive Risk */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">SLA Window: {complaint.slaHours} Hours</span>
              <span
                className={`px-2 py-0.5 rounded ${
                  complaint.calculatedSlaRisk === 'High'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                SLA Risk: {complaint.calculatedSlaRisk}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{complaint.slaRiskReason}</p>
          </div>
        </div>

        {/* Location & Officer Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Location & Field Officer</h3>
            <span className="text-xs text-slate-400">{complaint.addressText}</span>
          </div>

          <MapPicker
            lat={complaint.lat}
            lng={complaint.lng}
            onLocationSelect={() => {}}
          />

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-300">Assigned Field Officer:</div>
            {complaint.assignedOfficer ? (
              <div className="space-y-1 text-slate-300">
                <p><strong>Name:</strong> {complaint.assignedOfficer.name}</p>
                <p><strong>Email:</strong> {complaint.assignedOfficer.email}</p>
                <p><strong>Phone:</strong> {complaint.assignedOfficer.phone || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-amber-400 font-bold">Unassigned to field officer</p>
            )}
          </div>
        </div>
      </div>

      {/* Linked Incident Cluster Panel if present */}
      {complaint.incident && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Layers className="w-5 h-5" />
            <span>Linked Incident Cluster ({complaint.incident.complaintCount} Complaints Grouped)</span>
          </div>
          <p className="text-xs text-slate-400">
            Title: <strong>{complaint.incident.title}</strong> • Cluster Priority: <strong>{complaint.incident.priorityScore}/100</strong>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {complaint.incident.complaints?.map((ic: any) => (
              <Link
                key={ic.id}
                to={`/complaint/${ic.id}`}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 transition text-xs"
              >
                <div className="font-mono font-bold text-sky-400">{ic.displayId}</div>
                <div className="font-bold text-white truncate">{ic.title}</div>
                <div className="text-[11px] text-slate-400">Status: {ic.status}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Resolution Proof & Admin Verification Section */}
      {complaint.resolution && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-5 h-5" />
            <span>Resolution Work Proof Report</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="text-slate-400">
              Submitted at: {new Date(complaint.resolution.submittedAt).toLocaleString()}
            </div>
            <p className="text-slate-200 font-medium">{complaint.resolution.description}</p>

            {proofImages.length > 0 && (
              <div className="pt-2">
                <span className="block text-xs font-bold text-slate-300 mb-2">Resolution Completion Photos</span>
                <div className="flex flex-wrap gap-3">
                  {proofImages.map((imgUrl, i) => (
                    <a key={i} href={imgUrl} target="_blank" rel="noreferrer" className="block w-24 h-24 rounded-xl overflow-hidden border border-slate-700">
                      <img src={imgUrl} alt="Resolution Proof" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Verification Result */}
          {complaint.resolution.verifiedBy && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
              <div className="font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified by Admin ({complaint.resolution.verifiedBy})</span>
              </div>
              <p className="text-emerald-200">{complaint.resolution.verificationNote}</p>
            </div>
          )}
        </div>
      )}

      {/* Citizen Feedback History */}
      {complaint.feedback && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Star className="w-5 h-5 fill-current" />
            <span>Citizen Rating & Feedback</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span>{complaint.feedback.rating} / 5 Stars</span>
            </div>
            <p className="text-slate-300">{complaint.feedback.comment || 'No written comment left.'}</p>
          </div>
        </div>
      )}

      {/* Complete Status History Audit Trail Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
          Complete Audit Trail Timeline (`StatusHistory`)
        </h3>

        <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 pl-6">
          {complaint.statusHistory?.map((sh: any) => (
            <div key={sh.id} className="relative">
              <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-sky-500 border-2 border-slate-900"></div>
              <div className="text-xs font-bold text-white">{sh.status}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                By: <strong className="text-slate-300">{sh.changedBy}</strong> •{' '}
                {new Date(sh.timestamp).toLocaleString()}
              </div>
              {sh.note && <p className="text-xs text-slate-300 mt-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">{sh.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
