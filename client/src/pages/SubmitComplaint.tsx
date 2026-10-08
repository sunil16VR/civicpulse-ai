import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { MapPicker } from '../components/MapPicker';
import {
  Sparkles,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building,
  ShieldAlert,
  ArrowRight,
  FileText,
  X,
  Languages,
} from 'lucide-react';

export const SubmitComplaint: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Form State (Default location set to College Campus Hostel area)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [lat, setLat] = useState<number>(13.0827);
  const [lng, setLng] = useState<number>(80.2707);
  const [addressText, setAddressText] = useState('Near Student Hostel Gate 2, Campus Road');
  const [durationDays, setDurationDays] = useState<number>(14);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Workflow State
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (category) formData.append('category', category);
      formData.append('lat', String(lat));
      formData.append('lng', String(lng));
      formData.append('addressText', addressText);
      formData.append('durationDays', String(durationDays));

      images.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmittedData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze and submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  // Prefill Example Hostel Streetlight Scenario
  const fillHostelBenchmark = () => {
    setTitle('Broken Hostel Streetlight');
    setDescription(
      'The streetlight near the college hostel has been broken for two weeks. Students are walking through the area at night.'
    );
    setCategory('Streetlight/Electrical');
    setDurationDays(14);
    setAddressText('Hostel Block B Pathway, College Campus');
    setLat(13.0827);
    setLng(80.2707);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI-Guided Intake & Multilingual Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('submit_complaint')}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Describe the issue in English or Tamil (தமிழ்). Our predictive AI classifies, prioritizes, and routes it automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={fillHostelBenchmark}
          className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition flex items-center gap-2 self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Load Demo Scenario (Hostel Light)</span>
        </button>
      </div>

      {/* Main Form or Success AI Analysis View */}
      {!submittedData ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Complaint Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken streetlight near student hostel / தெரு விளக்கு பழுது"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
              />
            </div>

            {/* Description & Language Note */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  Detailed Description *
                </label>
                <div className="flex items-center gap-1 text-[11px] text-sky-400">
                  <Languages className="w-3.5 h-3.5" />
                  <span>Supports Tamil & English</span>
                </div>
              </div>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, exact location details, safety concerns, or duration..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition resize-y"
              />
            </div>

            {/* Category Suggestion & Duration */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Category (Optional - AI Will Detect if Empty)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 transition"
                >
                  <option value="">✨ AI Auto-Detect Category</option>
                  <option value="Streetlight/Electrical">Streetlight / Electrical</option>
                  <option value="Pothole/Road">Pothole / Road</option>
                  <option value="Water Leakage">Water Leakage</option>
                  <option value="Garbage/Sanitation">Garbage / Sanitation</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Infrastructure Damage">Infrastructure Damage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Duration Active (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>

            {/* Location Map Pin Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                Pin Location on Map *
              </label>
              <input
                type="text"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="Address landmark text (e.g. Near Hostel Gate 2)"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition mb-2"
              />
              <MapPicker
                lat={lat}
                lng={lng}
                onLocationSelect={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
            </div>

            {/* Multi-Image Evidence Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Photo Evidence Upload
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-2xl p-6 text-center bg-slate-950/50 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  id="evidence-upload"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="evidence-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <UploadCloud className="w-8 h-8 text-sky-400" />
                  <span className="text-xs font-semibold text-slate-300">
                    Click or drag photos here to attach evidence
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Supports JPG, PNG (Max 5 photos, 10MB each)
                  </span>
                </label>
              </div>

              {/* Previews */}
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 bg-slate-950/80 hover:bg-rose-600 text-white rounded-full text-xs transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm shadow-xl shadow-sky-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>AI is analyzing complaint context, calculating priority & routing...</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Submit & Run AI Analysis</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* AI Analysis Card Result */
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Complaint Logged & AI Analyzed!</h3>
              <p className="text-xs text-emerald-200/80">
                Display ID: <span className="font-mono font-bold">{submittedData.complaint.displayId}</span>
              </p>
            </div>
          </div>

          {/* AI Intelligence Breakdown Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                <span>AI Analysis Breakdown Card</span>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/30">
                Score: {submittedData.complaint.priorityScore} / 100
              </span>
            </div>

            {/* Language Notice if Tamil Translated */}
            {submittedData.complaint.originalLanguage === 'ta' && (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Languages className="w-4 h-4" />
                  <span>Tamil Input Detected & Translated</span>
                </div>
                <p className="text-slate-300">
                  <strong>Original (TA):</strong> {submittedData.complaint.description}
                </p>
                <p className="text-sky-300">
                  <strong>Internal English:</strong> {submittedData.complaint.translatedDescription}
                </p>
              </div>
            )}

            {/* Primary Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Category</span>
                <p className="text-xs font-bold text-white mt-0.5">{submittedData.complaint.category}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Severity</span>
                <p
                  className={`text-xs font-bold mt-0.5 ${
                    submittedData.complaint.severity === 'Critical'
                      ? 'text-rose-400'
                      : submittedData.complaint.severity === 'High'
                      ? 'text-amber-400'
                      : 'text-sky-400'
                  }`}
                >
                  {submittedData.complaint.severity}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
                <p className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-sky-400" />
                  <span>{submittedData.aiAnalysis.recommendedDepartment}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Expected SLA</span>
                <p className="text-xs font-bold text-amber-300 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{submittedData.complaint.slaHours} Hours Window</span>
                </p>
              </div>
            </div>

            {/* Duplicate Cluster Warning Banner */}
            {submittedData.aiAnalysis.duplicateDetected && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Duplicate Incident Cluster Detected!</span>
                </div>
                <p className="text-slate-300">
                  {submittedData.aiAnalysis.duplicateReason}. Grouped automatically into unified Incident cluster.
                </p>
              </div>
            )}

            {/* Why This Priority? Explanation Bar Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">
                Why this priority? (Point Contribution Breakdown)
              </h4>
              <div className="space-y-2">
                {JSON.parse(submittedData.complaint.priorityReasons || '[]').map(
                  (reason: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between"
                    >
                      <span>{reason}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <Link
                to={`/complaint/${submittedData.complaint.id}`}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition flex items-center gap-2"
              >
                <span>View Full Complaint Detail & Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmittedData(null);
                  setTitle('');
                  setDescription('');
                  setImages([]);
                  setImagePreviews([]);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Submit Another Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
