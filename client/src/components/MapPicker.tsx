import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Custom Map Marker Icon
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPickerProps {
  lat: number;
  lng: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<{ onSelect: (lat: number, lng: number) => void }> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

export const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, onLocationSelect }) => {
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationSelect(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Geolocation error or permission denied:', error);
          // Default fallback (e.g. Chennai / College campus area)
          onLocationSelect(13.0827, 80.2707);
        }
      );
    }
  };

  return (
    <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={[lat, lng]} />
        <MapClickHandler onSelect={onLocationSelect} />
        <Marker position={[lat, lng]} icon={customMarkerIcon} />
      </MapContainer>

      {/* Geolocate Button */}
      <button
        type="button"
        onClick={handleUseMyLocation}
        className="absolute top-3 right-3 z-10 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-sky-400 text-xs font-semibold rounded-xl border border-slate-700 backdrop-blur shadow-lg flex items-center gap-2 transition"
      >
        <Navigation className="w-3.5 h-3.5 animate-pulse text-sky-400" />
        <span>Use My Location</span>
      </button>

      {/* Lat / Lng badge */}
      <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 bg-slate-900/90 text-slate-300 text-[11px] font-mono rounded-lg border border-slate-700 backdrop-blur flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-rose-400" />
        <span>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
      </div>
    </div>
  );
};
