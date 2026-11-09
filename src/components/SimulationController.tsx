import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  VideoOff,
  GitFork,
  X,
  Gauge
} from 'lucide-react';

interface SimulationControllerProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onIncreaseCrowd: () => void;
  onDecreaseCrowd: () => void;
  onTriggerAlert: () => void;
  onSimulateCamDisconnect: () => void;
  onDemonstrateRouteDiversion: () => void;
  onClose: () => void;
}

export const SimulationController: React.FC<SimulationControllerProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  onIncreaseCrowd,
  onDecreaseCrowd,
  onTriggerAlert,
  onSimulateCamDisconnect,
  onDemonstrateRouteDiversion,
  onClose
}) => {
  return (
    <div className="fixed bottom-6 right-6 w-96 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-slate-700/80 p-4 z-50 animate-in fade-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">
              Hackathon Demo Simulation Deck
            </h4>
            <p className="text-[10px] text-slate-400">
              Interactive test harness for judges & live evaluation
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Clock Controls */}
      <div className="py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Clock</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Clock</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{isRunning ? 'RUNNING' : 'PAUSED'}</span>
        </div>
      </div>

      {/* Synthetic Trigger Grid */}
      <div className="space-y-2 pt-1 border-t border-slate-800">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Live Inflow & Incident Injectors
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onIncreaseCrowd}
            className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-amber-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+25% Surge</span>
          </button>

          <button
            onClick={onDecreaseCrowd}
            className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-25% Dispersal</span>
          </button>
        </div>

        <div className="space-y-1.5 pt-1">
          <button
            onClick={onTriggerAlert}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 border border-rose-800 text-xs font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Inject Pushkar Ghat Surge Alert</span>
            </div>
            <span className="text-[9px] font-mono bg-rose-900/80 px-1 py-0.5 rounded text-white">
              CRITICAL
            </span>
          </button>

          <button
            onClick={onSimulateCamDisconnect}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <VideoOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Cam-04 Drop / Offline</span>
            </div>
            <span className="text-[9px] font-mono bg-amber-900/60 px-1 py-0.5 rounded text-amber-200">
              FAILOVER
            </span>
          </button>

          <button
            onClick={onDemonstrateRouteDiversion}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-cyan-300 hover:text-cyan-100 border border-blue-800 text-xs font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <GitFork className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trigger Smart Route Diversion</span>
            </div>
            <span className="text-[9px] font-mono bg-cyan-900/60 px-1 py-0.5 rounded text-cyan-200">
              SMART FLOW
            </span>
          </button>
        </div>
      </div>

      {/* Compliance Disclaimer */}
      <div className="mt-3 pt-2 border-t border-slate-800 text-[9px] text-slate-400 flex items-center justify-between">
        <span>Godavari Pushkaralu RMC Innovation Grid</span>
        <span className="font-mono text-cyan-400">DEMO ENVIRONMENT</span>
      </div>
    </div>
  );
};
