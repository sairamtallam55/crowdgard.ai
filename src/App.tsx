import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, NavView } from './components/Sidebar';
import { Header } from './components/Header';
import { SimulationController } from './components/SimulationController';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';

// Views
import { OverviewView } from './views/OverviewView';
import { LiveMonitoringView } from './views/LiveMonitoringView';
import { CameraManagementView } from './views/CameraManagementView';
import { HeatmapView } from './views/HeatmapView';
import { PredictionView } from './views/PredictionView';
import { RoutesView } from './views/RoutesView';
import { AlertsView } from './views/AlertsView';
import { ZonesView } from './views/ZonesView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';

// API & Types
import { ApiService } from './services/api';
import {
  Zone,
  Camera,
  Alert,
  RouteSegment,
  CongestionPrediction,
  SystemSettings,
  CurrentUser,
  HistoricalObservation,
  AlertStatus
} from './types';
import {
  INITIAL_ZONES,
  INITIAL_CAMERAS,
  INITIAL_ALERTS,
  INITIAL_ROUTES,
  INITIAL_PREDICTIONS,
  HISTORICAL_OBSERVATIONS,
  INITIAL_SETTINGS,
  DEMO_USERS
} from './data/mockData';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('overview');
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [routes, setRoutes] = useState<RouteSegment[]>(INITIAL_ROUTES);
  const [predictions, setPredictions] = useState<CongestionPrediction[]>(INITIAL_PREDICTIONS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [historicalData, setHistoricalData] = useState<HistoricalObservation[]>(HISTORICAL_OBSERVATIONS);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DEMO_USERS[0]);

  // UI state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showSimController, setShowSimController] = useState(true);
  const [isSimRunning, setIsSimRunning] = useState(true);

  // Fetch initial data from server
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [z, c, a, r, p, s, analytics] = await Promise.all([
          ApiService.getZones(),
          ApiService.getCameras(),
          ApiService.getAlerts(),
          ApiService.getRoutes(),
          ApiService.getPredictions(),
          ApiService.getSettings(),
          ApiService.getAnalytics()
        ]);
        if (mounted) {
          if (z?.length) setZones(z);
          if (c?.length) setCameras(c);
          if (a?.length) setAlerts(a);
          if (r?.length) setRoutes(r);
          if (p?.length) setPredictions(p);
          if (s) setSettings(s);
          if (analytics?.history?.length) setHistoricalData(analytics.history);
        }
      } catch (err) {
        console.warn('Backend load note, using baseline data:', err);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Simulation Clock: subtly fluctuates crowd density and calculates status
  useEffect(() => {
    if (!isSimRunning) return;

    const interval = setInterval(() => {
      setZones((prevZones) =>
        prevZones.map((zone) => {
          // Slight natural fluctuation (-15 to +25 people)
          const delta = Math.floor(Math.random() * 40 - 15);
          const newCount = Math.max(500, zone.currentCount + delta);
          const density = Number((newCount / zone.usableAreaSqM).toFixed(2));

          let densityStatus: Zone['densityStatus'] = 'normal';
          if (density >= zone.criticalThreshold) {
            densityStatus = 'critical';
          } else if (density >= zone.warningThreshold) {
            densityStatus = 'high';
          } else if (density >= zone.warningThreshold * 0.7) {
            densityStatus = 'moderate';
          }

          return {
            ...zone,
            currentCount: newCount,
            density,
            densityStatus,
            trendRate: delta * 3,
            lastUpdated: 'Just now'
          };
        })
      );
    }, settings.refreshIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [isSimRunning, settings.refreshIntervalSec]);

  // Handlers for Zone & Camera Management
  const handleUpdateZone = async (id: string, updates: Partial<Zone>) => {
    try {
      const updated = await ApiService.updateZone(id, updates);
      setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...updated } : z)));
    } catch {
      setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...updates } : z)));
    }
  };

  const handleAddZone = async (newZoneData: Partial<Zone>) => {
    try {
      const created = await ApiService.createZone(newZoneData);
      setZones((prev) => [...prev, created]);
    } catch {
      const fallback: Zone = {
        id: `ZONE-${String(zones.length + 1).padStart(2, '0')}`,
        name: newZoneData.name || 'New Sector',
        tehsil: newZoneData.tehsil || 'Rajamahendravaram',
        category: newZoneData.category || 'ghat',
        latitude: newZoneData.latitude || 17.001,
        longitude: newZoneData.longitude || 81.77,
        usableAreaSqM: newZoneData.usableAreaSqM || 3000,
        safeCapacity: newZoneData.safeCapacity || 6000,
        currentCount: 3000,
        density: 1.0,
        densityStatus: 'normal',
        trendRate: 10,
        assignedCameraIds: ['CAM-01'],
        warningThreshold: 2.0,
        criticalThreshold: 3.5,
        isActive: true,
        lastUpdated: 'Just now'
      };
      setZones((prev) => [...prev, fallback]);
    }
  };

  const handleUpdateCamera = async (id: string, updates: Partial<Camera>) => {
    try {
      const updated = await ApiService.updateCamera(id, updates);
      setCameras((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    } catch {
      setCameras((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    }
  };

  const handleAddCamera = async (newCamData: Partial<Camera>) => {
    try {
      const created = await ApiService.createCamera(newCamData);
      setCameras((prev) => [...prev, created]);
    } catch {
      const fallback: Camera = {
        id: `CAM-${String(cameras.length + 1).padStart(2, '0')}`,
        name: newCamData.name || 'New Camera',
        zoneId: newCamData.zoneId || 'ZONE-01',
        zoneName: newCamData.zoneName || 'Kotilingala Ghat',
        type: newCamData.type || 'Fixed Optical',
        resolution: '1080p Full HD',
        fps: 30,
        streamUrl: newCamData.streamUrl || 'rtsp://rmc-cctv.godavari.gov.in/live/new',
        status: 'active',
        detectionStatus: 'running',
        lastPing: 'Just now',
        confidenceThreshold: 0.7,
        isDemoStream: true
      };
      setCameras((prev) => [...prev, fallback]);
    }
  };

  // Alert Handlers
  const handleUpdateAlertStatus = async (
    alertId: string,
    status: AlertStatus,
    officer?: string
  ) => {
    try {
      const updated = await ApiService.updateAlertStatus(alertId, status, officer);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
    } catch {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, status, assignedOfficer: officer || a.assignedOfficer } : a
        )
      );
    }
  };

  // Route Handlers
  const handleToggleRouteStatus = async (routeId: string, newStatus: RouteSegment['currentStatus']) => {
    try {
      const updated = await ApiService.updateRoute(routeId, { currentStatus: newStatus });
      setRoutes((prev) => prev.map((r) => (r.id === routeId ? updated : r)));
    } catch {
      setRoutes((prev) =>
        prev.map((r) => (r.id === routeId ? { ...r, currentStatus: newStatus } : r))
      );
    }
  };

  const handleApproveRoute = async (routeId: string) => {
    try {
      const updated = await ApiService.updateRoute(routeId, { approvalStatus: 'approved' });
      setRoutes((prev) => prev.map((r) => (r.id === routeId ? updated : r)));
    } catch {
      setRoutes((prev) =>
        prev.map((r) => (r.id === routeId ? { ...r, approvalStatus: 'approved' } : r))
      );
    }
  };

  // Simulation Deck Triggers
  const handleResetSimulation = async () => {
    await ApiService.resetDemo();
    setZones(INITIAL_ZONES);
    setCameras(INITIAL_CAMERAS);
    setAlerts(INITIAL_ALERTS);
    setRoutes(INITIAL_ROUTES);
    setPredictions(INITIAL_PREDICTIONS);
  };

  const handleIncreaseCrowd = () => {
    setZones((prev) =>
      prev.map((z) => {
        const newCount = Math.round(z.currentCount * 1.25);
        const density = Number((newCount / z.usableAreaSqM).toFixed(2));
        return {
          ...z,
          currentCount: newCount,
          density,
          densityStatus: density >= z.criticalThreshold ? 'critical' : density >= z.warningThreshold ? 'high' : 'moderate',
          trendRate: z.trendRate + 40
        };
      })
    );
  };

  const handleDecreaseCrowd = () => {
    setZones((prev) =>
      prev.map((z) => {
        const newCount = Math.round(z.currentCount * 0.75);
        const density = Number((newCount / z.usableAreaSqM).toFixed(2));
        return {
          ...z,
          currentCount: newCount,
          density,
          densityStatus: density < 1.5 ? 'normal' : density < 2.5 ? 'moderate' : 'high',
          trendRate: Math.max(-50, z.trendRate - 40)
        };
      })
    );
  };

  const handleTriggerSurgeAlert = async () => {
    await ApiService.simulateSurge('ZONE-02', 1.35);
    // Reload zones and alerts
    const [updatedZones, updatedAlerts] = await Promise.all([
      ApiService.getZones(),
      ApiService.getAlerts()
    ]);
    if (updatedZones?.length) setZones(updatedZones);
    if (updatedAlerts?.length) setAlerts(updatedAlerts);
  };

  const handleSimulateCamDisconnect = () => {
    setCameras((prev) =>
      prev.map((c) =>
        c.id === 'CAM-04' ? { ...c, status: c.status === 'active' ? 'offline' : 'active' } : c
      )
    );
  };

  const handleDemonstrateRouteDiversion = () => {
    handleToggleRouteStatus('RTE-01', 'congested');
    handleToggleRouteStatus('RTE-02', 'clear');
    setCurrentView('routes');
  };

  const handleTriggerAlertFromDetection = (zoneId: string, count: number, density: number) => {
    const targetZone = zones.find((z) => z.id === zoneId) || zones[0];
    const newAlert: Alert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      zoneId: targetZone.id,
      zoneName: targetZone.name,
      severity: density >= targetZone.criticalThreshold ? 'critical' : 'high',
      category: 'Overcrowding',
      title: `Vision Detection Threshold Exceeded (${density} /m²)`,
      description: `Automated person counting registered high concentration of ${count} people in camera field of view in ${targetZone.name}.`,
      recommendedAction: 'Verify via secondary PTZ preset; dispatch queue management wardens.',
      assignedDepartment: 'Integrated Command Center / Ward Wardens',
      status: 'new',
      timestamp: 'Just now'
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setCurrentView('alerts');
  };

  const unreadAlertsCount = alerts.filter((a) => a.status === 'new').length;
  const criticalZonesCount = zones.filter((z) => z.densityStatus === 'critical').length;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-900 font-sans">
      {/* Dark Navy Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        unreadAlertsCount={unreadAlertsCount}
        criticalZonesCount={criticalZonesCount}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <Header
          currentView={currentView}
          currentUser={currentUser}
          onSwitchUser={(user) => setCurrentUser(user)}
          onOpenAiAssistant={() => setIsAiModalOpen(true)}
          onToggleSimController={() => setShowSimController(!showSimController)}
          showSimController={showSimController}
          onTriggerSurge={handleTriggerSurgeAlert}
          onResetDemo={handleResetSimulation}
          activeAlertCount={unreadAlertsCount}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {currentView === 'overview' && (
              <OverviewView
                zones={zones}
                cameras={cameras}
                alerts={alerts}
                onNavigateTo={(view) => setCurrentView(view)}
                onOpenAiAssistant={() => setIsAiModalOpen(true)}
                onAcknowledgeAlert={(id) => handleUpdateAlertStatus(id, 'acknowledged')}
              />
            )}

            {currentView === 'live-monitoring' && (
              <LiveMonitoringView
                cameras={cameras}
                zones={zones}
                onTriggerAlertFromDetection={handleTriggerAlertFromDetection}
              />
            )}

            {currentView === 'cameras' && (
              <CameraManagementView
                cameras={cameras}
                onUpdateCamera={handleUpdateCamera}
                onAddCamera={handleAddCamera}
                onSelectForMonitoring={(camId) => {
                  setCurrentView('live-monitoring');
                }}
              />
            )}

            {currentView === 'heatmap' && (
              <HeatmapView
                zones={zones}
                routes={routes}
                onSelectZone={(zoneId) => {
                  // Optionally open inspector
                }}
              />
            )}

            {currentView === 'prediction' && (
              <PredictionView
                predictions={predictions}
                zones={zones}
                onOpenAiAssistant={() => setIsAiModalOpen(true)}
              />
            )}

            {currentView === 'routes' && (
              <RoutesView
                routes={routes}
                onToggleRouteStatus={handleToggleRouteStatus}
                onApproveRoute={handleApproveRoute}
              />
            )}

            {currentView === 'alerts' && (
              <AlertsView
                alerts={alerts}
                onUpdateAlertStatus={handleUpdateAlertStatus}
                onOpenAiAssistant={() => setIsAiModalOpen(true)}
              />
            )}

            {currentView === 'zones' && (
              <ZonesView
                zones={zones}
                onUpdateZone={handleUpdateZone}
                onAddZone={handleAddZone}
              />
            )}

            {currentView === 'analytics' && (
              <AnalyticsView
                zones={zones}
                alerts={alerts}
                historicalData={historicalData}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={(newSettings) => {
                  setSettings({ ...settings, ...newSettings });
                  ApiService.updateSettings(newSettings);
                }}
                currentUser={currentUser}
              />
            )}
          </div>
        </main>
      </div>

      {/* Floating Presenter Simulation Controller */}
      {showSimController && (
        <SimulationController
          isRunning={isSimRunning}
          onTogglePlay={() => setIsSimRunning(!isSimRunning)}
          onReset={handleResetSimulation}
          onIncreaseCrowd={handleIncreaseCrowd}
          onDecreaseCrowd={handleDecreaseCrowd}
          onTriggerAlert={handleTriggerSurgeAlert}
          onSimulateCamDisconnect={handleSimulateCamDisconnect}
          onDemonstrateRouteDiversion={handleDemonstrateRouteDiversion}
          onClose={() => setShowSimController(false)}
        />
      )}

      {/* Gemini AI Intelligence Assistant Modal */}
      <GeminiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        zones={zones}
        alerts={alerts}
      />
    </div>
  );
}
