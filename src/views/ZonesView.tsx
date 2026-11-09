import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  MapPin,
  Sliders,
  Cctv
} from 'lucide-react';
import { Zone, DensityStatus } from '../types';

interface ZonesViewProps {
  zones: Zone[];
  onUpdateZone: (id: string, updates: Partial<Zone>) => void;
  onAddZone: (newZone: Partial<Zone>) => void;
}

export const ZonesView: React.FC<ZonesViewProps> = ({ zones, onUpdateZone, onAddZone }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    tehsil: 'Rajamahendravaram Urban',
    category: 'ghat' as Zone['category'],
    latitude: 17.001,
    longitude: 81.77,
    usableAreaSqM: 3000,
    safeCapacity: 6000,
    warningThreshold: 2.0,
    criticalThreshold: 3.5
  });

  const filteredZones = zones.filter(
    (z) =>
      z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.tehsil.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      tehsil: 'Rajamahendravaram Urban',
      category: 'ghat',
      latitude: 17.001,
      longitude: 81.77,
      usableAreaSqM: 3000,
      safeCapacity: 6000,
      warningThreshold: 2.0,
      criticalThreshold: 3.5
    });
    setShowModal(true);
  };

  const handleOpenEdit = (zone: Zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      tehsil: zone.tehsil,
      category: zone.category,
      latitude: zone.latitude,
      longitude: zone.longitude,
      usableAreaSqM: zone.usableAreaSqM,
      safeCapacity: zone.safeCapacity,
      warningThreshold: zone.warningThreshold,
      criticalThreshold: zone.criticalThreshold
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) {
      onUpdateZone(editingZone.id, formData);
    } else {
      onAddZone({
        ...formData,
        currentCount: Math.round(formData.safeCapacity * 0.5),
        trendRate: 25,
        assignedCameraIds: ['CAM-01'],
        isActive: true,
        lastUpdated: 'Just now'
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Pushkaralu Zone Registry &amp; Safe Occupancy Thresholds
          </h2>
          <p className="text-xs text-slate-500">
            Configure site-specific safe density limits (persons/m²), physical holding boundaries, and active camera assignments
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Define New Monitored Zone</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search zones by name, tehsil, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Zones Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredZones.map((zone) => {
          const isCrit = zone.densityStatus === 'critical';
          const isHigh = zone.densityStatus === 'high';

          return (
            <div
              key={zone.id}
              className={`rounded-xl border p-4 space-y-3 transition-all shadow-2xs flex flex-col justify-between ${
                isCrit
                  ? 'bg-rose-50/40 border-rose-200'
                  : isHigh
                  ? 'bg-orange-50/30 border-orange-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    {zone.id}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                      zone.densityStatus === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : zone.densityStatus === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : zone.densityStatus === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {zone.densityStatus}
                  </span>
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{zone.name}</h3>
                  <p className="text-[11px] text-slate-400">{zone.tehsil}</p>
                </div>

                <div className="mt-3 space-y-1.5 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Live Density:</span>
                    <span className="font-bold font-mono text-blue-700">{zone.density} /m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Devotee Count:</span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {zone.currentCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Usable Area:</span>
                    <span className="font-mono text-slate-900">{zone.usableAreaSqM.toLocaleString()} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Safe Capacity:</span>
                    <span className="font-mono text-slate-900">{zone.safeCapacity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Critical Limit:</span>
                    <span className="font-mono text-rose-600 font-bold">{zone.criticalThreshold} /m²</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono">
                  {zone.assignedCameraIds.length} CCTVs
                </span>

                <button
                  onClick={() => handleOpenEdit(zone)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Configure Limits</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingZone ? `Edit Zone: ${editingZone.name}` : 'Register New Monitored Sector'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. VIP Bathing Ghat South Pier"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Usable Ground Area (m²)</label>
                  <input
                    type="number"
                    required
                    value={formData.usableAreaSqM}
                    onChange={(e) => setFormData({ ...formData, usableAreaSqM: parseInt(e.target.value) || 1000 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Safe Capacity Limit (Devotees)</label>
                  <input
                    type="number"
                    required
                    value={formData.safeCapacity}
                    onChange={(e) => setFormData({ ...formData, safeCapacity: parseInt(e.target.value) || 2000 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Warning Threshold (persons/m²)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.warningThreshold}
                    onChange={(e) => setFormData({ ...formData, warningThreshold: parseFloat(e.target.value) || 2.0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Critical Density Limit (persons/m²)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.criticalThreshold}
                    onChange={(e) => setFormData({ ...formData, criticalThreshold: parseFloat(e.target.value) || 3.5 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono text-rose-600 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
