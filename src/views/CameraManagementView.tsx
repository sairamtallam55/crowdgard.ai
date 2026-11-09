import React, { useState } from 'react';
import {
  Cctv,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Edit2,
  Power,
  Upload,
  Video,
  Radio,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Camera, CameraType, CameraStatus } from '../types';

interface CameraManagementViewProps {
  cameras: Camera[];
  onUpdateCamera: (id: string, updates: Partial<Camera>) => void;
  onAddCamera: (newCamera: Partial<Camera>) => void;
  onSelectForMonitoring: (camId: string) => void;
}

export const CameraManagementView: React.FC<CameraManagementViewProps> = ({
  cameras,
  onUpdateCamera,
  onAddCamera,
  onSelectForMonitoring
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    zoneName: 'Kotilingala Ghat Main Steps',
    zoneId: 'ZONE-01',
    type: 'PTZ 360°' as CameraType,
    resolution: '4K UltraHD',
    fps: 30,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam_new',
    confidenceThreshold: 0.7
  });

  const filteredCameras = cameras.filter((cam) => {
    const matchesSearch =
      cam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cam.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cam.zoneName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || cam.type === filterType;
    const matchesStatus = filterStatus === 'all' || cam.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleStatus = (cam: Camera) => {
    const newStatus: CameraStatus = cam.status === 'active' ? 'offline' : 'active';
    onUpdateCamera(cam.id, { status: newStatus });
  };

  const handleSaveCamera = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCamera({
      ...formData,
      status: 'active',
      detectionStatus: 'running',
      isDemoStream: true
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Summary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Municipal Surveillance Camera Fleet
          </h2>
          <p className="text-xs text-slate-500">
            {cameras.length} registered CCTV feeds, high-elevation PTZ cameras, drone streaming vectors & thermal monitors
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Camera</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Camera ID, location, or sector name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Camera Types</option>
            <option value="PTZ 360°">PTZ 360°</option>
            <option value="Fixed Optical">Fixed Optical</option>
            <option value="Drone Stream">Drone Stream</option>
            <option value="Thermal">Thermal</option>
            <option value="Mobile CCTV">Mobile CCTV</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Online</option>
            <option value="offline">Offline</option>
            <option value="degraded">Degraded</option>
          </select>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCameras.map((cam) => {
          const isOnline = cam.status === 'active';
          return (
            <div
              key={cam.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between hover:border-blue-400 transition-all space-y-3"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {cam.id}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-700">{cam.type}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    ></span>
                    <span
                      className={`text-[10px] font-bold uppercase font-mono ${
                        isOnline ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {cam.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-900">{cam.name}</h4>
                  <p className="text-[11px] text-slate-500">{cam.zoneName}</p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Resolution</span>
                    <span className="font-mono font-semibold text-slate-800">{cam.resolution}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Frame Rate</span>
                    <span className="font-mono font-semibold text-slate-800">{cam.fps} FPS</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Detection Pipeline</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {cam.detectionStatus.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Last Active</span>
                    <span className="font-mono font-semibold text-slate-800">{cam.lastPing}</span>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 font-mono truncate">
                  Stream: {cam.streamUrl}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectForMonitoring(cam.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Open Stream</span>
                </button>

                <button
                  onClick={() => handleToggleStatus(cam)}
                  className={`p-1.5 rounded-md border text-xs transition-colors ${
                    isOnline
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}
                  title={isOnline ? 'Disconnect Camera' : 'Connect Camera'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Register New Camera Feed</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCamera} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Camera Name / Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saraswati Ghat East Pier CCT-08"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Assigned Zone</label>
                  <select
                    value={formData.zoneName}
                    onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Kotilingala Ghat Main Steps">Kotilingala Ghat</option>
                    <option value="Pushkar Ghat Sacred Concourse">Pushkar Ghat</option>
                    <option value="Saraswati Ghat & North Embankment">Saraswati Ghat</option>
                    <option value="Rajahmundry Railway Station Concourse">Railway Station</option>
                    <option value="Godavari Bund Pedestrian Promenade">Bund Promenade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Sensor / Camera Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CameraType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="PTZ 360°">PTZ 360°</option>
                    <option value="Fixed Optical">Fixed Optical</option>
                    <option value="Drone Stream">Drone Stream</option>
                    <option value="Thermal">Thermal</option>
                    <option value="Mobile CCTV">Mobile CCTV</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">RTSP Stream Ingress URL</label>
                <input
                  type="text"
                  value={formData.streamUrl}
                  onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
