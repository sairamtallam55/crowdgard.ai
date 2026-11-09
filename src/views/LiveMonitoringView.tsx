import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Upload,
  Camera as CameraIcon,
  Video,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { DetectionAdapter, DetectionResult } from '../services/detectionAdapter';
import { Camera, Zone, Alert } from '../types';

interface LiveMonitoringViewProps {
  cameras: Camera[];
  zones: Zone[];
  onTriggerAlertFromDetection: (zoneId: string, count: number, density: number) => void;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  cameras,
  zones,
  onTriggerAlertFromDetection
}) => {
  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || 'CAM-03');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.55);
  const [modelStatus, setModelStatus] = useState<{ loaded: boolean; loading: boolean; error: string | null }>(
    DetectionAdapter.getModelStatus()
  );

  // Video and Canvas Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Detection metrics
  const [detectedCount, setDetectedCount] = useState<number>(24);
  const [avgConfidence, setAvgConfidence] = useState<number>(0.84);
  const [fps, setFps] = useState<number>(28);
  const [latencyMs, setLatencyMs] = useState<number>(32);
  const [detectionEngine, setDetectionEngine] = useState<string>('Initializing...');
  const [customVideoUploaded, setCustomVideoUploaded] = useState<boolean>(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showZoneOverlay, setShowZoneOverlay] = useState<boolean>(true);

  const activeCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];
  const associatedZone = zones.find((z) => z.id === activeCamera?.zoneId) || zones[0];

  // Calculate live density from detected count
  const liveArea = associatedZone?.usableAreaSqM || 4000;
  // Scaled representative calculation for camera field of view:
  // camera FOV covers ~12% of total zone area
  const fovArea = Math.round(liveArea * 0.12);
  const liveDensity = Number((detectedCount / Math.max(1, fovArea)).toFixed(2));
  const isCritical = liveDensity >= (associatedZone?.criticalThreshold || 3.5);
  const isHigh = liveDensity >= (associatedZone?.warningThreshold || 2.2);

  // Initialize TFJS model on mount
  useEffect(() => {
    let mounted = true;
    DetectionAdapter.initializeModel().then(() => {
      if (mounted) {
        setModelStatus(DetectionAdapter.getModelStatus());
      }
    });
    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Frame processing loop
  const processFrame = useCallback(async () => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas) {
      const targetElement = (video && customVideoUploaded && video.readyState >= 2) ? video : canvas;

      try {
        const result: DetectionResult = await DetectionAdapter.detect(
          targetElement,
          confidenceThreshold
        );

        setDetectedCount(result.peopleCount);
        setAvgConfidence(result.confidenceAverage);
        setLatencyMs(result.processingTimeMs);
        setDetectionEngine(
          result.engineUsed === 'coco-ssd'
            ? 'TensorFlow.js COCO-SSD (MobileNetV2)'
            : 'Synthesized Vision Inference Pipeline'
        );

        if (showBoundingBoxes) {
          DetectionAdapter.renderOverlay(canvas, result.detections, {
            colorScheme: 'density-aware',
            showConfidence: true
          });
        } else {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (err) {
        console.warn('Detection processing exception:', err);
      }
    }

    // Schedule next frame sampling (~30 FPS throttle)
    animationFrameRef.current = window.setTimeout(() => {
      requestAnimationFrame(processFrame);
    }, 120);
  }, [isPlaying, confidenceThreshold, customVideoUploaded, showBoundingBoxes]);

  useEffect(() => {
    if (isPlaying) {
      processFrame();
    }
    return () => {
      if (animationFrameRef.current) {
        clearTimeout(animationFrameRef.current);
      }
    };
  }, [isPlaying, processFrame]);

  // Video file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setCustomVideoUploaded(true);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleResetFeed = () => {
    setCustomVideoUploaded(false);
    setCustomVideoUrl(null);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Controller & Feed Selector Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Live Computer Vision Feed &amp; Frame Extractor
            </h2>
            <p className="text-xs text-slate-500">
              Active Video Source: <span className="font-semibold text-slate-800">{activeCamera?.name}</span>
            </p>
          </div>
        </div>

        {/* Camera Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {cameras.slice(0, 5).map((cam) => (
            <button
              key={cam.id}
              onClick={() => {
                setSelectedCameraId(cam.id);
                setCustomVideoUploaded(false);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCameraId === cam.id && !customVideoUploaded
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cam.id}: {cam.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Upload Custom MP4 Button */}
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer shadow-2xs transition-colors shrink-0">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload CCTV Video (.mp4)</span>
          <input
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Main Monitoring Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Video Viewport & Overlays */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg aspect-video flex items-center justify-center">
            {/* Custom Video Element when user uploads file */}
            {customVideoUploaded && customVideoUrl ? (
              <video
                ref={videoRef}
                src={customVideoUrl}
                loop
                muted
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              /* Simulated CCTV Riverfront Feed with Canvas Drawing */
              <div className="relative w-full h-full bg-radial from-slate-900 to-slate-950 flex flex-col justify-between p-4">
                {/* Simulated crowd congregation background */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* River water gradient at base representing Godavari */}
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-cyan-950/80 to-transparent pointer-events-none"></div>
              </div>
            )}

            {/* Computer Vision Bounding Box Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={720}
              height={405}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Tactical Feed Telemetry Overlay */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-slate-900/90 text-white px-2 py-0.5 rounded border border-slate-700">
                {activeCamera?.id} · {activeCamera?.type}
              </span>

              <div className="flex items-center gap-1.5 bg-emerald-950/90 border border-emerald-800 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{customVideoUploaded ? 'CUSTOM VIDEO FILE' : 'SYNTHESIZED CCTV STREAM'}</span>
              </div>
            </div>

            {/* Top Right: Inference Engine Badge */}
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-slate-900/90 border border-cyan-800 text-cyan-300 text-[10px] font-mono px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-md">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>{detectionEngine}</span>
              </div>
            </div>

            {/* Zone Warning Overlay Badge */}
            {showZoneOverlay && (
              <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 border border-slate-700 text-white p-2.5 rounded-lg backdrop-blur-xs text-xs space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{associatedZone?.name}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isCritical
                        ? 'bg-rose-600 text-white'
                        : isHigh
                        ? 'bg-orange-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {liveDensity} /m² ({isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'NORMAL'})
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Perimeter safe limit: {associatedZone?.safeCapacity.toLocaleString()} devotees
                </p>
              </div>
            )}

            {/* Live Count Heads-Up Display */}
            <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 border border-slate-700 p-2.5 rounded-lg text-right backdrop-blur-xs">
              <p className="text-[10px] text-slate-400 uppercase font-mono">In-Frame Count</p>
              <p className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
                {detectedCount} <span className="text-xs text-slate-300">persons</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Conf: {Math.round(avgConfidence * 100)}%</p>
            </div>
          </div>

          {/* Video Player Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause Feed' : 'Resume Feed'}</span>
              </button>

              <button
                onClick={handleResetFeed}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            </div>

            {/* Detection Overlay Controls */}
            <div className="flex items-center gap-4 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBoundingBoxes}
                  onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Bounding Boxes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showZoneOverlay}
                  onChange={(e) => setShowZoneOverlay(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Zone Info Overlay</span>
              </label>
            </div>

            {/* Confidence Slider */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Confidence:</span>
              <input
                type="range"
                min="0.30"
                max="0.90"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-24 accent-blue-600"
              />
              <span className="text-xs font-mono font-bold text-slate-800">
                {Math.round(confidenceThreshold * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Tactical Telemetry & Alert Dispatch */}
        <div className="space-y-4">
          {/* Pipeline Stage Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Detection Pipeline Telemetry
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Model Framework</span>
                <span className="font-semibold text-slate-900 font-mono">TensorFlow.js (COCO-SSD)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Inference Latency</span>
                <span className="font-semibold text-blue-700 font-mono">{latencyMs} ms / frame</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Sample Stream Rate</span>
                <span className="font-semibold text-emerald-700 font-mono">{fps} FPS</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Associated Sector</span>
                <span className="font-semibold text-slate-900">{associatedZone?.name}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Estimated Field Density</span>
                <span
                  className={`font-bold font-mono ${
                    isCritical ? 'text-rose-600' : isHigh ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {liveDensity} persons / m²
                </span>
              </div>
            </div>

            {/* Density Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600">
                <span>Field Capacity Saturation</span>
                <span className="font-mono">{Math.min(100, Math.round((liveDensity / 3.5) * 100))}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (liveDensity / 3.5) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Trigger Alert Button */}
            <button
              onClick={() => onTriggerAlertFromDetection(associatedZone?.id, detectedCount, liveDensity)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Dispatch Automated Crowd Alert</span>
            </button>
          </div>

          {/* Architecture & Compliance Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real Vision vs Synthetic Boundary</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              This module runs real in-browser person detection via TensorFlow.js MobileNetV2 when supported. Uploaded MP4 videos are processed frame-by-frame on client canvas without transmitting raw CCTV streams over public networks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
