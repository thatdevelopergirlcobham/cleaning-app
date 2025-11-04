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
  onMapInitialized?: (map: L.Map) => void;
}

export const useMap = ({ 
  reports, 
  center = [51.505, -0.09], 
  zoom = 13, 
  onMapInitialized 
}: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  
  // Function to locate user
  const locateUser = () => {
    if (!mapRef.current) return;
    
    mapRef.current.locate({
      setView: true,
      maxZoom: 16,
      timeout: 10000,
      enableHighAccuracy: true
    }).on('locationfound', (e) => {
      const { lat, lng } = e.latlng;
      const foundLocation = [lat, lng] as [number, number];
      
      // Add a marker for user's location
      const userIcon = L.divIcon({
        html: `<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>`,
        className: 'bg-transparent border-none',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      
      L.marker(foundLocation, { icon: userIcon })
        .bindPopup('Your location')
        .addTo(markersRef.current || mapRef.current!);
        
    }).on('locationerror', (err) => {
      console.error('Error getting location:', err.message);
      if (mapRef.current) {
        mapRef.current.setView(center, zoom);
      }
    });
  };

  useEffect(() => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainer, {
        zoomControl: false
      }).setView(center, zoom);
      
      // Add zoom control with custom position
      L.control.zoom({
        position: 'topright'
      }).addTo(mapRef.current);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      markersRef.current = L.layerGroup().addTo(mapRef.current);
      
      // Call the initialization callback if provided
      if (onMapInitialized) {
        onMapInitialized(mapRef.current);
      }
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

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markersRef.current) {
        markersRef.current.clearLayers();
        markersRef.current = null;
      }
    };
  }, [reports, center, zoom, onMapInitialized]);

  return { map: mapRef, locateUser };
};