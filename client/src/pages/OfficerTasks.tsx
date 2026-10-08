import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  Clock,
  Flame,
  UploadCloud,
  X,
  ArrowRight,
  RefreshCw,
  Building,
  MapPin,
  Send,
  AlertTriangle,
} from 'lucide-react';

export const OfficerTasks: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolution Proof Modal State
  const [proofModalComplaint, setProofModalComplaint] = useState<any | null>(null);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/assigned');
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch officer tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/complaints/${id}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofModalComplaint || !description) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('description', description);
      images.forEach((file) => {
        formData.append('proofImages', file);
      });

      await api.post(`/complaints/${proofModalComplaint.id}/resolution`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProofModalComplaint(null);
      setDescription('');
      setImages([]);
      setImagePreviews([]);
      fetchTasks();
    } catch (err) {
      console.error('Failed to submit resolution proof:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Field Officer Portal ({user?.name})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Assigned complaints sorted by AI priority score and SLA deadline urgency.
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-2 self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Loading assigned field officer task queue...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            🎉 Great job! You currently have 0 pending assigned tasks.
          </div>
        ) : (
          complaints.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition shadow-lg"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-sky-400">{c.displayId}</span>
                    <h3 className="font-bold text-sm text-white">{c.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        c.priorityScore >= 80
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      Priority: {c.priorityScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{c.translatedDescription || c.description}</p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                  <Link
                    to={`/complaint/${c.id}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-sky-400" />
                  <span>{c.category}</span>
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{c.addressText}</span>
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 flex items-center gap-1 font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>SLA: {c.slaHours}h Window</span>
                </span>
              </div>

              {/* Status Action Workflow Bar */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="text-slate-400">Current Status: </span>
                  <strong className="text-sky-300">{c.status}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {c.status === 'Assigned' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(c.id, 'In_Progress')}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs transition"
                    >
                      Start Work (Mark In Progress)
                    </button>
                  )}

                  {(c.status === 'In_Progress' || c.status === 'Reopened') && (
                    <button
                      type="button"
                      onClick={() => setProofModalComplaint(c)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Resolution Proof</span>
                    </button>
                  )}

                  {c.status === 'Resolution_Submitted' && (
                    <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                      Resolution Proof Submitted (Pending Admin Audit)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Resolution Proof Modal */}
      {proofModalComplaint && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Submit Resolution Proof for {proofModalComplaint.displayId}</span>
            </h3>

            <form onSubmit={handleProofSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resolution Work Report *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe repair actions taken, components replaced, or work completed..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Upload Completion Photos
                </label>
                <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 text-center bg-slate-950/50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    id="proof-upload"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center gap-1">
                    <UploadCloud className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs text-slate-300">Click to upload completion photos</span>
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                        <img src={src} alt="Proof preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 p-0.5 bg-slate-950 text-white rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProofModalComplaint(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? 'Submitting Report...' : 'Submit Resolution Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
