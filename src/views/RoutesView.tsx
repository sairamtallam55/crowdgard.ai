import React from 'react';
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Navigation,
  ArrowRight,
  Flame,
  Check,
  Ban
} from 'lucide-react';
import { RouteSegment } from '../types';

interface RoutesViewProps {
  routes: RouteSegment[];
  onToggleRouteStatus: (routeId: string, newStatus: RouteSegment['currentStatus']) => void;
  onApproveRoute: (routeId: string) => void;
}

export const RoutesView: React.FC<RoutesViewProps> = ({
  routes,
  onToggleRouteStatus,
  onApproveRoute
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Intelligent Pedestrian Corridor &amp; Diversion Management
          </h2>
          <p className="text-xs text-slate-500">
            Dynamically divert pilgrim influx from high-density bottlenecks into secondary low-load ghat approaches
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Clear Bypass
          </span>
          <span className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Red Emergency Corridor
          </span>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map((route) => {
          const isCongested = route.currentStatus === 'congested';
          const isEmergency = route.isEmergencyCorridor;
          const isAlternative = route.isRecommendedAlternative;

          return (
            <div
              key={route.id}
              className={`rounded-xl border p-5 space-y-4 transition-all shadow-2xs ${
                isEmergency
                  ? 'bg-rose-50/40 border-rose-200'
                  : isAlternative
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {route.id}
                    </span>

                    {isEmergency && (
                      <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        EMERGENCY ONLY
                      </span>
                    )}

                    {isAlternative && (
                      <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        RECOMMENDED DIVERSION
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5">{route.name}</h3>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase font-mono px-2 py-1 rounded ${
                    route.currentStatus === 'congested'
                      ? 'bg-rose-100 text-rose-800'
                      : route.currentStatus === 'clear'
                      ? 'bg-emerald-100 text-emerald-800'
                      : route.currentStatus === 'slow'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {route.currentStatus}
                </span>
              </div>

              {/* Waypoints */}
              <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-medium">{route.fromLocation}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-blue-700">{route.toLocation}</span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-[11px] bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Distance</span>
                  <span className="font-mono font-bold text-slate-900">
                    {(route.distanceMeters / 1000).toFixed(1)} km
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated Walk</span>
                  <span className="font-mono font-bold text-slate-900">
                    {route.estimatedTravelTimeMin} mins
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Average Density</span>
                  <span
                    className={`font-mono font-bold ${
                      route.averageDensity > 2.0
                        ? 'text-rose-600'
                        : route.averageDensity > 1.2
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {route.averageDensity} /m²
                  </span>
                </div>
              </div>

              {/* Control Action Buttons */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                <div className="text-[11px] text-slate-500 font-medium">
                  Approval: <span className="text-slate-800 uppercase font-mono">{route.approvalStatus}</span>
                </div>

                <div className="flex items-center gap-2">
                  {route.currentStatus !== 'diverted' && !isEmergency && (
                    <button
                      onClick={() => onToggleRouteStatus(route.id, 'diverted')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                    >
                      Divert Pedestrian Flow
                    </button>
                  )}

                  {route.currentStatus === 'diverted' && (
                    <button
                      onClick={() => onToggleRouteStatus(route.id, 'clear')}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                    >
                      Restore Direct Access
                    </button>
                  )}

                  {route.approvalStatus !== 'approved' && (
                    <button
                      onClick={() => onApproveRoute(route.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-colors"
                    >
                      Approve Route
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Policy Box */}
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
        <div className="font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Statutory Crowd Safety Routing Requirement</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          In accordance with Godavari Pushkaralu Disaster Management protocols, pedestrian routes must never be diverted through unpaved alleys, unguarded railway level crossings, or restricted flood embankments without prior verification by the RMC Engineering Wing.
        </p>
      </div>
    </div>
  );
};
