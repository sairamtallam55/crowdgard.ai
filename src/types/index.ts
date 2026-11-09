/**
 * CrowdGuard AI - Type Definitions
 * Godavari Pushkaralu 2027 Intelligent Crowd Management
 */

export type DensityStatus = 'normal' | 'moderate' | 'high' | 'critical';

export interface Zone {
  id: string;
  name: string;
  tehsil: string;
  category: 'ghat' | 'transit' | 'holding' | 'promenade' | 'corridor';
  latitude: number;
  longitude: number;
  usableAreaSqM: number;
  safeCapacity: number; // Max safe number of pilgrims
  currentCount: number; // Current detected or simulated count
  density: number; // persons / m²
  densityStatus: DensityStatus;
  trendRate: number; // people per minute delta (+ or -)
  assignedCameraIds: string[];
  warningThreshold: number; // e.g. 2.5 persons / m²
  criticalThreshold: number; // e.g. 3.8 persons / m²
  isActive: boolean;
  lastUpdated: string;
}

export type CameraStatus = 'active' | 'offline' | 'degraded';
export type CameraType = 'Fixed Optical' | 'PTZ 360°' | 'Thermal' | 'Drone Stream' | 'Mobile CCTV';

export interface Camera {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  type: CameraType;
  resolution: string;
  fps: number;
  streamUrl: string;
  status: CameraStatus;
  detectionStatus: 'running' | 'paused' | 'error';
  lastPing: string;
  confidenceThreshold: number;
  isDemoStream: boolean;
  sampleVideoType?: 'ghat' | 'promenade' | 'railway' | 'holding';
}

export type AlertSeverity = 'critical' | 'high' | 'warning' | 'info';
export type AlertCategory =
  | 'Overcrowding'
  | 'Surge Velocity'
  | 'Choke Point'
  | 'Camera Offline'
  | 'Route Blockage'
  | 'Stampede Pre-Risk';
export type AlertStatus = 'new' | 'acknowledged' | 'assigned' | 'in_progress' | 'resolved';

export interface Alert {
  id: string;
  zoneId: string;
  zoneName: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  description: string;
  recommendedAction: string;
  assignedDepartment: string;
  assignedOfficer?: string;
  status: AlertStatus;
  timestamp: string;
  resolvedAt?: string;
}

export interface RouteSegment {
  id: string;
  name: string;
  fromLocation: string;
  toLocation: string;
  distanceMeters: number;
  estimatedTravelTimeMin: number;
  currentStatus: 'clear' | 'slow' | 'congested' | 'diverted' | 'emergency_only';
  averageDensity: number;
  isEmergencyCorridor: boolean;
  isRecommendedAlternative: boolean;
  approvalStatus: 'approved' | 'pending' | 'restricted';
  coordinates: [number, number][]; // [lat, lng] array
}

export interface CongestionPrediction {
  zoneId: string;
  zoneName: string;
  currentCount: number;
  currentDensity: number;
  predicted15Min: number;
  predicted30Min: number;
  predicted60Min: number;
  forecastConfidence: number; // 0 - 100%
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Severe';
  contributingFactors: string[];
  recommendedProactiveIntervention: string;
  methodology: string;
}

export type UserRole =
  | 'Super Administrator'
  | 'Control Room Operator'
  | 'Police / Safety Officer'
  | 'Traffic Management Officer'
  | 'Read-only Viewer';

export interface CurrentUser {
  id: string;
  name: string;
  badgeId: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
}

export interface HistoricalObservation {
  timestamp: string;
  timeLabel: string;
  totalPeople: number;
  averageDensity: number;
  criticalZonesCount: number;
  kotilingalaGhat: number;
  pushkarGhat: number;
  saraswatiGhat: number;
  railwayStation: number;
  rtcBusStand: number;
}

export interface SystemSettings {
  appName: string;
  organization: string;
  eventYear: number;
  refreshIntervalSec: number;
  autoAlertGeneration: boolean;
  globalCriticalDensityLimit: number; // e.g. 3.8
  detectionSensitivity: number; // e.g. 0.65
  demoMode: boolean;
  simulationSpeed: '1x' | '2x' | '5x';
  dataRetentionDays: number;
  emergencyBroadcastEnabled: boolean;
}

export interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
  class: string;
}
