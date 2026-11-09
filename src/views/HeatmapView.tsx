import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Info,
  Maximize2,
  Navigation
} from 'lucide-react';
import { Zone, RouteSegment } from '../types';

interface HeatmapViewProps {
  zones: Zone[];
  routes: RouteSegment[];
  onSelectZone?: (zoneId: string) => void;
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({ zones, routes, onSelectZone }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(zones[0] || null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'ghats' | 'transit' | 'emergency'>('all');

  // Center on Rajamahendravaram / Godavari Riverfront
  const centerLat = 17.004;
  const centerLng = 81.775;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: true
      });

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | RMC Godavari Pushkaralu Grid'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Render Routes
    routes.forEach((route) => {
      let routeColor = '#3b82f6';
      if (route.isEmergencyCorridor) routeColor = '#ef4444';
      else if (route.currentStatus === 'congested') routeColor = '#f59e0b';
      else if (route.isRecommendedAlternative) routeColor = '#10b981';

      const polyline = L.polyline(route.coordinates, {
        color: routeColor,
        weight: route.isEmergencyCorridor ? 4 : 3,
        dashArray: route.isEmergencyCorridor ? '8, 8' : undefined,
        opacity: 0.8
      }).addTo(map);

      polyline.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <strong style="color: #0f172a;">${route.name}</strong><br/>
          <span>Distance: ${(route.distanceMeters / 1000).toFixed(1)} km · Est: ${route.estimatedTravelTimeMin} mins</span><br/>
          <span style="font-weight: 600; color: ${routeColor}">Status: ${route.currentStatus.toUpperCase()}</span>
        </div>
      `);
    });

    // Render Zones as Heat/Density Circles
    zones.forEach((zone) => {
      // Determine circle color by density status
      let fillColor = '#10b981'; // green
      let radius = 220;

      if (zone.densityStatus === 'critical') {
        fillColor = '#ef4444'; // red
        radius = 350;
      } else if (zone.densityStatus === 'high') {
        fillColor = '#f97316'; // orange
        radius = 280;
      } else if (zone.densityStatus === 'moderate') {
        fillColor = '#f59e0b'; // amber
        radius = 240;
      }

      // Density heatmap circle
      const circle = L.circle([zone.latitude, zone.longitude], {
        color: fillColor,
        fillColor: fillColor,
        fillOpacity: 0.35,
        radius: radius,
        weight: 2
      }).addTo(map);

      // Marker icon for precise center
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color: ${fillColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([zone.latitude, zone.longitude], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; min-width: 180px;">
          <h4 style="margin: 0 0 4px 0; color: #0f172a; font-size: 13px;">${zone.name}</h4>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${zone.tehsil}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Current Crowd:</span>
            <strong>${zone.currentCount.toLocaleString()}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Density:</span>
            <strong style="color: ${fillColor}">${zone.density} /m²</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Safe Capacity:</span>
            <span>${zone.safeCapacity.toLocaleString()}</span>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      marker.bindPopup(popupContent);

      circle.on('click', () => {
        setSelectedZone(zone);
        if (onSelectZone) onSelectZone(zone.id);
      });
      marker.on('click', () => {
        setSelectedZone(zone);
        if (onSelectZone) onSelectZone(zone.id);
      });
    });
  }, [zones, routes]);

  return (
    <div className="space-y-4">
      {/* Top Banner & Layer Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Godavari Riverfront Geographic Crowd Density Heatmap
          </h2>
          <p className="text-xs text-slate-500">
            Spatial monitoring across Pushkar Ghat, Kotilingala, Saraswati Ghat, Rail Bridges & Peripheral Hubs
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400">Heatmap Scale:</span>
          <span className="flex items-center gap-1 font-medium text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal (&lt;1.5)
          </span>
          <span className="flex items-center gap-1 font-medium text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (1.5-2.5)
          </span>
          <span className="flex items-center gap-1 font-medium text-orange-700">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High (2.5-3.8)
          </span>
          <span className="flex items-center gap-1 font-medium text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical (&gt;3.8)
          </span>
        </div>
      </div>

      {/* Map + Sidebar Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Viewport */}
        <div className="lg:col-span-3 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative h-[560px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Map corner badge */}
          <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 text-[10px] text-slate-500">
            Demo Pushkaralu GIS Coordinates · OpenStreetMap Engine
          </div>
        </div>

        {/* Selected Zone Inspector Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {selectedZone?.id || 'ZONE'}
              </span>
              <span
                className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                  selectedZone?.densityStatus === 'critical'
                    ? 'bg-rose-100 text-rose-800'
                    : selectedZone?.densityStatus === 'high'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {selectedZone?.densityStatus}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-2">{selectedZone?.name}</h3>
            <p className="text-xs text-slate-500">{selectedZone?.tehsil}</p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Current Congregation</span>
                <span className="font-bold font-mono text-slate-900">
                  {selectedZone?.currentCount.toLocaleString()} devotees
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Calculated Density</span>
                <span className="font-bold font-mono text-blue-700">
                  {selectedZone?.density} persons / m²
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Usable Ground Area</span>
                <span className="font-mono text-slate-800">
                  {selectedZone?.usableAreaSqM.toLocaleString()} m²
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Safe Capacity Limit</span>
                <span className="font-mono text-slate-800">
                  {selectedZone?.safeCapacity.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-50">
                <span className="text-slate-600">Arrival Flow Delta</span>
                <span className="font-mono font-semibold text-amber-700">
                  +{selectedZone?.trendRate} pilgrims / min
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-semibold text-slate-700">Assigned Monitoring Cams:</div>
            <div className="flex flex-wrap gap-1">
              {selectedZone?.assignedCameraIds.map((cid) => (
                <span
                  key={cid}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {cid}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
