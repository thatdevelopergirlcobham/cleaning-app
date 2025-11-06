import { useState, useRef, useMemo } from 'react';
import { useRealtimeReports } from '../hooks/useRealtimeReports';
import { useMap } from '../hooks/useMap';
import { LocateFixed } from 'lucide-react';
import L from 'leaflet';

export const MapView = () => {
  const { reports, loading, error } = useRealtimeReports();
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Search and filter UI state
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'all' | 'closest'>('all');
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  // Compute filtered/sorted reports for the map
  const filteredReports = useMemo(() => {
    const list = Array.isArray(reports) ? reports : [];
    const q = query.trim().toLowerCase();
    let res = list.filter(r => {
      if (!q) return true;
      const t = (r.title || '').toLowerCase();
      const d = (r.description || '').toLowerCase();
      return t.includes(q) || d.includes(q);
    });
    if (mode === 'closest' && userPos) {
      const [ulat, ulng] = userPos;
      const dist = (a: [number, number], b: [number, number]) => {
        const R = 6371e3; // meters
        const toRad = (x: number) => (x * Math.PI) / 180;
        const dLat = toRad(b[0] - a[0]);
        const dLng = toRad(b[1] - a[1]);
        const lat1 = toRad(a[0]);
        const lat2 = toRad(b[0]);
        const aHarv = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
        return R * c;
      };
      res = res
        .map(r => {
          const loc = r.location && typeof r.location === 'object' && 'lat' in r.location && 'lng' in r.location
            ? [r.location.lat as number, r.location.lng as number]
            : null;
          const meters = loc ? dist([ulat, ulng], loc as [number, number]) : Number.POSITIVE_INFINITY;
          return { r, meters };
        })
        .sort((a, b) => a.meters - b.meters)
        .slice(0, 50)
        .map(x => x.r);
    }
    return res;
  }, [reports, query, mode, userPos]);

  const { locateUser } = useMap({ 
    reports: filteredReports,
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };
  
  return (
    <div className="w-full h-[calc(100vh-64px)] relative p-4 bg-gray-50">
      <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
        {/* Controls */}
        <div className="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports..."
            className="border border-gray-300 rounded px-2 py-1 w-64"
          />
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'all' | 'closest')}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="closest">Closest</option>
          </select>
        </div>

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