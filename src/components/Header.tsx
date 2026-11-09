import React from 'react';
import {
  Bell,
  Sparkles,
  Sliders,
  UserCheck,
  Flame,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { CurrentUser, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { NavView } from './Sidebar';

interface HeaderProps {
  currentView: NavView;
  currentUser: CurrentUser;
  onSwitchUser: (user: CurrentUser) => void;
  onOpenAiAssistant: () => void;
  onToggleSimController: () => void;
  showSimController: boolean;
  onTriggerSurge: () => void;
  onResetDemo: () => void;
  activeAlertCount: number;
}

const VIEW_TITLES: Record<NavView, { title: string; subtitle: string }> = {
  overview: {
    title: 'Central Command Overview',
    subtitle: 'Godavari Pushkaralu 2027 · Real-Time Congregation Telemetry'
  },
  'live-monitoring': {
    title: 'Live Computer Vision Surveillance',
    subtitle: 'COCO-SSD Person Detection · Automated Density Pipeline'
  },
  cameras: {
    title: 'Municipal CCTV & Drone Fleet',
    subtitle: '12 Optical, PTZ, Thermal & Drone Sensors in Rajamahendravaram'
  },
  heatmap: {
    title: 'Geographic Crowd Density Heatmap',
    subtitle: 'Spatial Riverfront Distribution & Congestion Hotspots'
  },
  prediction: {
    title: 'Congestion & Surge Forecasting',
    subtitle: '15m / 30m / 60m Predictive Models & Ingress Trajectories'
  },
  routes: {
    title: 'Smart Pedestrian Flow & Diversions',
    subtitle: 'Dynamic Ingress/Egress Corridors & Red Medical Access'
  },
  alerts: {
    title: 'Alert & Incident Response Command',
    subtitle: 'Automated Threshold Triggers & Multi-Agency Dispatch'
  },
  zones: {
    title: 'Zone Capacity & Perimeter Registry',
    subtitle: 'Monitored Bathing Ghats, Railway Platforms & Holding Grounds'
  },
  analytics: {
    title: 'Crowd Intelligence Analytics & Reports',
    subtitle: 'Diurnal Flow Trends, Choke Point Audits & Formal PDF Reports'
  },
  settings: {
    title: 'System Configuration & Access Governance',
    subtitle: 'RMC Command Thresholds, Role-Based Access & Audit Trail'
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  currentUser,
  onSwitchUser,
  onOpenAiAssistant,
  onToggleSimController,
  showSimController,
  onTriggerSurge,
  onResetDemo,
  activeAlertCount
}) => {
  const viewInfo = VIEW_TITLES[currentView] || {
    title: 'CrowdGuard AI',
    subtitle: 'Godavari Pushkaralu 2027'
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left: Context Breadcrumb */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Pushkaralu 2027 Command</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">{viewInfo.title}</span>
        </div>
        <p className="text-[11px] text-slate-500 truncate max-w-lg">{viewInfo.subtitle}</p>
      </div>

      {/* Center: Prominent Demo Controls Bar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-md text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="font-semibold text-[11px] tracking-wide">DEMO MODE</span>
          <span className="text-amber-400">|</span>
          <button
            onClick={onTriggerSurge}
            title="Simulate sudden crowd surge at Pushkar Ghat"
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-rose-200 hover:bg-rose-50 transition-colors"
          >
            <Flame className="w-3 h-3 text-rose-500" />
            Simulate Surge
          </button>
          <button
            onClick={onResetDemo}
            title="Reset dataset to initial Pushkaralu baseline"
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            Reset
          </button>
          <button
            onClick={onToggleSimController}
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors ${
              showSimController
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3 h-3" />
            Controls
          </button>
        </div>
      </div>

      {/* Right: Actions, AI Advisor, Role Switcher */}
      <div className="flex items-center gap-3">
        {/* AI Quick Button */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-semibold shadow-xs hover:from-blue-700 hover:to-cyan-700 transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini Intelligence</span>
        </button>

        {/* User Role Switcher */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
              {currentUser.role}
            </p>
          </div>

          <div className="relative group">
            <button
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
              title="Switch Demo Role"
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
            </button>

            {/* Dropdown for Role Switching */}
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 hidden group-hover:block group-focus-within:block z-50">
              <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Active Operational Role
              </div>
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => onSwitchUser(user)}
                  className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex flex-col ${
                    currentUser.id === user.id ? 'bg-blue-50/70 border-l-2 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{user.name}</span>
                    <span className="text-[9px] font-mono text-slate-500">{user.badgeId}</span>
                  </div>
                  <span className="text-[11px] text-blue-700 font-medium">{user.role}</span>
                  <span className="text-[10px] text-slate-400 truncate">{user.department}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
