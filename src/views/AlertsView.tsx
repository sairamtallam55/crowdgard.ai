import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Filter,
  Search,
  UserCheck,
  Send,
  HelpCircle
} from 'lucide-react';
import { Alert, AlertStatus, AlertSeverity } from '../types';
import { ApiService } from '../services/api';

interface AlertsViewProps {
  alerts: Alert[];
  onUpdateAlertStatus: (alertId: string, status: AlertStatus, officer?: string) => void;
  onOpenAiAssistant: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onUpdateAlertStatus,
  onOpenAiAssistant
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAlertForAi, setSelectedAlertForAi] = useState<Alert | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const handleInspectAi = async (alert: Alert) => {
    setSelectedAlertForAi(alert);
    setLoadingAi(true);
    setAiExplanation(null);
    try {
      const res = await ApiService.getIncidentExplanation(alert.id, alert.zoneId);
      setAiExplanation(res.explanation);
    } catch (e) {
      console.warn('Error fetching incident explanation:', e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Incident Command &amp; Alert Dispatch Grid
          </h2>
          <p className="text-xs text-slate-500">
            Real-time threshold violations, rapid crowd build-up events, and emergency task force assignments
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>{alerts.filter((a) => a.severity === 'critical' && a.status !== 'resolved').length} Critical Unresolved</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search alerts by location, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isResolved = alert.status === 'resolved';

          return (
            <div
              key={alert.id}
              className={`rounded-xl border p-5 transition-all shadow-2xs space-y-3 ${
                isResolved
                  ? 'bg-slate-50/60 border-slate-200 opacity-80'
                  : isCritical
                  ? 'bg-rose-50/30 border-rose-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    {alert.id}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                      alert.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : alert.severity === 'high'
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : alert.severity === 'warning'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {alert.severity}
                  </span>

                  <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                  <span className="text-xs text-slate-500 font-medium">· {alert.zoneName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">{alert.timestamp}</span>
                  <span
                    className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                      alert.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : alert.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : alert.status === 'assigned'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {alert.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Description & Recommended Action */}
              <div className="text-xs text-slate-700 space-y-1">
                <p>{alert.description}</p>
                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-900 font-medium">
                  <strong>Recommended Operational Response:</strong> {alert.recommendedAction}
                </div>
              </div>

              {/* Department & Officer Details */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
                <div>
                  <span className="text-slate-400">Assigned Department: </span>
                  <span className="font-semibold text-slate-700">{alert.assignedDepartment}</span>
                  {alert.assignedOfficer && (
                    <span className="ml-2 text-slate-700">({alert.assignedOfficer})</span>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleInspectAi(alert)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-600" />
                    <span>Explain Anomaly</span>
                  </button>

                  {alert.status === 'new' && (
                    <button
                      onClick={() => onUpdateAlertStatus(alert.id, 'acknowledged')}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  {alert.status === 'acknowledged' && (
                    <button
                      onClick={() => onUpdateAlertStatus(alert.id, 'in_progress', 'Command Duty Inspector')}
                      className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      Deploy Task Force
                    </button>
                  )}

                  {alert.status === 'in_progress' && (
                    <button
                      onClick={() => onUpdateAlertStatus(alert.id, 'resolved')}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              {/* AI Explanation Drawer if expanded */}
              {selectedAlertForAi?.id === alert.id && (
                <div className="mt-2 p-4 rounded-xl bg-slate-900 text-white text-xs space-y-2 border border-slate-800 animate-in fade-in">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Gemini Tactical Root Cause Analysis
                    </span>
                    <button
                      onClick={() => setSelectedAlertForAi(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {loadingAi ? (
                    <div className="py-2 text-slate-400 font-mono text-[11px]">
                      Querying Gemini 3.8 Flash inference engine...
                    </div>
                  ) : (
                    <p className="leading-relaxed text-slate-300 whitespace-pre-wrap font-sans">
                      {aiExplanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
