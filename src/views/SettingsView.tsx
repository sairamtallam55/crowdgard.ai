import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Save,
  Database,
  Lock,
  History,
  CheckCircle2,
  AlertCircle,
  Sliders
} from 'lucide-react';
import { SystemSettings, CurrentUser } from '../types';
import { ApiService } from '../services/api';

interface SettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
  currentUser: CurrentUser;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  currentUser
}) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    ApiService.getAuditLogs().then((logs) => setAuditLogs(logs));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const roleMatrix = [
    {
      role: 'Super Administrator',
      perms: 'Full system management, threshold overrides, user provisioning, global resets'
    },
    {
      role: 'Control Room Operator',
      perms: 'CCTV feed inspection, live video uploads, real-time alert dispatch, density tracking'
    },
    {
      role: 'Police / Safety Officer',
      perms: 'Incident response, field officer assignment, barricade status acknowledgment'
    },
    {
      role: 'Traffic Management Officer',
      perms: 'Route diversion execution, pedestrian holding ground management, transit coordination'
    },
    {
      role: 'Read-only Viewer',
      perms: 'Public dashboard views, statistical chart inspection, situation report exports'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            System Administration &amp; Governance Architecture
          </h2>
          <p className="text-xs text-slate-500">
            Pushkaralu command thresholds, multi-agency role authorizations, and audit compliance logs
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Command Grid Operational Parameters</span>
              </h3>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Apply Settings</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Application Title</label>
                <input
                  type="text"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Host Organization</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Telemetry Refresh Interval (sec)</label>
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={formData.refreshIntervalSec}
                  onChange={(e) =>
                    setFormData({ ...formData, refreshIntervalSec: parseInt(e.target.value) || 5 })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Global Critical Density Ceiling (/m²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.globalCriticalDensityLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      globalCriticalDensityLimit: parseFloat(e.target.value) || 3.5
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono text-rose-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Data Retention Period (Days)</label>
                <input
                  type="number"
                  value={formData.dataRetentionDays}
                  onChange={(e) =>
                    setFormData({ ...formData, dataRetentionDays: parseInt(e.target.value) || 30 })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Demonstration Clock Multiplier</label>
                <select
                  value={formData.simulationSpeed}
                  onChange={(e) =>
                    setFormData({ ...formData, simulationSpeed: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="1x">1x Real Time</option>
                  <option value="2x">2x Accelerated</option>
                  <option value="5x">5x Fast Forward</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.autoAlertGeneration}
                  onChange={(e) => setFormData({ ...formData, autoAlertGeneration: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="font-medium">Enable Automated Algorithmic Alert Dispatch</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.emergencyBroadcastEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyBroadcastEnabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="font-medium">Public Address System PA Broadcast Ready</span>
              </label>
            </div>
          </form>

          {/* Audit Logs Table */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Administrative Action Audit Trail</span>
            </h3>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.2 rounded">
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-900">{log.user}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: RBAC Matrix & Database Info */}
        <div className="space-y-4">
          {/* RBAC Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Role-Based Access Matrix</span>
            </h3>

            <div className="space-y-2.5">
              {roleMatrix.map((r, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-blue-900 block">{r.role}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{r.perms}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Database Persistence Engine Status */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Data Persistence Engine</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Active Storage:</span>
                <span className="font-mono font-bold text-emerald-700">Node.js Express Memory/JSON</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Firestore Cloud Adapter:</span>
                <span className="font-mono text-slate-700">Ready for provisioning</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">AI Studio API Endpoint:</span>
                <span className="font-mono text-blue-700">Proxy Mode /api/*</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
