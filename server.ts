import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_ZONES,
  INITIAL_CAMERAS,
  INITIAL_ALERTS,
  INITIAL_ROUTES,
  INITIAL_PREDICTIONS,
  HISTORICAL_OBSERVATIONS,
  INITIAL_SETTINGS
} from './src/data/mockData.ts';
import { Zone, Camera, Alert, RouteSegment, SystemSettings } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory persistent state (seeded with Godavari Pushkaralu baseline)
let zonesState: Zone[] = JSON.parse(JSON.stringify(INITIAL_ZONES));
let camerasState: Camera[] = JSON.parse(JSON.stringify(INITIAL_CAMERAS));
let alertsState: Alert[] = JSON.parse(JSON.stringify(INITIAL_ALERTS));
let routesState: RouteSegment[] = JSON.parse(JSON.stringify(INITIAL_ROUTES));
let settingsState: SystemSettings = JSON.parse(JSON.stringify(INITIAL_SETTINGS));
let predictionsState = JSON.parse(JSON.stringify(INITIAL_PREDICTIONS));
let analyticsHistory = JSON.parse(JSON.stringify(HISTORICAL_OBSERVATIONS));

// Audit log store
interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}
let auditLogs: AuditEntry[] = [
  {
    id: 'LOG-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    user: 'Dr. K. S. Chandrasekhar, IAS',
    action: 'SYSTEM_BOOT',
    details: 'CrowdGuard AI initialized for Godavari Pushkaralu Command Grid.'
  },
  {
    id: 'LOG-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    user: 'Smt. Ananya Reddy',
    action: 'ZONE_THRESHOLD_ADJUST',
    details: 'Adjusted Pushkar Ghat critical threshold to 3.2 persons/m².'
  },
  {
    id: 'LOG-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    user: 'SP Vikram Singh, IPS',
    action: 'DIVERSION_APPROVED',
    details: 'Approved secondary pedestrian bypass Route RTE-02.'
  }
];

// Initialize Gemini Client
const hasValidGeminiKey =
  Boolean(process.env.GEMINI_API_KEY) &&
  process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
  !process.env.GEMINI_API_KEY?.startsWith('YOUR_');

let geminiClient: GoogleGenAI | null = null;
if (hasValidGeminiKey) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

async function callGeminiWithTimeout(prompt: string, timeoutMs = 3500): Promise<string | null> {
  if (!geminiClient || !hasValidGeminiKey) return null;
  try {
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
    const apiPromise = geminiClient.models
      .generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      })
      .then((res) => res.text || null)
      .catch((err) => {
        console.warn('Gemini generateContent caught error:', err?.message || err);
        return null;
      });

    return await Promise.race([apiPromise, timeoutPromise]);
  } catch (e) {
    console.warn('callGeminiWithTimeout exception:', e);
    return null;
  }
}

// ---------------- REST API ROUTES ----------------

// Zones
app.get('/api/zones', (_req, res) => {
  res.json(zonesState);
});

app.post('/api/zones', (req, res) => {
  const newZone: Zone = req.body;
  if (!newZone.id) {
    newZone.id = `ZONE-${String(zonesState.length + 1).padStart(2, '0')}`;
  }
  newZone.density = Number((newZone.currentCount / (newZone.usableAreaSqM || 1000)).toFixed(2));
  zonesState.push(newZone);

  auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Administrator',
    action: 'ZONE_CREATED',
    details: `Added new zone ${newZone.name} (${newZone.id})`
  });

  res.status(201).json(newZone);
});

app.put('/api/zones/:id', (req, res) => {
  const { id } = req.params;
  const index = zonesState.findIndex((z) => z.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Zone not found' });
  }

  const updated = { ...zonesState[index], ...req.body };
  updated.density = Number((updated.currentCount / (updated.usableAreaSqM || 1)).toFixed(2));
  if (updated.density >= updated.criticalThreshold) {
    updated.densityStatus = 'critical';
  } else if (updated.density >= updated.warningThreshold) {
    updated.densityStatus = 'high';
  } else if (updated.density >= updated.warningThreshold * 0.7) {
    updated.densityStatus = 'moderate';
  } else {
    updated.densityStatus = 'normal';
  }
  zonesState[index] = updated;

  res.json(updated);
});

// Cameras
app.get('/api/cameras', (_req, res) => {
  res.json(camerasState);
});

app.post('/api/cameras', (req, res) => {
  const newCam: Camera = req.body;
  if (!newCam.id) {
    newCam.id = `CAM-${String(camerasState.length + 1).padStart(2, '0')}`;
  }
  newCam.lastPing = 'Just now';
  camerasState.push(newCam);

  auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Control Room Officer',
    action: 'CAMERA_REGISTERED',
    details: `Registered CCTV feed ${newCam.name} (${newCam.id})`
  });

  res.status(201).json(newCam);
});

app.put('/api/cameras/:id', (req, res) => {
  const { id } = req.params;
  const index = camerasState.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Camera not found' });
  }
  camerasState[index] = { ...camerasState[index], ...req.body };
  res.json(camerasState[index]);
});

// Alerts
app.get('/api/alerts', (_req, res) => {
  res.json(alertsState);
});

app.post('/api/alerts', (req, res) => {
  const newAlert: Alert = {
    id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: 'Just now',
    status: 'new',
    ...req.body
  };
  alertsState.unshift(newAlert);

  auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Automated Alert Engine',
    action: 'ALERT_DISPATCHED',
    details: `Generated ${newAlert.severity.toUpperCase()} alert: ${newAlert.title}`
  });

  res.status(201).json(newAlert);
});

app.put('/api/alerts/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, officer, department } = req.body;
  const alert = alertsState.find((a) => a.id === id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  alert.status = status;
  if (officer) alert.assignedOfficer = officer;
  if (department) alert.assignedDepartment = department;
  if (status === 'resolved') {
    alert.resolvedAt = 'Just now';
  }

  auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: officer || 'Duty Officer',
    action: `ALERT_${status.toUpperCase()}`,
    details: `Updated alert ${alert.id} status to ${status}`
  });

  res.json(alert);
});

// Routes
app.get('/api/routes', (_req, res) => {
  res.json(routesState);
});

app.put('/api/routes/:id', (req, res) => {
  const { id } = req.params;
  const idx = routesState.findIndex((r) => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Route not found' });
  }
  routesState[idx] = { ...routesState[idx], ...req.body };

  auditLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: 'Traffic Management',
    action: 'ROUTE_CONFIG_UPDATE',
    details: `Updated route ${routesState[idx].name} status to ${routesState[idx].currentStatus}`
  });

  res.json(routesState[idx]);
});

// Predictions
app.get('/api/predictions', (_req, res) => {
  res.json(predictionsState);
});

// Analytics
app.get('/api/analytics', (_req, res) => {
  res.json({
    history: analyticsHistory,
    totalZones: zonesState.length,
    activeCameras: camerasState.filter((c) => c.status === 'active').length,
    activeAlerts: alertsState.filter((a) => a.status !== 'resolved').length,
    resolvedAlerts: alertsState.filter((a) => a.status === 'resolved').length
  });
});

// Settings & Audit Logs
app.get('/api/settings', (_req, res) => {
  res.json(settingsState);
});

app.put('/api/settings', (req, res) => {
  settingsState = { ...settingsState, ...req.body };
  res.json(settingsState);
});

app.get('/api/audit-logs', (_req, res) => {
  res.json(auditLogs);
});

// Simulation Actions
app.post('/api/demo/reset', (_req, res) => {
  zonesState = JSON.parse(JSON.stringify(INITIAL_ZONES));
  camerasState = JSON.parse(JSON.stringify(INITIAL_CAMERAS));
  alertsState = JSON.parse(JSON.stringify(INITIAL_ALERTS));
  routesState = JSON.parse(JSON.stringify(INITIAL_ROUTES));
  predictionsState = JSON.parse(JSON.stringify(INITIAL_PREDICTIONS));
  res.json({ message: 'Reset simulation to initial baseline successfully.' });
});

app.post('/api/demo/simulate-surge', (req, res) => {
  const { zoneId, deltaMultiplier = 1.3 } = req.body;
  const zone = zonesState.find((z) => z.id === (zoneId || 'ZONE-02'));
  if (zone) {
    zone.currentCount = Math.round(zone.currentCount * deltaMultiplier);
    zone.density = Number((zone.currentCount / zone.usableAreaSqM).toFixed(2));
    zone.densityStatus = zone.density >= zone.criticalThreshold ? 'critical' : 'high';
    zone.trendRate = Math.round(zone.trendRate * 1.5);
    zone.lastUpdated = 'Just now';

    // Generate immediate alert
    const newAlert: Alert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      zoneId: zone.id,
      zoneName: zone.name,
      severity: 'critical',
      category: 'Stampede Pre-Risk',
      title: `Surge Density Surge Triggered in ${zone.name}`,
      description: `Pilgrim count surged to ${zone.currentCount.toLocaleString()} with density reaching ${zone.density} persons/m² exceeding critical limits.`,
      recommendedAction:
        'Immediate perimeter cordoning. Activate emergency megaphone broadcast and hold incoming foot traffic at peripheral barrier.',
      assignedDepartment: 'Emergency Rapid Action Team & Law Enforcement',
      assignedOfficer: 'SP Pushkaralu Task Force',
      status: 'new',
      timestamp: 'Just now'
    };
    alertsState.unshift(newAlert);
  }
  res.json({ message: 'Surge simulated', zone });
});

// ---------------- GEMINI AI INTEGRATION ----------------

// 1. Operational Summary
app.post('/api/gemini/operational-summary', async (_req, res) => {
  const criticalZones = zonesState.filter((z) => z.densityStatus === 'critical');
  const highZones = zonesState.filter((z) => z.densityStatus === 'high');
  const totalCount = zonesState.reduce((acc, z) => acc + z.currentCount, 0);
  const activeAlertsCount = alertsState.filter((a) => a.status !== 'resolved').length;

  const contextData = {
    event: 'Godavari Pushkaralu 2027 (Rajamahendravaram)',
    totalMonitoredDevotees: totalCount,
    criticalZones: criticalZones.map((z) => ({ name: z.name, density: z.density, count: z.currentCount })),
    highZones: highZones.map((z) => ({ name: z.name, density: z.density, count: z.currentCount })),
    activeAlerts: alertsState.slice(0, 3).map((a) => ({ title: a.title, severity: a.severity }))
  };

  const prompt = `You are the Lead Crowd Management Architect for Rajamahendravaram Municipal Corporation (RMC) for Godavari Pushkaralu 2027.
Based on the current real-time surveillance telemetry below, write a crisp 3-paragraph executive operational briefing for the District Collector, Police Commissioner, and Incident Commander.
Include:
1. Executive situation appraisal (density bottlenecks, especially riverfront ghats).
2. Priority tactical interventions (choke point mitigations, route diversions, holding enclosure activation).
3. Forecasted vulnerability over the next 60 minutes.
Data: ${JSON.stringify(contextData)}`;

  const geminiText = await callGeminiWithTimeout(prompt);
  if (geminiText) {
    return res.json({ summary: geminiText, source: 'gemini-3.8-flash' });
  }

  // Fallback operational summary grounded in actual state
  const fallbackSummary = `EXECUTIVE OPERATIONAL BRIEFING - GODAVARI PUSHKARALU COMMAND

1. CURRENT SITUATION: Total detected congregation across the 8 monitored Rajamahendravaram sectors stands at ${totalCount.toLocaleString()} pilgrims. Critical density conditions are detected at ${
    criticalZones.length > 0 ? criticalZones.map((z) => z.name).join(', ') : 'Godavari Bund Promenade'
  }, where pilgrim concentration exceeds safe holding parameters. Secondary pressure is mounting at Pushkar Ghat and the Main Railway Station Concourse.

2. IMMEDIATE DIRECTIVES: Law enforcement task forces must activate the physical barricade diversions at Kotipalli Junction immediately. Egress ramps at Pushkar Ghat should be maintained clear of seating devotees using trilingual megaphone broadcasts. All standby medical teams at Sector 4 General Hospital post are instructed to remain on high alert.

3. FORECAST & VULNERABILITY: With incoming train surges from Vijayawada and Visakhapatnam coupled with the approaching evening Maha Harathi rituals, pedestrian flow is forecasted to rise 18% over the next 45 minutes. Route RTE-02 (Saraswati Ghat Bypass) is clear and must be aggressively signposted.`;

  res.json({ summary: fallbackSummary, source: 'grounded-engine-fallback' });
});

// 2. Incident Explanation
app.post('/api/gemini/incident-explanation', async (req, res) => {
  const { alertId, zoneId } = req.body;
  const alert = alertsState.find((a) => a.id === alertId);
  const zone = zonesState.find((z) => z.id === zoneId);

  const prompt = `Analyze this specific crowd safety anomaly during Godavari Pushkaralu 2027:
Alert: ${JSON.stringify(alert || {})}
Zone Data: ${JSON.stringify(zone || {})}
Explain the root technical cause (ingress vs egress bottlenecks, religious timing, transit surges), calculate the risk factor, and recommend three sequential tactical steps for the field supervisor.`;

  const geminiText = await callGeminiWithTimeout(prompt);
  if (geminiText) {
    return res.json({ explanation: geminiText, source: 'gemini-3.8-flash' });
  }

  const fallback = `ROOT CAUSE ANALYSIS FOR ${alert ? alert.title : 'ZONE CONGESTION'}
- Primary Mechanism: Inflow rate into ${zone ? zone.name : 'the sector'} (+${zone ? zone.trendRate : 85} pilgrims/min) exceeds stone ramp egress clearing velocity.
- Sacred Timing Confluence: Devotees pausing to perform traditional Arghyam and sankalpam rituals at the river edge causes standing waves of slow-moving pedestrians.
- Recommended Action: 1) Deploy 6 RMC civic wardens to gently guide bathed pilgrims towards North egress stairway; 2) Stagger arrival from the main footbridge; 3) Announce clear water availability at Saraswati Ghat.`;

  res.json({ explanation: fallback, source: 'grounded-engine-fallback' });
});

// 3. AI Assistant Chat
app.post('/api/gemini/chat', async (req, res) => {
  const { message } = req.body;

  const currentSnapshot = {
    zones: zonesState.map((z) => ({
      name: z.name,
      density: z.density,
      status: z.densityStatus,
      count: z.currentCount
    })),
    activeAlerts: alertsState.filter((a) => a.status !== 'resolved').map((a) => ({ title: a.title, severity: a.severity })),
    activeCameras: camerasState.filter((c) => c.status === 'active').length
  };

  const systemInstruction = `You are CrowdGuard AI, the official intelligent crowd intelligence advisor for the Rajamahendravaram Municipal Corporation (RMC) & Andhra Pradesh Police at Godavari Pushkaralu 2027.
You possess real-time telemetry from all 8 sectors (Pushkar Ghat, Kotilingala Ghat, Saraswati Ghat, Markandeya Ghat, Railway Station, RTC Bus Complex, Godavari Bund Promenade, Diwancheruvu Holding Area).
Current State: ${JSON.stringify(currentSnapshot)}
Answer concisely, with tactical precision, authority, and safety-first smart city operational logic. Never hallucinate sensor readings outside the provided state. Always mention that numbers reflect the Pushkaralu surveillance grid.`;

  const geminiText = await callGeminiWithTimeout(`${systemInstruction}\nUser Question: ${message}`);
  if (geminiText) {
    return res.json({ reply: geminiText, source: 'gemini-3.8-flash' });
  }

  // Domain-grounded fallback responses
  const q = (message || '').toLowerCase();
  let reply = '';
  if (q.includes('attention') || q.includes('critical') || q.includes('zone')) {
    const crit = zonesState.filter((z) => z.densityStatus === 'critical' || z.densityStatus === 'high');
    reply = `Currently, ${crit.length} zones require immediate supervisory oversight: ${crit
      .map((c) => `${c.name} (${c.density} persons/m², ${c.currentCount.toLocaleString()} pilgrims)`)
      .join(
        '; '
      )}. Primary intervention priority is Godavari Bund Promenade due to high linear compression and incoming inflow from the Railway Station.`;
  } else if (q.includes('compare') || q.includes('kotilingala') || q.includes('pushkar')) {
    const k = zonesState.find((z) => z.id === 'ZONE-01');
    const p = zonesState.find((z) => z.id === 'ZONE-02');
    reply = `Sector Comparison:
- Kotilingala Ghat: ${k?.currentCount.toLocaleString()} pilgrims, density ${k?.density} persons/m² (${k?.densityStatus?.toUpperCase()}). Outflow is fluid.
- Pushkar Ghat: ${p?.currentCount.toLocaleString()} pilgrims, density ${p?.density} persons/m² (${p?.densityStatus?.toUpperCase()}). Approaching capacity.
Recommendation: Divert incoming pilgrims approaching via Syamala Theatre junction directly to Kotilingala Ghat North Gate to equalize loading.`;
  } else {
    reply = `As of this hour, ${zonesState.length} zones and ${camerasState.length} CCTV nodes are actively tracked across Rajamahendravaram. Total estimated crowd in bathing sectors is ${zonesState
      .reduce((a, b) => a + b.currentCount, 0)
      .toLocaleString()} pilgrims. ${alertsState.filter((a) => a.status !== 'resolved').length} alerts are under active dispatch. How else may I assist your command shift?`;
  }

  res.json({ reply, source: 'grounded-engine-fallback' });
});

// Vite Middleware for Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`CrowdGuard AI server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
