/**
 * CrowdGuard AI - Frontend API Service
 * Handles communication with fullstack Express backend with robust error fallback.
 */

import {
  Zone,
  Camera,
  Alert,
  RouteSegment,
  CongestionPrediction,
  SystemSettings
} from '../types';
import {
  INITIAL_ZONES,
  INITIAL_CAMERAS,
  INITIAL_ALERTS,
  INITIAL_ROUTES,
  INITIAL_PREDICTIONS,
  HISTORICAL_OBSERVATIONS,
  INITIAL_SETTINGS
} from '../data/mockData';

const BASE_URL = '/api';

export const ApiService = {
  // Zones
  async getZones(): Promise<Zone[]> {
    try {
      const res = await fetch(`${BASE_URL}/zones`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API /zones fetch fallback to local state:', e);
    }
    return INITIAL_ZONES;
  },

  async updateZone(id: string, updates: Partial<Zone>): Promise<Zone> {
    try {
      const res = await fetch(`${BASE_URL}/zones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API updateZone fallback:', e);
    }
    return { ...INITIAL_ZONES[0], ...updates };
  },

  async createZone(newZone: Partial<Zone>): Promise<Zone> {
    const res = await fetch(`${BASE_URL}/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newZone)
    });
    return await res.json();
  },

  // Cameras
  async getCameras(): Promise<Camera[]> {
    try {
      const res = await fetch(`${BASE_URL}/cameras`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API /cameras fetch fallback:', e);
    }
    return INITIAL_CAMERAS;
  },

  async updateCamera(id: string, updates: Partial<Camera>): Promise<Camera> {
    const res = await fetch(`${BASE_URL}/cameras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await res.json();
  },

  async createCamera(newCam: Partial<Camera>): Promise<Camera> {
    const res = await fetch(`${BASE_URL}/cameras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCam)
    });
    return await res.json();
  },

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    try {
      const res = await fetch(`${BASE_URL}/alerts`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API /alerts fallback:', e);
    }
    return INITIAL_ALERTS;
  },

  async createAlert(alertData: Partial<Alert>): Promise<Alert> {
    const res = await fetch(`${BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData)
    });
    return await res.json();
  },

  async updateAlertStatus(
    id: string,
    status: Alert['status'],
    officer?: string,
    department?: string
  ): Promise<Alert> {
    const res = await fetch(`${BASE_URL}/alerts/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, officer, department })
    });
    return await res.json();
  },

  // Routes
  async getRoutes(): Promise<RouteSegment[]> {
    try {
      const res = await fetch(`${BASE_URL}/routes`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API /routes fallback:', e);
    }
    return INITIAL_ROUTES;
  },

  async updateRoute(id: string, updates: Partial<RouteSegment>): Promise<RouteSegment> {
    const res = await fetch(`${BASE_URL}/routes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await res.json();
  },

  // Predictions
  async getPredictions(): Promise<CongestionPrediction[]> {
    try {
      const res = await fetch(`${BASE_URL}/predictions`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API /predictions fallback:', e);
    }
    return INITIAL_PREDICTIONS;
  },

  // Analytics
  async getAnalytics(): Promise<any> {
    try {
      const res = await fetch(`${BASE_URL}/analytics`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API /analytics fallback:', e);
    }
    return {
      history: HISTORICAL_OBSERVATIONS,
      totalZones: INITIAL_ZONES.length,
      activeCameras: INITIAL_CAMERAS.length,
      activeAlerts: INITIAL_ALERTS.length
    };
  },

  // Settings & Logs
  async getSettings(): Promise<SystemSettings> {
    try {
      const res = await fetch(`${BASE_URL}/settings`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API /settings fallback:', e);
    }
    return INITIAL_SETTINGS;
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return await res.json();
  },

  async getAuditLogs(): Promise<any[]> {
    try {
      const res = await fetch(`${BASE_URL}/audit-logs`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API /audit-logs fallback:', e);
    }
    return [];
  },

  // Simulation
  async resetDemo(): Promise<void> {
    await fetch(`${BASE_URL}/demo/reset`, { method: 'POST' });
  },

  async simulateSurge(zoneId?: string, deltaMultiplier = 1.35): Promise<any> {
    const res = await fetch(`${BASE_URL}/demo/simulate-surge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zoneId, deltaMultiplier })
    });
    return await res.json();
  },

  // Gemini AI Endpoints
  async getOperationalSummary(): Promise<{ summary: string; source: string }> {
    try {
      const res = await fetch(`${BASE_URL}/gemini/operational-summary`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Gemini summary error:', e);
    }
    return {
      summary:
        'Pushkaralu command grid operational. Monitoring 8 core zones along River Godavari. Critical density monitored at Godavari Bund Promenade.',
      source: 'fallback'
    };
  },

  async getIncidentExplanation(alertId: string, zoneId: string): Promise<{ explanation: string; source: string }> {
    try {
      const res = await fetch(`${BASE_URL}/gemini/incident-explanation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, zoneId })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Gemini incident explanation error:', e);
    }
    return {
      explanation:
        'Inflow congestion caused by holy hour ritual congregation. Recommend staggering ramp access and signposting North bypass.',
      source: 'fallback'
    };
  },

  async sendChatMessage(message: string): Promise<{ reply: string; source: string }> {
    try {
      const res = await fetch(`${BASE_URL}/gemini/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Gemini chat error:', e);
    }
    return {
      reply: 'Currently monitoring Godavari Pushkaralu sectors. Please review active alert feed for immediate dispatches.',
      source: 'fallback'
    };
  }
};
