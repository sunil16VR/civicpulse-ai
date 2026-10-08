import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Flame, Filter, Layers, ArrowRight, Activity, Building } from 'lucide-react';

// Priority Marker Icons
const createPriorityIcon = (score: number) => {
  const color = score >= 80 ? '#f43f5e' : score >= 60 ? '#f59e0b' : '#0284c7';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 24 36">
      <path fill="${color}" stroke="#0f172a" stroke-width="1.5" d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
    </svg>
  `;
  return L.divIcon({
    className: 'custom-map-pin',
    html: svg,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
  });
};

export const MapView: React.FC = () => {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPriority, setMinPriority] = useState<number>(0);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const [compRes, hotRes] = await Promise.all([
        api.get('/complaints', {
          params: {
            category: selectedCategory,
            priorityMin: minPriority > 0 ? minPriority : undefined,
          },
        }),
        api.get('/analytics/hotspots'),
      ]);
      setComplaints(compRes.data.complaints || []);
      setHotspots(hotRes.data.hotspots || []);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [selectedCategory, minPriority]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs mb-1">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>OpenStreetMap Spatial Intelligence & Hotspots</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('map_view')}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time complaint location markers colored by priority, hotspot spatial aggregation, and density clusters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              showHeatmap
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span>{showHeatmap ? 'Hotspot Density View: ON' : 'Toggle Hotspot Density'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
        >
          <option value="">All Categories</option>
          <option value="Streetlight/Electrical">Streetlight/Electrical</option>
          <option value="Pothole/Road">Pothole/Road</option>
          <option value="Water Leakage">Water Leakage</option>
          <option value="Garbage/Sanitation">Garbage/Sanitation</option>
          <option value="Drainage">Drainage</option>
          <option value="Infrastructure Damage">Infrastructure Damage</option>
        </select>

        <select
          value={minPriority}
          onChange={(e) => setMinPriority(parseInt(e.target.value))}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
        >
          <option value={0}>All Priority Scores</option>
          <option value={80}>Score ≥ 80 (Critical)</option>
          <option value={60}>Score ≥ 60 (High)</option>
        </select>

        <span className="text-xs text-slate-400 font-mono ml-auto">
          Showing {complaints.length} active map markers
        </span>
      </div>

      {/* Grid: Map & Ranked Hotspots Sidebar */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Interactive Leaflet Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[500px] relative shadow-2xl">
          <MapContainer
            center={[13.0827, 80.2707]}
            zoom={14}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Complaint Pin Markers */}
            {complaints.map((c) => (
              <Marker
                key={c.id}
                position={[c.lat, c.lng]}
                icon={createPriorityIcon(c.priorityScore)}
              >
                <Popup>
                  <div className="p-2 space-y-1 text-slate-900 max-w-xs">
                    <div className="font-mono font-bold text-xs text-sky-600">{c.displayId}</div>
                    <div className="font-bold text-xs">{c.title}</div>
                    <div className="text-[11px] text-slate-600">Category: {c.category}</div>
                    <div className="text-[11px] font-bold text-rose-600">
                      Priority Score: {c.priorityScore}/100
                    </div>
                    <Link
                      to={`/complaint/${c.id}`}
                      className="inline-block mt-1 text-[11px] font-bold text-sky-600 underline"
                    >
                      View Complaint Details →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Civic Hotspots Ranked List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Ranked Civic Hotspots</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Radius Clustering</span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {hotspots.map((h, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 hover:border-rose-500/30 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{h.address}</span>
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {h.count} Issues
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Dominant: <strong className="text-slate-200">{h.dominantCategory}</strong></span>
                  <span>Avg Priority: <strong className="text-sky-300">{h.avgPriority}/100</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
