import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Cctv,
  Flame,
  ArrowUpRight,
  Activity,
  Layers,
  Sliders,
  CheckSquare,
  Square,
  Sparkles,
  HelpCircle,
  Eye,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Zone, Alert, HistoricalObservation } from '../types';
import { exportToCSV, generatePushkaraluReportPDF } from '../utils/exportUtils';

interface AnalyticsViewProps {
  zones: Zone[];
  alerts: Alert[];
  historicalData: HistoricalObservation[];
}

// Distinct accessible colors for all 8 zones
export const ZONE_CHART_COLORS: Record<string, string> = {
  'ZONE-01': '#10b981', // Emerald - Kotilingala Ghat
  'ZONE-02': '#f43f5e', // Rose - Pushkar Ghat
  'ZONE-03': '#06b6d4', // Cyan - Saraswati Ghat
  'ZONE-04': '#8b5cf6', // Violet - Markandeya Ghat
  'ZONE-05': '#2563eb', // Royal Blue - Railway Station
  'ZONE-06': '#f59e0b', // Amber - APSRTC Bus Complex
  'ZONE-07': '#ea580c', // Crimson/Orange - Bund Promenade
  'ZONE-08': '#64748b'  // Slate - Diwancheruvu Hub
};

interface GranularObservation {
  time: string;
  hour: number;
  label: string;
  isPeak: boolean;
  [key: string]: any; // dynamic keys for each zone: e.g. ZONE-01_density, ZONE-01_count
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  zones,
  alerts,
  historicalData
}) => {
  // Main Tab: 'summary' | 'granular-comparison'
  const [activeTab, setActiveTab] = useState<'summary' | 'granular-comparison'>('granular-comparison');

  // Granular Comparison Tab State
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([
    'ZONE-01',
    'ZONE-02',
    'ZONE-05',
    'ZONE-07'
  ]);
  const [metricMode, setMetricMode] = useState<'density' | 'count'>('density');
  const [timelineScope, setTimelineScope] = useState<'all' | 'peak'>('all');
  const [showThresholdLines, setShowThresholdLines] = useState<boolean>(true);
  const [showDataTable, setShowDataTable] = useState<boolean>(false);

  // Generate granular 24-hour time series for all 8 zones
  const granularTimeSeriesData: GranularObservation[] = useMemo(() => {
    const hours = [
      { h: 0, label: '00:00 Night', isPeak: false, scale: 0.22 },
      { h: 1, label: '01:00 Night', isPeak: false, scale: 0.18 },
      { h: 2, label: '02:00 Night', isPeak: false, scale: 0.16 },
      { h: 3, label: '03:00 Pre-Dawn', isPeak: false, scale: 0.28 },
      { h: 4, label: '04:00 Ingress', isPeak: false, scale: 0.45 },
      { h: 5, label: '05:00 Brahma Muhurtham', isPeak: true, scale: 0.72 },
      { h: 6, label: '06:00 Morning Holy Dip', isPeak: true, scale: 0.88 },
      { h: 7, label: '07:00 Morning Surge', isPeak: true, scale: 0.94 },
      { h: 8, label: '08:00 Peak Dip Rituals', isPeak: true, scale: 1.0 },
      { h: 9, label: '09:00 Transit Arrivals', isPeak: false, scale: 0.91 },
      { h: 10, label: '10:00 Mid-Morning', isPeak: false, scale: 0.84 },
      { h: 11, label: '11:00 Solar Elevation', isPeak: false, scale: 0.75 },
      { h: 12, label: '12:00 Midday Sun', isPeak: false, scale: 0.65 },
      { h: 13, label: '13:00 Afternoon Lull', isPeak: false, scale: 0.62 },
      { h: 14, label: '14:00 Post-Lunch Inflow', isPeak: false, scale: 0.72 },
      { h: 15, label: '15:00 Train Inflow', isPeak: false, scale: 0.82 },
      { h: 16, label: '16:00 Pre-Evening Staging', isPeak: true, scale: 0.92 },
      { h: 17, label: '17:00 Ghat Congregation', isPeak: true, scale: 1.08 },
      { h: 18, label: '18:00 Godavari Harathi', isPeak: true, scale: 1.25 },
      { h: 19, label: '19:00 Deepotsavam', isPeak: true, scale: 1.18 },
      { h: 20, label: '20:00 Post-Aarti Outflow', isPeak: false, scale: 0.96 },
      { h: 21, label: '21:00 Night Transit Exit', isPeak: false, scale: 0.78 },
      { h: 22, label: '22:00 Egress Dispersal', isPeak: false, scale: 0.55 },
      { h: 23, label: '23:00 Shift Wind-Down', isPeak: false, scale: 0.35 }
    ];

    return hours.map(({ h, label, isPeak, scale }) => {
      const entry: GranularObservation = {
        time: `${String(h).padStart(2, '0')}:00`,
        hour: h,
        label,
        isPeak
      };

      zones.forEach((zone) => {
        // Base count for zone modulated by zone-specific factors
        let zoneMultiplier = 1.0;
        if (zone.category === 'transit') {
          // Transit peaks around 08:00 and 15:00-19:00 train arrivals
          zoneMultiplier = (h >= 7 && h <= 10) || (h >= 15 && h <= 19) ? 1.2 : 0.85;
        } else if (zone.category === 'promenade') {
          // Promenade builds massive pressure during evening Aarti
          zoneMultiplier = h >= 16 && h <= 20 ? 1.35 : 0.8;
        } else if (zone.category === 'holding') {
          // Holding area absorbs spillover during peak hours
          zoneMultiplier = isPeak ? 1.3 : 0.7;
        } else {
          // Ghats peak at morning dip (05-09) and evening harathi (17-20)
          zoneMultiplier = (h >= 5 && h <= 9) || (h >= 17 && h <= 20) ? 1.22 : 0.75;
        }

        const calculatedCount = Math.round(zone.safeCapacity * scale * zoneMultiplier * 0.75);
        const calculatedDensity = Number((calculatedCount / zone.usableAreaSqM).toFixed(2));

        entry[`${zone.id}_count`] = calculatedCount;
        entry[`${zone.id}_density`] = calculatedDensity;
        entry[`${zone.id}_occupancy`] = Math.round((calculatedCount / zone.safeCapacity) * 100);
      });

      return entry;
    });
  }, [zones]);

  // Filter timeline if "peak" is selected
  const displayedTimeSeriesData = useMemo(() => {
    if (timelineScope === 'peak') {
      return granularTimeSeriesData.filter((d) => d.hour >= 4 && d.hour <= 21);
    }
    return granularTimeSeriesData;
  }, [granularTimeSeriesData, timelineScope]);

  // Zone selection toggles
  const handleToggleZone = (zoneId: string) => {
    setSelectedZoneIds((prev) =>
      prev.includes(zoneId) ? prev.filter((id) => id !== zoneId) : [...prev, zoneId]
    );
  };

  const handleSelectPreset = (preset: 'all' | 'ghats' | 'transit' | 'choke' | 'clear') => {
    if (preset === 'all') {
      setSelectedZoneIds(zones.map((z) => z.id));
    } else if (preset === 'clear') {
      setSelectedZoneIds([]);
    } else if (preset === 'ghats') {
      setSelectedZoneIds(zones.filter((z) => z.category === 'ghat').map((z) => z.id));
    } else if (preset === 'transit') {
      setSelectedZoneIds(zones.filter((z) => z.category === 'transit' || z.category === 'holding').map((z) => z.id));
    } else if (preset === 'choke') {
      setSelectedZoneIds(['ZONE-02', 'ZONE-05', 'ZONE-07']);
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const rows = zones.map((z) => ({
      ZoneID: z.id,
      Name: z.name,
      Tehsil: z.tehsil,
      Category: z.category,
      CurrentDevotees: z.currentCount,
      UsableAreaSqM: z.usableAreaSqM,
      DensityPerSqM: z.density,
      Status: z.densityStatus,
      SafeCapacity: z.safeCapacity,
      RateDeltaPerMin: z.trendRate
    }));
    exportToCSV(`CrowdGuard_Zones_Telemetry_${Date.now()}`, rows);
  };

  const handleExportGranularCSV = () => {
    const rows = displayedTimeSeriesData.map((d) => {
      const rowObj: any = { Time: d.time, Interval: d.label, IsPeakHour: d.isPeak ? 'YES' : 'NO' };
      selectedZoneIds.forEach((zid) => {
        const zone = zones.find((z) => z.id === zid);
        const name = zone ? zone.name : zid;
        rowObj[`${name}_Density(/m²)`] = d[`${zid}_density`];
        rowObj[`${name}_Count`] = d[`${zid}_count`];
      });
      return rowObj;
    });
    exportToCSV(`CrowdGuard_Granular_Comparison_${Date.now()}`, rows);
  };

  const handleExportPDF = () => {
    generatePushkaraluReportPDF(zones, alerts);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Pushkaralu Operational Analytics &amp; Incident Auditing
          </h2>
          <p className="text-xs text-slate-500">
            Granular time-series comparisons, historical crowd density trajectories, and formal municipal records
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'granular-comparison' ? (
            <button
              onClick={handleExportGranularCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Comparison CSV</span>
            </button>
          ) : (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Telemetry CSV</span>
            </button>
          )}

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Official PDF Report</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 rounded-t-xl">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('granular-comparison')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'granular-comparison'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Granular Zone Time-Series Comparison</span>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
              Multi-Zone
            </span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'summary'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Shift Overview &amp; Incident Breakdown</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 hidden md:block">
          Grid: <span className="font-semibold text-slate-800">8 Rajamahendravaram Sectors</span>
        </div>
      </div>

      {/* TAB 1: Granular Zone Time-Series Comparison */}
      {activeTab === 'granular-comparison' && (
        <div className="space-y-6">
          {/* Zone Multi-Selection & Presets Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Select Monitored Sectors to Compare Side-by-Side</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select 2 or more sectors to overlay their crowd density and devotee volume fluctuations
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Presets:
                </span>
                <button
                  onClick={() => handleSelectPreset('all')}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  All 8 Zones
                </button>
                <button
                  onClick={() => handleSelectPreset('ghats')}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                >
                  Bathing Ghats (4)
                </button>
                <button
                  onClick={() => handleSelectPreset('transit')}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors"
                >
                  Transit Hubs (3)
                </button>
                <button
                  onClick={() => handleSelectPreset('choke')}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors"
                >
                  Key Choke Points
                </button>
                <button
                  onClick={() => handleSelectPreset('clear')}
                  className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Checkbox / Pill Selector Matrix for all 8 zones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {zones.map((zone) => {
                const isSelected = selectedZoneIds.includes(zone.id);
                const color = ZONE_CHART_COLORS[zone.id] || '#2563eb';

                return (
                  <button
                    key={zone.id}
                    onClick={() => handleToggleZone(zone.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-50 border-slate-300 shadow-2xs ring-1'
                        : 'bg-white border-slate-200 hover:bg-slate-50 opacity-60'
                    }`}
                    style={{ borderColor: isSelected ? color : undefined }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {zone.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {zone.id} · Safe Limit: {zone.criticalThreshold}/m²
                        </span>
                      </div>
                    </div>

                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ml-2 shrink-0"
                      style={{
                        backgroundColor: `${color}15`,
                        color: color
                      }}
                    >
                      {zone.density} /m²
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chart Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            {/* Metric Mode Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Metric Axis:</span>
              <div className="flex items-center p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setMetricMode('density')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    metricMode === 'density'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Density (persons / m²)
                </button>
                <button
                  onClick={() => setMetricMode('count')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    metricMode === 'count'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Absolute Devotee Count
                </button>
              </div>
            </div>

            {/* Time Resolution Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Timeline Scope:</span>
              <div className="flex items-center p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setTimelineScope('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    timelineScope === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full 24 Hours (00:00 - 23:00)
                </button>
                <button
                  onClick={() => setTimelineScope('peak')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    timelineScope === 'peak'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Peak Bathing &amp; Harathi (04:00 - 21:00)
                </button>
              </div>
            </div>

            {/* Toggle Threshold Reference Lines */}
            <div className="flex items-center gap-3 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showThresholdLines}
                  onChange={(e) => setShowThresholdLines(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-medium">Show Critical Threshold Lines</span>
              </label>

              <button
                onClick={() => setShowDataTable(!showDataTable)}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showDataTable ? 'Hide Data Matrix' : 'View Data Matrix'}</span>
              </button>
            </div>
          </div>

          {/* Main Scrollable Granular Line Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Granular Time-Series Trajectory ({metricMode === 'density' ? 'Density in persons/m²' : 'Crowd Headcount'})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Comparing {selectedZoneIds.length} of {zones.length} sectors across hourly Pushkaralu timeline
                </p>
              </div>

              {/* Scroll guide hint */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <span>Pan / Scroll horizontally to explore timeline</span>
                <span className="text-slate-300">→</span>
              </div>
            </div>

            {selectedZoneIds.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-lg">
                <Sliders className="w-6 h-6 text-slate-300" />
                <p className="text-xs">No zones currently selected.</p>
                <button
                  onClick={() => handleSelectPreset('all')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Select all 8 sectors to view comparison
                </button>
              </div>
            ) : (
              /* Scrollable Chart Viewport Container */
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[1050px] h-88">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={displayedTimeSeriesData}
                      margin={{ top: 15, right: 30, left: 10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        tickFormatter={(v) =>
                          metricMode === 'density' ? `${v}/m²` : `${(v / 1000).toFixed(0)}k`
                        }
                        domain={metricMode === 'density' ? [0, 4.5] : [0, 'auto']}
                      />

                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const obs = displayedTimeSeriesData.find((d) => d.time === label);

                          return (
                            <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-lg shadow-xl text-xs space-y-2 min-w-[240px]">
                              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                                <span className="font-bold text-white">{label}</span>
                                <span className="text-[10px] text-cyan-400 font-medium">
                                  {obs?.label}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {payload.map((p: any) => {
                                  const zoneId = p.dataKey?.replace('_density', '').replace('_count', '');
                                  const zone = zones.find((z) => z.id === zoneId);
                                  const val = p.value;

                                  return (
                                    <div
                                      key={p.dataKey}
                                      className="flex items-center justify-between text-[11px]"
                                    >
                                      <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                                        <span
                                          className="w-2.5 h-2.5 rounded-full shrink-0"
                                          style={{ backgroundColor: p.stroke }}
                                        ></span>
                                        <span className="truncate text-slate-300">
                                          {zone ? zone.name.split(' ')[0] + ' ' + (zone.name.split(' ')[1] || '') : zoneId}
                                        </span>
                                      </div>

                                      <div className="font-mono font-bold" style={{ color: p.stroke }}>
                                        {metricMode === 'density'
                                          ? `${val} persons/m²`
                                          : `${Number(val).toLocaleString()} devotees`}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }}
                      />

                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }}
                      />

                      {/* Threshold Reference Lines when viewing Density */}
                      {showThresholdLines && metricMode === 'density' && (
                        <>
                          <ReferenceLine
                            y={3.5}
                            stroke="#ef4444"
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                            label={{
                              value: 'CRITICAL CRUSH CEILING (3.5 /m²)',
                              fill: '#ef4444',
                              fontSize: 10,
                              position: 'top'
                            }}
                          />
                          <ReferenceLine
                            y={2.2}
                            stroke="#f59e0b"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                            label={{
                              value: 'WARNING STAGING LIMIT (2.2 /m²)',
                              fill: '#f59e0b',
                              fontSize: 10,
                              position: 'top'
                            }}
                          />
                        </>
                      )}

                      {/* Lines for each selected zone */}
                      {selectedZoneIds.map((zoneId) => {
                        const zone = zones.find((z) => z.id === zoneId);
                        const color = ZONE_CHART_COLORS[zoneId] || '#2563eb';
                        const dataKey = metricMode === 'density' ? `${zoneId}_density` : `${zoneId}_count`;

                        return (
                          <Line
                            key={zoneId}
                            type="monotone"
                            dataKey={dataKey}
                            name={zone ? zone.name : zoneId}
                            stroke={color}
                            strokeWidth={2.5}
                            dot={{ r: 2.5, fill: color }}
                            activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Side-by-Side Zone Comparison Metric Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Side-by-Side Sector Telemetry Breakdown
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {selectedZoneIds.length} Sectors Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedZoneIds.map((zoneId) => {
                const zone = zones.find((z) => z.id === zoneId);
                if (!zone) return null;
                const color = ZONE_CHART_COLORS[zoneId] || '#2563eb';

                // Calculate peak density observed across the granular timeline
                const peakObs = granularTimeSeriesData.reduce((prev, curr) => {
                  const currVal = curr[`${zoneId}_density`] || 0;
                  const prevVal = prev[`${zoneId}_density`] || 0;
                  return currVal > prevVal ? curr : prev;
                }, granularTimeSeriesData[0]);

                const peakDensity = peakObs ? peakObs[`${zoneId}_density`] : zone.density;
                const peakTime = peakObs ? peakObs.time : '18:00';

                return (
                  <div
                    key={zone.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all"
                  >
                    <div>
                      {/* Card Header with Color Indicator */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                          ></span>
                          <span className="font-mono text-xs font-bold text-slate-900">{zone.id}</span>
                        </div>

                        <span
                          className={`text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded ${
                            zone.densityStatus === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : zone.densityStatus === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {zone.densityStatus}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">{zone.name}</h4>
                      <p className="text-[11px] text-slate-400">{zone.tehsil}</p>

                      {/* Stat Metrics */}
                      <div className="mt-3 space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Current Density:</span>
                          <span className="font-mono font-bold" style={{ color: color }}>
                            {zone.density} persons/m²
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">24-Hour Peak:</span>
                          <span className="font-mono font-bold text-rose-600">
                            {peakDensity} /m² ({peakTime})
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Critical Limit:</span>
                          <span className="font-mono font-bold text-slate-700">
                            {zone.criticalThreshold} /m²
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Current Count:</span>
                          <span className="font-mono font-semibold text-slate-800">
                            {zone.currentCount.toLocaleString()} devotees
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">Arrival Flow:</span>
                          <span className="font-mono text-emerald-700 font-semibold">
                            +{zone.trendRate} /min
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span>Area: {zone.usableAreaSqM.toLocaleString()} m²</span>
                      <span>Cap: {zone.safeCapacity.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Granular Data Matrix Table (Collapsible) */}
          {showDataTable && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">
                  Granular Time-Series Observation Matrix
                </h4>
                <button
                  onClick={handleExportGranularCSV}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Table CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Event Phase</th>
                      {selectedZoneIds.map((zid) => {
                        const zone = zones.find((z) => z.id === zid);
                        return (
                          <th key={zid} className="py-2 px-3 font-bold text-slate-700">
                            {zone ? zone.name.split(' ')[0] : zid} ({metricMode === 'density' ? '/m²' : 'Count'})
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {displayedTimeSeriesData.map((d, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-slate-900">{d.time}</td>
                        <td className="py-2 px-3 text-slate-600 font-sans">{d.label}</td>
                        {selectedZoneIds.map((zid) => {
                          const val = metricMode === 'density' ? d[`${zid}_density`] : d[`${zid}_count`];
                          return (
                            <td key={zid} className="py-2 px-3 font-semibold text-slate-800">
                              {metricMode === 'density' ? `${val} /m²` : Number(val).toLocaleString()}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Operational Shift Overview & Incident Breakdown */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* KPI Stat Cards Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-slate-500 text-xs font-medium mb-1">Peak Hour Influx</div>
              <p className="text-xl font-bold font-mono text-slate-900">71,000</p>
              <span className="text-[10px] text-amber-600 font-medium">18:00 Godavari Maha Harathi</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-slate-500 text-xs font-medium mb-1">Mean Time to Resolve (MTTR)</div>
              <p className="text-xl font-bold font-mono text-emerald-600">8.4 min</p>
              <span className="text-[10px] text-slate-400">Target response &lt; 15 min</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-slate-500 text-xs font-medium mb-1">CCTV Fleet Reliability</div>
              <p className="text-xl font-bold font-mono text-blue-600">99.8%</p>
              <span className="text-[10px] text-emerald-600 font-medium">Zero network packet loss</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-slate-500 text-xs font-medium mb-1">Total Incidents Averted</div>
              <p className="text-xl font-bold font-mono text-indigo-600">14</p>
              <span className="text-[10px] text-slate-400">Via early route diversion</span>
            </div>
          </div>

          {/* Main Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diurnal Accumulation Area Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Diurnal Congregation Curve</h3>
                  <p className="text-[11px] text-slate-500">
                    Hourly aggregate volume across morning dip and evening Aarti
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  8 Monitoring Intervals
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="timeLabel" tick={{ fontSize: 9, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: any) => [Number(value).toLocaleString(), 'Pilgrims']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="totalPeople" stroke="#2563eb" fillOpacity={1} fill="url(#colorTotal)" name="Total Devotees" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bathing Ghat Comparison Bar Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ghat Loading Dynamics</h3>
                  <p className="text-[11px] text-slate-500">
                    Comparative bathing volume between Pushkar Ghat and Kotilingala
                  </p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="timeLabel" tick={{ fontSize: 9, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: any) => [Number(value).toLocaleString(), 'Devotees']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="pushkarGhat" name="Pushkar Ghat" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="kotilingalaGhat" name="Kotilingala Ghat" fill="#10b981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Incident Category Distribution & Audit Table */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Historical Incident Category Breakdown (Current Shift)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Overcrowding Threshold</span>
                <span className="text-base font-bold font-mono text-rose-600">6 events</span>
                <span className="text-[10px] text-slate-400 block mt-1">Promptly mitigated via diversion</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Rapid Train Surge Inflow</span>
                <span className="text-base font-bold font-mono text-orange-600">4 events</span>
                <span className="text-[10px] text-slate-400 block mt-1">Staggered platform gates</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Egress Choke Points</span>
                <span className="text-base font-bold font-mono text-amber-600">3 events</span>
                <span className="text-[10px] text-slate-400 block mt-1">Addressed by volunteer guides</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Emergency Corridor Clearance</span>
                <span className="text-base font-bold font-mono text-blue-600">2 events</span>
                <span className="text-[10px] text-slate-400 block mt-1">Zero ambulance delay</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
