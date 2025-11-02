import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type ReportWithProfile } from '../api/reports';

// Fix for default marker icons in Leaflet when using webpack
interface ExtendedIcon extends L.Icon.Default {
  _getIconUrl?: () => string;
}
delete (L.Icon.Default.prototype as ExtendedIcon)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  reports: ReportWithProfile[];
  center?: [number, number];
  zoom?: number;
}

export const useMap = ({ reports, center = [51.505, -0.09], zoom = 13 }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainer).setView(center, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      markersRef.current = L.layerGroup().addTo(mapRef.current);
    }

    // Clear existing markers
    if (markersRef.current) {
      markersRef.current.clearLayers();
    }

    // Add markers for reports
    reports.forEach((report: ReportWithProfile) => {
      if (report.location && typeof report.location === 'object' && 'lat' in report.location && 'lng' in report.location) {
        const marker = L.marker([report.location.lat, report.location.lng])
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold">${report.title}</h3>
              <p class="text-sm text-gray-600">${report.description}</p>
              ${report.image_url ? `<img src="${report.image_url}" alt="${report.title}" class="w-full h-32 object-cover mt-2 rounded">` : ''}
              <div class="mt-2 text-xs text-gray-500">
                Status: <span class="capitalize">${report.status}</span>
              </div>
            </div>
          `);
        
        if (markersRef.current) {
          marker.addTo(markersRef.current);
        }
      }
    });

    // Center map on first report if available
    const firstReport = reports[0];
    if (firstReport?.location && typeof firstReport.location === 'object' && 'lat' in firstReport.location) {
      mapRef.current?.setView([firstReport.location.lat, firstReport.location.lng], zoom);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
      }
    };
  }, [reports, center, zoom]);

  return mapRef;
};