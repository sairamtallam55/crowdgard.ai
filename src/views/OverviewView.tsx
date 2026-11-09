import React, { useState, useEffect } from 'react';
import {
  Users,
  Layers,
  Cctv,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Video,
  ExternalLink,
  RefreshCw,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Zone, Camera, Alert, HistoricalObservation } from '../types';
import { ApiService } from '../services/api';

interface OverviewViewProps {
  zones: Zone[];
  cameras: Camera[];
  alerts: Alert[];
  onNavigateTo: (view: any) => void;
  onOpenAiAssistant: () => void;
  onAcknowledgeAlert: (id: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  zones,
  cameras,
  alerts,
  onNavigateTo,
  onOpenAiAssistant,
  onAcknowledgeAlert
}) => {
  const [operationalSummary, setOperationalSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalObservation[]>([]);

  useEffect(() => {
    loadSummary();
    loadAnalytics();
  }, []);

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await ApiService.getOperationalSummary();
      setOperationalSummary(res.summary);
    } catch (e) {
      console.warn('Error loading summary:', e);
    } finally {
      setSummaryLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await ApiService.getAnalytics();
      if (res.history) setHistoricalData(res.history);
    } catch (e) {
      console.warn('Error loading analytics:', e);
    }
  };

  // KPIs
  const totalPeople = zones.reduce((acc, z) => acc + z.currentCount, 0);
  const totalCapacity = zones.reduce((acc, z) => acc + z.safeCapacity, 0);
  const totalArea = zones.reduce((acc, z) => acc + z.usableAreaSqM, 0);
  const avgDensity = totalArea > 0 ? Number((totalPeople / totalArea).toFixed(2)) : 0;
  const activeCameras = cameras.filter((c) => c.status === 'active').length;
  const criticalZones = zones.filter((z) => z.densityStatus === 'critical');
  const highZones = zones.filter((z) => z.densityStatus === 'high');
  const moderateZones = zones.filter((z) => z.densityStatus === 'moderate');
  const normalZones = zones.filter((z) => z.densityStatus === 'normal');
  const activeAlerts = alerts.filter((a) => a.status !== 'resolved');
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved');

  // Chart data
  const zoneBarData = zones.map((z) => ({
    name: z.name.replace(' Sacred Concourse', '').replace(' Main Steps', '').replace(' Pedestrian', ''),
    Pilgrims: z.currentCount,
    Capacity: z.safeCapacity,
    density: z.density
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner / Event Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              RMC COMMAND CONSOLE
            </span>
            <span className="text-xs text-slate-300">
              Rajamahendravaram Municipal Corporation · Pushkaralu 2027
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-white">
            Godavari Maha Pushkaralu Real-Time Congregation Grid
          </h2>
          <p className="text-xs text-slate-400">
            AI-assisted crowd density estimation, choke point forecasting, and emergency route management across 8 riverfront bathing sectors.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTo('live-monitoring')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Video className="w-4 h-4" />
            <span>Launch Vision Monitor</span>
          </button>
          <button
            onClick={() => onNavigateTo('heatmap')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <span>View River Heatmap</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Total Crowd</span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {totalPeople.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Pilgrims in sectors</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Avg Density</span>
            <Activity className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {avgDensity} <span className="text-xs font-normal text-slate-500">/m²</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Safe baseline &lt; 2.5</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Critical Sectors</span>
            <Flame className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className={`text-lg font-bold font-mono tabular-nums ${criticalZones.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {criticalZones.length}
          </p>
          <span className="text-[10px] text-slate-400">Exceeding safe limits</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Active Alerts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-lg font-bold text-amber-600 font-mono tabular-nums">
            {activeAlerts.length}
          </p>
          <span className="text-[10px] text-slate-400">Assigned response</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Active Cameras</span>
            <Cctv className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {activeCameras} <span className="text-xs text-slate-400 font-normal">/ {cameras.length}</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">100% online</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Monitored Zones</span>
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {zones.length}
          </p>
          <span className="text-[10px] text-slate-400">Ghats & transit hubs</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Resolved Incidents</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-emerald-600 font-mono tabular-nums">
            {resolvedAlerts.length}
          </p>
          <span className="text-[10px] text-slate-400">Today&apos;s shift</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Occupancy</span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {totalCapacity > 0 ? Math.round((totalPeople / totalCapacity) * 100) : 0}%
          </p>
          <span className="text-[10px] text-slate-400">Of safe capacity</span>
        </div>
      </div>

      {/* Gemini AI Operational Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Gemini Crowd Intelligence · Operational Situation Briefing
              </h3>
              <p className="text-[11px] text-slate-500">
                Automated multi-sector synthesis generated using Gemini 3.8 Flash
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadSummary}
              disabled={summaryLoading}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${summaryLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
            >
              <span>Ask Advisor</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="pt-3 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
          {summaryLoading ? (
            <div className="py-6 flex items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Synthesizing multi-zone telemetry...</span>
            </div>
          ) : (
            operationalSummary
          )}
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crowd Density Over Time Line Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Crowd Density Trajectory (Diurnal Curve)</h3>
              <p className="text-[11px] text-slate-500">
                Hourly congregation tracking across Pushkaralu holy bathing hours
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-blue-600 inline-block"></span> Total People
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span> Pushkar Ghat
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timeLabel" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any) => [Number(value).toLocaleString(), 'Pilgrims']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="totalPeople" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} name="Total Congregation" />
                <Line type="monotone" dataKey="pushkarGhat" stroke="#f43f5e" strokeWidth={2} dot={{ r: 2 }} name="Pushkar Ghat" />
                <Line type="monotone" dataKey="kotilingalaGhat" stroke="#10b981" strokeWidth={1.5} dot={false} name="Kotilingala Ghat" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Distribution Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Zone-wise Crowd Distribution vs Capacity</h3>
              <p className="text-[11px] text-slate-500">
                Current detected people versus configured safe perimeter threshold
              </p>
            </div>
            <button
              onClick={() => onNavigateTo('zones')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Manage Zones
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneBarData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any) => [Number(value).toLocaleString(), 'Devotees']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="Pilgrims" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Safety Status & Recent Alerts Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Safety Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Safety Status Distribution</h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Categorized by real-time density limits per square metre
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-semibold text-emerald-950">Normal Flow (&lt; 1.5 /m²)</span>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-800">{normalZones.length} Sectors</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-semibold text-amber-950">Moderate (1.5 - 2.5 /m²)</span>
                </div>
                <span className="text-xs font-bold font-mono text-amber-800">{moderateZones.length} Sectors</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span className="text-xs font-semibold text-orange-950">High Inflow (2.5 - 3.8 /m²)</span>
                </div>
                <span className="text-xs font-bold font-mono text-orange-800">{highZones.length} Sectors</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-xs font-semibold text-rose-950">Critical Crush Risk (&gt; 3.8 /m²)</span>
                </div>
                <span className="text-xs font-bold font-mono text-rose-800">{criticalZones.length} Sectors</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Threshold engine: Active</span>
            <span className="font-mono text-[11px] text-slate-700">RMC SOP 2027</span>
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Incident & Threshold Warnings</h3>
              <p className="text-[11px] text-slate-500">
                Automated detection notifications requiring supervisor acknowledgment
              </p>
            </div>
            <button
              onClick={() => onNavigateTo('alerts')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              All Alerts ({alerts.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
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
                    <span className="text-[11px] text-slate-400">· {alert.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">{alert.description}</p>
                  <p className="text-[11px] text-blue-700 font-medium line-clamp-1">
                    Directive: {alert.recommendedAction}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {alert.status !== 'resolved' ? (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 shadow-2xs transition-colors"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Monitoring Previews Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Camera Stream Grid Previews</h3>
            <p className="text-[11px] text-slate-500">
              Sample feeds with verified active/demo status labels across primary riverfront portals
            </p>
          </div>
          <button
            onClick={() => onNavigateTo('cameras')}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            Manage All 12 Cameras
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cameras.slice(0, 4).map((cam) => (
            <div
              key={cam.id}
              onClick={() => onNavigateTo('live-monitoring')}
              className="group cursor-pointer rounded-lg overflow-hidden border border-slate-200 bg-slate-900 text-white relative aspect-video flex flex-col justify-between p-3 hover:border-blue-500 transition-all shadow-2xs"
            >
              {/* Simulated camera feed aesthetic */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent pointer-events-none"></div>

              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-slate-900/80 px-1.5 py-0.5 rounded text-white border border-slate-700">
                  {cam.id}
                </span>

                <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{cam.isDemoStream ? 'DEMO FEED' : 'LIVE RTSP'}</span>
                </div>
              </div>

              <div className="relative z-10 space-y-0.5">
                <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {cam.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{cam.resolution}</span>
                  <span>{cam.fps} FPS</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
