import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import { CongestionPrediction, Zone } from '../types';
import { ApiService } from '../services/api';

interface PredictionViewProps {
  predictions: CongestionPrediction[];
  zones: Zone[];
  onOpenAiAssistant: () => void;
}

export const PredictionView: React.FC<PredictionViewProps> = ({
  predictions,
  zones,
  onOpenAiAssistant
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(predictions[0]?.zoneId || 'ZONE-07');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const selectedPred = predictions.find((p) => p.zoneId === selectedZoneId) || predictions[0];
  const associatedZone = zones.find((z) => z.id === selectedZoneId);

  const handleRunAiForecast = async () => {
    setAnalyzing(true);
    try {
      const res = await ApiService.getIncidentExplanation('FORECAST-ANOMALY', selectedZoneId);
      setAiAnalysis(res.explanation);
    } catch (e) {
      console.warn('Prediction AI analysis error:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Crowd Congestion & Inflow Trajectory Forecasting
          </h2>
          <p className="text-xs text-slate-500">
            Predictive time-horizon models (15m · 30m · 60m) based on train arrivals, bathing muhurthams & velocity gradients
          </p>
        </div>

        <button
          onClick={handleRunAiForecast}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          <span>Generate Gemini Risk Audit</span>
        </button>
      </div>

      {/* Zone Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {predictions.map((p) => (
          <button
            key={p.zoneId}
            onClick={() => {
              setSelectedZoneId(p.zoneId);
              setAiAnalysis(null);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedZoneId === p.zoneId
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{p.zoneName}</span>
            <span
              className={`ml-2 text-[10px] font-mono px-1.5 py-0.2 rounded ${
                p.riskCategory === 'Severe'
                  ? 'bg-rose-500 text-white'
                  : p.riskCategory === 'High'
                  ? 'bg-orange-500 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {p.riskCategory}
            </span>
          </button>
        ))}
      </div>

      {/* Main Prediction Display Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Time Horizon Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Horizon Forecast Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 15 Mins */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">T + 15 Minutes</span>
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {selectedPred.predicted15Min.toLocaleString()}
              </p>
              <div className="text-[11px] text-amber-700 font-medium">
                +{selectedPred.predicted15Min - selectedPred.currentCount} net arrivals
              </div>
            </div>

            {/* 30 Mins */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">T + 30 Minutes</span>
                <Clock className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <p className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {selectedPred.predicted30Min.toLocaleString()}
              </p>
              <div className="text-[11px] text-orange-700 font-medium">
                +{selectedPred.predicted30Min - selectedPred.currentCount} net arrivals
              </div>
            </div>

            {/* 60 Mins */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">T + 60 Minutes</span>
                <Clock className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <p className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                {selectedPred.predicted60Min.toLocaleString()}
              </p>
              <div className="text-[11px] text-rose-700 font-medium">
                +{selectedPred.predicted60Min - selectedPred.currentCount} net arrivals
              </div>
            </div>
          </div>

          {/* Root Contributing Factors */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Primary Ingress Drivers &amp; Hydraulic Choke Factors
            </h3>

            <div className="space-y-2">
              {selectedPred.contributingFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                >
                  <span className="font-mono text-blue-600 font-bold">0{idx + 1}.</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Proactive Intervention */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Recommended Proactive Intervention Directive</span>
            </div>
            <p className="text-xs text-blue-950 font-medium leading-relaxed">
              {selectedPred.recommendedProactiveIntervention}
            </p>
          </div>

          {/* AI Risk Audit if triggered */}
          {aiAnalysis && (
            <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white tracking-wide">
                    Gemini AI Root Cause &amp; Sector Audit
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">GEMINI 3.8 FLASH</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {aiAnalysis}
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Mathematical Baseline & Confidence */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Model Confidence &amp; Methodology
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Forecast Confidence Index</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedPred.forecastConfidence}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${selectedPred.forecastConfidence}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Methodology Engine
                </span>
                <p className="font-mono text-[11px] text-slate-800 font-medium">
                  {selectedPred.methodology}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Safe Perimeter Ceiling
                </span>
                <p className="font-mono text-xs text-slate-800 font-bold">
                  {associatedZone?.safeCapacity.toLocaleString()} devotees
                </p>
              </div>
            </div>
          </div>

          {/* Model Transparency Disclaimer */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Statistical Validation Note</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Predictions combine historical Godavari Pushkaralu flow rates with real-time ingress velocity. Projections are indicative guidelines for proactive staging and do not guarantee physical crowd dynamics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
