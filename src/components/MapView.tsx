import { useState, useRef } from 'react';
import { useRealtimeReports } from '../hooks/useRealtimeReports';
import { useMap } from '../hooks/useMap';
import { LocateFixed } from 'lucide-react';
import L from 'leaflet';

export const MapView = () => {
  const { reports, loading, error } = useRealtimeReports();
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const { locateUser } = useMap({ 
    reports: reports || [],
    center: [51.505, -0.09] as [number, number], 
    zoom: 13,
    onMapInitialized: (map: L.Map) => {
      setMapInitialized(true);
      mapRef.current = map;
    }
  });

  const showLoading = (loading && !mapInitialized) || error;
  
  const handleLocateMe = () => {
    if (mapRef.current && locateUser) {
      locateUser();
    }
  };
  
  return (
    <div className="w-full h-[calc(100vh-64px)] relative p-4 bg-gray-50">
      <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
        {/* Map container */}
        <div id="map" className="w-full h-full"></div>
        
        {/* Location button */}
        <button 
          onClick={handleLocateMe}
          className="absolute bottom-6 right-6 z-[1000] bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          title="Find my location"
          aria-label="Find my location"
        >
          <LocateFixed className="w-6 h-6 text-blue-600" />
        </button>
        
        {/* Loading overlay */}
        {showLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
              {error ? (
                <div className="text-red-600">
                  <p>Error loading map data. Please try again.</p>
                  <p className="text-sm text-gray-500 mt-2">{error}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p>Loading map data...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;