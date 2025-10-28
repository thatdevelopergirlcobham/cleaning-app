import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js/React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapComponentsProps {
  position: [number, number];
  address?: string;
}

const MapComponents: React.FC<MapComponentsProps> = ({ position, address }) => {
  return (
    <>
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '200px', width: '100%' }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={DefaultIcon} />
      </MapContainer>
      <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-t border-gray-200">
        <div className="truncate">{address || 'Location selected'}</div>
        <div className="text-gray-400">
          {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      </div>
    </>
  );
};

export default MapComponents;
