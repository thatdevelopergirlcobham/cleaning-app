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
  const userLocationRef = useRef<[number, number] | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  
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
      userLocationRef.current = foundLocation;
      
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
    const greenIcon = L.divIcon({
      html: `<div class="w-4 h-4 bg-green-600 rounded-full border-2 border-white shadow-lg"></div>`,
      className: 'bg-transparent border-none',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    reports.forEach((report: ReportWithProfile) => {
      if (report.location && typeof report.location === 'object' && 'lat' in report.location && 'lng' in report.location) {
        const targetLatLng: [number, number] = [report.location.lat as number, report.location.lng as number];
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetLatLng[0]},${targetLatLng[1]}`;

        const marker = L.marker(targetLatLng, { icon: greenIcon })
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold">${report.title}</h3>
              <p class="text-sm text-gray-600">${report.description}</p>
              ${report.image_url ? `<img src="${report.image_url}" alt="${report.title}" class="w-full h-32 object-cover mt-2 rounded">` : ''}
              <div class="mt-2 text-xs text-gray-500">
                Status: <span class="capitalize">${report.status}</span>
              </div>
              <a href="${directionsUrl}" target="_blank" rel="noopener" class="inline-block mt-2 text-green-700 hover:text-green-800 underline">Open in Google Maps</a>
            </div>
          `);
        
        // On marker click, draw a green path from user's location to the report
        marker.on('click', () => {
          const drawRoute = (from: [number, number]) => {
            if (!mapRef.current) return;
            if (routeRef.current) {
              routeRef.current.removeFrom(mapRef.current);
              routeRef.current = null;
            }
            routeRef.current = L.polyline([from, targetLatLng], {
              color: '#16a34a', // green-600
              weight: 5,
              opacity: 0.9
            }).addTo(mapRef.current);
            mapRef.current.fitBounds(routeRef.current.getBounds(), { padding: [50, 50] });
          };

          if (userLocationRef.current) {
            drawRoute(userLocationRef.current);
          } else if (mapRef.current) {
            mapRef.current.locate({ setView: false, maxZoom: 15, timeout: 10000, enableHighAccuracy: true })
              .once('locationfound', (e) => {
                userLocationRef.current = [e.latlng.lat, e.latlng.lng];
                drawRoute(userLocationRef.current);
              })
              .once('locationerror', () => {
                // ignore
              });
          }
        });
        
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
      if (routeRef.current && mapRef.current) {
        routeRef.current.removeFrom(mapRef.current);
        routeRef.current = null;
      }
    };
  }, [reports, center, zoom, onMapInitialized]);

  return { map: mapRef, locateUser };
};