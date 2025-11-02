import { useRealtimeReports } from '../hooks/useRealtimeReports';
import { useMap } from '../hooks/useMap';

export const MapView = () => {
  const { reports, loading } = useRealtimeReports();
  
  // Initialize map whenever reports update
  useMap({ 
    reports: reports || [],
    center: [51.505, -0.09], 
    zoom: 13
  });

  return (
    <div className="w-full h-[calc(100vh-64px)]">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div id="map" className="w-full h-full"></div>
      )}
    </div>
  );
};