import {
  Zone,
  Camera,
  Alert,
  RouteSegment,
  CongestionPrediction,
  HistoricalObservation,
  SystemSettings,
  CurrentUser
} from '../types';

export const INITIAL_ZONES: Zone[] = [
  {
    id: 'ZONE-01',
    name: 'Kotilingala Ghat Main Steps',
    tehsil: 'Rajamahendravaram Urban',
    category: 'ghat',
    latitude: 17.0041,
    longitude: 81.7678,
    usableAreaSqM: 3200,
    safeCapacity: 6400,
    currentCount: 5120,
    density: 1.6,
    densityStatus: 'moderate',
    trendRate: 42,
    assignedCameraIds: ['CAM-01', 'CAM-02'],
    warningThreshold: 2.2,
    criticalThreshold: 3.5,
    isActive: true,
    lastUpdated: 'Just now'
  },
  {
    id: 'ZONE-02',
    name: 'Pushkar Ghat Sacred Concourse',
    tehsil: 'Rajamahendravaram Urban',
    category: 'ghat',
    latitude: 16.9982,
    longitude: 81.7725,
    usableAreaSqM: 4500,
    safeCapacity: 9000,
    currentCount: 8850,
    density: 1.97,
    densityStatus: 'high',
    trendRate: 85,
    assignedCameraIds: ['CAM-03', 'CAM-04', 'CAM-05'],
    warningThreshold: 1.8,
    criticalThreshold: 3.2,
    isActive: true,
    lastUpdated: 'Just now'
  },
  {
    id: 'ZONE-03',
    name: 'Saraswati Ghat & North Embankment',
    tehsil: 'Rajamahendravaram Urban',
    category: 'ghat',
    latitude: 17.0125,
    longitude: 81.7635,
    usableAreaSqM: 2800,
    safeCapacity: 5600,
    currentCount: 2240,
    density: 0.8,
    densityStatus: 'normal',
    trendRate: -15,
    assignedCameraIds: ['CAM-06'],
    warningThreshold: 2.0,
    criticalThreshold: 3.5,
    isActive: true,
    lastUpdated: 'Just now'
  },
  {
    id: 'ZONE-04',
    name: 'Markandeya Ghat Ancient Corridor',
    tehsil: 'Rajamahendravaram Urban',
    category: 'ghat',
    latitude: 16.9928,
    longitude: 81.777,
    usableAreaSqM: 2100,
    safeCapacity: 4200,
    currentCount: 3820,
    density: 1.82,
    densityStatus: 'high',
    trendRate: 60,
    assignedCameraIds: ['CAM-07'],
    warningThreshold: 1.7,
    criticalThreshold: 3.0,
    isActive: true,
    lastUpdated: 'Just now'
  },
  {
    id: 'ZONE-05',
    name: 'Rajahmundry Railway Station Concourse',
    tehsil: 'South Central Railway Zone',
    category: 'transit',
    latitude: 17.0012,
    longitude: 81.7915,
    usableAreaSqM: 5200,
    safeCapacity: 12000,
    currentCount: 11400,
    density: 2.19,
    densityStatus: 'high',
    trendRate: 110,
    assignedCameraIds: ['CAM-08', 'CAM-09'],
    warningThreshold: 2.0,
    criticalThreshold: 3.2,
    isActive: true,
    lastUpdated: 'Just now'
  },
  {
    id: 'ZONE-06',
    name: 'APSRTC Central Bus Complex',
    tehsil: 'Rajamahendravaram Urban',
    category: 'transit',
    latitude: 17.0085,
    longitude: 81.7972,
    usableAreaSqM: 6000,
    safeCapacity: 14000,
    currentCount: 7800,
    density: 1.3,
    densityStatus: 'normal',
    trendRate: 20,
    assignedCameraIds: ['CAM-10'],
    warningThreshold: 2.2,
    criticalThreshold: 3.5,
    isActive: true,
    lastUpdated: 'Just now'
  },
  {
    id: 'ZONE-07',
    name: 'Godavari Bund Pedestrian Promenade',
    tehsil: 'Riverfront Corridor',
    category: 'promenade',
    latitude: 17.001,
    longitude: 81.7702,
    usableAreaSqM: 7500,
    safeCapacity: 15000,
    currentCount: 16200,
    density: 2.16,
    densityStatus: 'critical',
    trendRate: 135,
    assignedCameraIds: ['CAM-11'],
    warningThreshold: 1.8,
    criticalThreshold: 2.8,
    isActive: true,
    lastUpdated: 'Just now'
  },
  {
    id: 'ZONE-08',
    name: 'Diwancheruvu Satellite Staging Hub',
    tehsil: 'Rural / Outskirts',
    category: 'holding',
    latitude: 17.035,
    longitude: 81.815,
    usableAreaSqM: 18000,
    safeCapacity: 35000,
    currentCount: 14200,
    density: 0.79,
    densityStatus: 'normal',
    trendRate: -30,
    assignedCameraIds: ['CAM-12'],
    warningThreshold: 1.8,
    criticalThreshold: 2.5,
    isActive: true,
    lastUpdated: 'Just now'
  }
];

export const INITIAL_CAMERAS: Camera[] = [
  {
    id: 'CAM-01',
    name: 'Kotilingala Ghat North Stairwell',
    zoneId: 'ZONE-01',
    zoneName: 'Kotilingala Ghat Main Steps',
    type: 'PTZ 360°',
    resolution: '4K UltraHD',
    fps: 30,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam01',
    status: 'active',
    detectionStatus: 'running',
    lastPing: '2s ago',
    confidenceThreshold: 0.7,
    isDemoStream: true,
    sampleVideoType: 'ghat'
  },
  {
    id: 'CAM-02',
    name: 'Kotilingala Ghat Temple Entry Portal',
    zoneId: 'ZONE-01',
    zoneName: 'Kotilingala Ghat Main Steps',
    type: 'Fixed Optical',
    resolution: '1080p Full HD',
    fps: 25,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam02',
    status: 'active',
    detectionStatus: 'running',
    lastPing: '4s ago',
    confidenceThreshold: 0.65,
    isDemoStream: true,
    sampleVideoType: 'ghat'
  },
  {
    id: 'CAM-03',
    name: 'Pushkar Ghat Central Holy Dip Ramp',
    zoneId: 'ZONE-02',
    zoneName: 'Pushkar Ghat Sacred Concourse',
    type: 'PTZ 360°',
    resolution: '4K UltraHD',
    fps: 30,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam03',
    status: 'active',
    detectionStatus: 'running',
    lastPing: '1s ago',
    confidenceThreshold: 0.75,
    isDemoStream: true,
    sampleVideoType: 'ghat'
  },
  {
    id: 'CAM-04',
    name: 'Pushkar Ghat Rail Bridge Flank',
    zoneId: 'ZONE-02',
    zoneName: 'Pushkar Ghat Sacred Concourse',
    type: 'Drone Stream',
    resolution: '1080p 60fps',
    fps: 60,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam04',
    status: 'active',
    detectionStatus: 'running',
    lastPing: '3s ago',
    confidenceThreshold: 0.7,
    isDemoStream: true,
    sampleVideoType: 'ghat'
  },
  {
    id: 'CAM-05',
    name: 'Pushkar Ghat Crowd Barricade Ingress',
    zoneId: 'ZONE-02',
    zoneName: 'Pushkar Ghat Sacred Concourse',
    type: 'Thermal',
    resolution: '720p Radiometric',
    fps: 20,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam05',
    status: 'active',
    detectionStatus: 'running',
    lastPing: '5s ago',
    confidenceThreshold: 0.65,
    isDemoStream: true,
    sampleVideoType: 'ghat'
  },
  {
    id: 'CAM-06',
    name: 'Saraswati Ghat Broad Steps North',
    zoneId: 'ZONE-03',
    zoneName: 'Saraswati Ghat & North Embankment',
    type: 'Fixed Optical',
    resolution: '1080p Full HD',
    fps: 30,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam06',
    status: 'active',
    detectionStatus: 'running',
    lastPing: '2s ago',
    confidenceThreshold: 0.7,
    isDemoStream: true,
    sampleVideoType: 'ghat'
  },
  {
    id: 'CAM-07',
    name: 'Markandeya Temple Rivergate',
    zoneId: 'ZONE-04',
    zoneName: 'Markandeya Ghat Ancient Corridor',
    type: 'Fixed Optical',
    resolution: '1080p Full HD',
    fps: 25,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam07',
    status: 'active',
    detectionStatus: 'running',
    lastPing: '6s ago',
    confidenceThreshold: 0.65,
    isDemoStream: true,
    sampleVideoType: 'ghat'
  },
  {
    id: 'CAM-08',
    name: 'Rajahmundry Station Platform 1 & FOB',
    zoneId: 'ZONE-05',
    zoneName: 'Rajahmundry Railway Station Concourse',
    type: 'PTZ 360°',
    resolution: '4K UltraHD',
    fps: 30,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam08',
    status: 'active',
    detectionStatus: 'running',
    lastPing: '1s ago',
    confidenceThreshold: 0.75,
    isDemoStream: true,
    sampleVideoType: 'railway'
  },
  {
    id: 'CAM-09',
    name: 'Station West Circulating Area & Taxi Stand',
    zoneId: 'ZONE-05',
    zoneName: 'Rajahmundry Railway Station Concourse',
    type: 'Fixed Optical',
    resolution: '1080p Full HD',
    fps: 30,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam09',
    status: 'active',
    detectionStatus: 'running',
    lastPing: '3s ago',
    confidenceThreshold: 0.7,
    isDemoStream: true,
    sampleVideoType: 'railway'
  },
  {
    id: 'CAM-10',
    name: 'APSRTC Terminal Bay 1-12 Concourse',
    zoneId: 'ZONE-06',
    zoneName: 'APSRTC Central Bus Complex',
    type: 'Fixed Optical',
    resolution: '1080p Full HD',
    fps: 25,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam10',
    status: 'active',
    detectionStatus: 'running',
    lastPing: '8s ago',
    confidenceThreshold: 0.65,
    isDemoStream: true,
    sampleVideoType: 'holding'
  },
  {
    id: 'CAM-11',
    name: 'Godavari Bund Promenade Central Choke Point',
    zoneId: 'ZONE-07',
    zoneName: 'Godavari Bund Pedestrian Promenade',
    type: 'PTZ 360°',
    resolution: '4K UltraHD',
    fps: 30,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam11',
    status: 'active',
    detectionStatus: 'running',
    lastPing: '1s ago',
    confidenceThreshold: 0.8,
    isDemoStream: true,
    sampleVideoType: 'promenade'
  },
  {
    id: 'CAM-12',
    name: 'Diwancheruvu Peripheral Shuttle Terminus',
    zoneId: 'ZONE-08',
    zoneName: 'Diwancheruvu Satellite Staging Hub',
    type: 'Mobile CCTV',
    resolution: '1080p Full HD',
    fps: 25,
    streamUrl: 'rtsp://rmc-cctv.godavari.gov.in/live/cam12',
    status: 'active',
    detectionStatus: 'running',
    lastPing: '12s ago',
    confidenceThreshold: 0.6,
    isDemoStream: true,
    sampleVideoType: 'holding'
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'ALT-8041',
    zoneId: 'ZONE-07',
    zoneName: 'Godavari Bund Pedestrian Promenade',
    severity: 'critical',
    category: 'Overcrowding',
    title: 'Promenade Capacity Exceeded (>108%)',
    description:
      'Current density reached 2.16 persons/m² with incoming pilgrim rate of +135/min moving from Railway Station towards Pushkar Ghat.',
    recommendedAction:
      'Activate barricaded diversion at Kotipalli Junction; divert foot traffic to Saraswati Bypass Route B.',
    assignedDepartment: 'Law & Order Police / Rapid Action Force',
    assignedOfficer: 'ACP R. V. Narayana (Zone 2 Command)',
    status: 'in_progress',
    timestamp: '3 mins ago'
  },
  {
    id: 'ALT-8040',
    zoneId: 'ZONE-05',
    zoneName: 'Rajahmundry Railway Station Concourse',
    severity: 'high',
    category: 'Surge Velocity',
    title: 'Surge Ingress from Godavari Special Express',
    description:
      'Consecutive arrival of two Pushkaralu special passenger trains caused sudden surge of ~4,200 pilgrims into main foot overbridge.',
    recommendedAction:
      'Stagger platform exit gates; direct passengers toward circulating holding enclosure C.',
    assignedDepartment: 'Railway Protection Force (RPF) & Civil Police',
    assignedOfficer: 'Inspector K. S. Murthy',
    status: 'assigned',
    timestamp: '11 mins ago'
  },
  {
    id: 'ALT-8039',
    zoneId: 'ZONE-02',
    zoneName: 'Pushkar Ghat Sacred Concourse',
    severity: 'warning',
    category: 'Choke Point',
    title: 'Bathing Exit Flow Restriction at Archway 3',
    description:
      'Pilgrims lingering for rituals at the lower stone stairs are reducing egress throughput by 40%.',
    recommendedAction:
      'Deploy public address system announcements in Telugu, Hindi & Odia; dispatch 4 civic volunteers to guide flow.',
    assignedDepartment: 'Municipal Corporation (RMC) Sanitation & Safety',
    assignedOfficer: 'RMC Ward Officer S. Durga Rao',
    status: 'acknowledged',
    timestamp: '24 mins ago'
  },
  {
    id: 'ALT-8038',
    zoneId: 'ZONE-01',
    zoneName: 'Kotilingala Ghat Main Steps',
    severity: 'info',
    category: 'Route Blockage',
    title: 'Temporary Barricade Adjustment for VIP Escort',
    description:
      'VIP spiritual delegation approaching; sector 2 cordon temporarily activated for 15 minutes.',
    recommendedAction:
      'Monitor secondary queue lines; ensure general pilgrim corridor remains uninhibited.',
    assignedDepartment: 'Traffic Police Division',
    assignedOfficer: 'DSP M. Prabhakar',
    status: 'resolved',
    timestamp: '48 mins ago',
    resolvedAt: '33 mins ago'
  }
];

export const INITIAL_ROUTES: RouteSegment[] = [
  {
    id: 'RTE-01',
    name: 'Primary Arterial: Railway Station to Pushkar Ghat',
    fromLocation: 'Rajahmundry Railway Station',
    toLocation: 'Pushkar Ghat Concourse',
    distanceMeters: 2300,
    estimatedTravelTimeMin: 32,
    currentStatus: 'congested',
    averageDensity: 2.35,
    isEmergencyCorridor: false,
    isRecommendedAlternative: false,
    approvalStatus: 'approved',
    coordinates: [
      [17.0012, 81.7915],
      [17.0005, 81.783],
      [16.9992, 81.777],
      [16.9982, 81.7725]
    ]
  },
  {
    id: 'RTE-02',
    name: 'Smart Diverted Route: Station to Saraswati Ghat (Low Density)',
    fromLocation: 'Rajahmundry Railway Station',
    toLocation: 'Saraswati Ghat & North Embankment',
    distanceMeters: 2800,
    estimatedTravelTimeMin: 22,
    currentStatus: 'clear',
    averageDensity: 0.95,
    isEmergencyCorridor: false,
    isRecommendedAlternative: true,
    approvalStatus: 'approved',
    coordinates: [
      [17.0012, 81.7915],
      [17.0065, 81.785],
      [17.011, 81.774],
      [17.0125, 81.7635]
    ]
  },
  {
    id: 'RTE-03',
    name: 'Emergency Medical & Fire Red Corridor',
    fromLocation: 'District General Hospital',
    toLocation: 'All Main Bathing Ghats',
    distanceMeters: 3100,
    estimatedTravelTimeMin: 7,
    currentStatus: 'emergency_only',
    averageDensity: 0.15,
    isEmergencyCorridor: true,
    isRecommendedAlternative: false,
    approvalStatus: 'restricted',
    coordinates: [
      [17.0145, 81.789],
      [17.008, 81.778],
      [17.003, 81.771],
      [16.9982, 81.7725]
    ]
  },
  {
    id: 'RTE-04',
    name: 'Bus Complex Shuttle Connector',
    fromLocation: 'APSRTC Central Bus Complex',
    toLocation: 'Kotilingala Ghat North Gate',
    distanceMeters: 2400,
    estimatedTravelTimeMin: 18,
    currentStatus: 'slow',
    averageDensity: 1.45,
    isEmergencyCorridor: false,
    isRecommendedAlternative: true,
    approvalStatus: 'approved',
    coordinates: [
      [17.0085, 81.7972],
      [17.007, 81.788],
      [17.0055, 81.777],
      [17.0041, 81.7678]
    ]
  }
];

export const INITIAL_PREDICTIONS: CongestionPrediction[] = [
  {
    zoneId: 'ZONE-07',
    zoneName: 'Godavari Bund Pedestrian Promenade',
    currentCount: 16200,
    currentDensity: 2.16,
    predicted15Min: 18100,
    predicted30Min: 20400,
    predicted60Min: 22800,
    forecastConfidence: 91,
    riskCategory: 'Severe',
    contributingFactors: [
      'Positive arrival velocity (+135 pilgrims/min)',
      'Evening Aarti confluence window (18:30 - 20:00 hrs)',
      'Narrow 8-meter bridge choke point near Kotilingala junction'
    ],
    recommendedProactiveIntervention:
      'Impose immediate physical gating at Bund Entry 4; route 60% incoming flow to River Bund West Bypass.',
    methodology: 'Auto-Regressive Integrated Inflow Gradient + Historical Pushkaralu Holy Hour Curve'
  },
  {
    zoneId: 'ZONE-02',
    zoneName: 'Pushkar Ghat Sacred Concourse',
    currentCount: 8850,
    currentDensity: 1.97,
    predicted15Min: 9700,
    predicted30Min: 10800,
    predicted60Min: 11500,
    forecastConfidence: 88,
    riskCategory: 'High',
    contributingFactors: [
      'Upcoming sunset auspicious muhurtham for river offering',
      'Queue backpressure building from downstream changing enclosures'
    ],
    recommendedProactiveIntervention:
      'Announce alternative bathing slots at Saraswati Ghat via bilingual PA and mobile digital signage.',
    methodology: 'Moving Average Trend Analysis & Threshold Projection'
  },
  {
    zoneId: 'ZONE-05',
    zoneName: 'Rajahmundry Railway Station Concourse',
    currentCount: 11400,
    currentDensity: 2.19,
    predicted15Min: 12500,
    predicted30Min: 13200,
    predicted60Min: 11000,
    forecastConfidence: 84,
    riskCategory: 'High',
    contributingFactors: [
      'Pushkaralu Special 07144 arrival from Vijayawada in 12 mins',
      'FOB clearance rate currently constrained by baggage screening'
    ],
    recommendedProactiveIntervention:
      'Open auxiliary exit gates 3 & 4 directly onto Subhash Road holding ground.',
    methodology: 'Timetable-coupled Poisson Ingress Distribution'
  },
  {
    zoneId: 'ZONE-01',
    zoneName: 'Kotilingala Ghat Main Steps',
    currentCount: 5120,
    currentDensity: 1.6,
    predicted15Min: 5400,
    predicted30Min: 5800,
    predicted60Min: 6200,
    forecastConfidence: 92,
    riskCategory: 'Moderate',
    contributingFactors: [
      'Steady steady-state bathing cycle (average 18 mins immersion per devotee)',
      'Adequate 4-meter wide egress ramps operating normally'
    ],
    recommendedProactiveIntervention:
      'Maintain continuous monitoring; keep reserve volunteer squad on 10-minute standby.',
    methodology: 'Kalman Filter Crowd State Estimation'
  }
];

export const HISTORICAL_OBSERVATIONS: HistoricalObservation[] = [
  {
    timestamp: '2027-07-14T06:00:00Z',
    timeLabel: '06:00 (Brahma Muhurtham)',
    totalPeople: 34000,
    averageDensity: 1.12,
    criticalZonesCount: 0,
    kotilingalaGhat: 4100,
    pushkarGhat: 6200,
    saraswatiGhat: 1800,
    railwayStation: 7200,
    rtcBusStand: 5400
  },
  {
    timestamp: '2027-07-14T08:00:00Z',
    timeLabel: '08:00 (Morning Peak)',
    totalPeople: 52000,
    averageDensity: 1.74,
    criticalZonesCount: 1,
    kotilingalaGhat: 6800,
    pushkarGhat: 9800,
    saraswatiGhat: 2900,
    railwayStation: 11200,
    rtcBusStand: 8900
  },
  {
    timestamp: '2027-07-14T10:00:00Z',
    timeLabel: '10:00 (Mid-Morning)',
    totalPeople: 48000,
    averageDensity: 1.58,
    criticalZonesCount: 0,
    kotilingalaGhat: 5900,
    pushkarGhat: 8400,
    saraswatiGhat: 2500,
    railwayStation: 9800,
    rtcBusStand: 7600
  },
  {
    timestamp: '2027-07-14T12:00:00Z',
    timeLabel: '12:00 (Mid-Day Sun)',
    totalPeople: 39000,
    averageDensity: 1.28,
    criticalZonesCount: 0,
    kotilingalaGhat: 4400,
    pushkarGhat: 6600,
    saraswatiGhat: 2100,
    railwayStation: 8100,
    rtcBusStand: 6800
  },
  {
    timestamp: '2027-07-14T14:00:00Z',
    timeLabel: '14:00 (Afternoon Inflow)',
    totalPeople: 45000,
    averageDensity: 1.48,
    criticalZonesCount: 0,
    kotilingalaGhat: 5100,
    pushkarGhat: 7800,
    saraswatiGhat: 2400,
    railwayStation: 9500,
    rtcBusStand: 7200
  },
  {
    timestamp: '2027-07-14T16:00:00Z',
    timeLabel: '16:00 (Pre-Evening Surge)',
    totalPeople: 58000,
    averageDensity: 1.89,
    criticalZonesCount: 1,
    kotilingalaGhat: 7200,
    pushkarGhat: 10400,
    saraswatiGhat: 3200,
    railwayStation: 12400,
    rtcBusStand: 9100
  },
  {
    timestamp: '2027-07-14T18:00:00Z',
    timeLabel: '18:00 (Godavari Maha Harathi)',
    totalPeople: 71000,
    averageDensity: 2.32,
    criticalZonesCount: 2,
    kotilingalaGhat: 8600,
    pushkarGhat: 12800,
    saraswatiGhat: 4100,
    railwayStation: 14200,
    rtcBusStand: 10800
  },
  {
    timestamp: '2027-07-14T20:00:00Z',
    timeLabel: '20:00 (Current Hour)',
    totalPeople: 66430,
    averageDensity: 2.05,
    criticalZonesCount: 1,
    kotilingalaGhat: 5120,
    pushkarGhat: 8850,
    saraswatiGhat: 2240,
    railwayStation: 11400,
    rtcBusStand: 7800
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  appName: 'CrowdGuard AI',
  organization: 'Rajamahendravaram Municipal Corporation (RMC)',
  eventYear: 2027,
  refreshIntervalSec: 5,
  autoAlertGeneration: true,
  globalCriticalDensityLimit: 3.5,
  detectionSensitivity: 0.65,
  demoMode: true,
  simulationSpeed: '1x',
  dataRetentionDays: 30,
  emergencyBroadcastEnabled: true
};

export const DEMO_USERS: CurrentUser[] = [
  {
    id: 'USR-01',
    name: 'Dr. K. S. Chandrasekhar, IAS',
    badgeId: 'RMC-COMM-01',
    role: 'Super Administrator',
    department: 'Municipal Commissionerate & Apex Command'
  },
  {
    id: 'USR-02',
    name: 'Smt. Ananya Reddy',
    badgeId: 'CR-OPR-44',
    role: 'Control Room Operator',
    department: 'Smart City Integrated Command & Control Center (ICCC)'
  },
  {
    id: 'USR-03',
    name: 'SP Vikram Singh, IPS',
    badgeId: 'AP-POL-88',
    role: 'Police / Safety Officer',
    department: 'Godavari Pushkaralu Police Task Force'
  },
  {
    id: 'USR-04',
    name: 'Eng. T. Venkataramana',
    badgeId: 'RMC-TRF-12',
    role: 'Traffic Management Officer',
    department: 'RMC Traffic & Corridor Engineering Wing'
  },
  {
    id: 'USR-05',
    name: 'Media & Observer Desk',
    badgeId: 'OBS-PUB-99',
    role: 'Read-only Viewer',
    department: 'Public Information & Press Protocol'
  }
];
