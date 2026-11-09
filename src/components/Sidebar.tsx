import React from 'react';
import {
  LayoutDashboard,
  Video,
  Cctv,
  MapPin,
  TrendingUp,
  GitFork,
  BellRing,
  Layers,
  BarChart3,
  Settings,
  Shield,
  Sparkles,
  Radio
} from 'lucide-react';

export type NavView =
  | 'overview'
  | 'live-monitoring'
  | 'cameras'
  | 'heatmap'
  | 'prediction'
  | 'routes'
  | 'alerts'
  | 'zones'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  unreadAlertsCount: number;
  criticalZonesCount: number;
  onOpenAiAssistant: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  unreadAlertsCount,
  criticalZonesCount,
  onOpenAiAssistant
}) => {
  const navItems = [
    { id: 'overview' as NavView, label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'live-monitoring' as NavView, label: 'Live Crowd Monitoring', icon: Video, badge: 'AI Vision' },
    { id: 'cameras' as NavView, label: 'Camera Management', icon: Cctv },
    { id: 'heatmap' as NavView, label: 'Crowd Density Heatmap', icon: MapPin },
    { id: 'prediction' as NavView, label: 'Congestion Prediction', icon: TrendingUp },
    { id: 'routes' as NavView, label: 'Smart Route Management', icon: GitFork },
    {
      id: 'alerts' as NavView,
      label: 'Alerts & Incidents',
      icon: BellRing,
      count: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
      countColor: 'bg-rose-500'
    },
    {
      id: 'zones' as NavView,
      label: 'Zone Management',
      icon: Layers,
      count: criticalZonesCount > 0 ? criticalZonesCount : undefined,
      countColor: 'bg-amber-500'
    },
    { id: 'analytics' as NavView, label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'settings' as NavView, label: 'Settings & Admin', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">CrowdGuard AI</span>
            </div>
            <p className="text-[10px] text-cyan-400 font-medium tracking-wide">RMC · RTIH PUSHKARALU 2027</p>
          </div>
        </div>

        <div className="mt-3 px-2.5 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-medium">Grid Status</span>
          </div>
          <span className="text-emerald-400 font-mono text-[10px] font-semibold">ONLINE</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Command Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {item.badge}
                </span>
              )}

              {item.count !== undefined && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded text-white ${
                    item.countColor || 'bg-slate-700'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Assistant Quick Launcher Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={onOpenAiAssistant}
          className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border border-cyan-500/40 text-left hover:border-cyan-400 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-semibold text-white">Gemini Advisor</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">v3.8</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
            Ask for tactical insights & root causes
          </p>
        </button>
      </div>

      {/* Host / Stakeholder Stamp */}
      <div className="px-4 py-2.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <span className="truncate">RMC Command Center</span>
        <span className="font-mono text-slate-400">AP-GRID</span>
      </div>
    </aside>
  );
};
