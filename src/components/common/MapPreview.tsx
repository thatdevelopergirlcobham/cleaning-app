import React, { useEffect, useRef } from 'react'

interface Location {
  lat: number
  lng: number
}

interface MapPreviewProps {
  location: Location
  className?: string
  height?: string
}

const MapPreview: React.FC<MapPreviewProps> = ({
  location,
  className = '',
  height = '200px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // This is a placeholder for map integration
    // In a real implementation, you would use a mapping library like Leaflet or Google Maps
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div class="flex items-center justify-center h-full bg-gray-100 text-gray-500 rounded-2xl">
          <div class="text-center">
            <div class="text-2xl mb-2">📍</div>
            <div class="font-medium">Map View</div>
            <div class="text-sm text-gray-400">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</div>
          </div>
        </div>
      `
    }
  }, [location])

  return (
    <div
      ref={mapRef}
      className={`w-full rounded-2xl overflow-hidden ${className}`}
      style={{ height }}
    />
  )
}

export default MapPreview
