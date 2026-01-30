
import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useTranslate } from '../hooks/useTranslate';
import { Language } from '../types';

// Fix for default marker icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


interface MapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  language: Language;
}

const MapController: React.FC<{ latitude: number | null, longitude: number | null }> = ({ latitude, longitude }) => {
  const map = useMap();
  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude], 13);
    }
  }, [latitude, longitude, map]);
  return null;
}

const LocationMarker: React.FC<{
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ latitude, longitude, onLocationSelect }) => {
  const markerRef = useRef<L.Marker>(null);
  
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onLocationSelect(lat, lng);
        }
      },
    }),
    [onLocationSelect],
  );

  if (!latitude || !longitude) {
    return null;
  }

  return (
    <Marker 
      position={[latitude, longitude]} 
      draggable={true} 
      eventHandlers={eventHandlers} 
      ref={markerRef}
    />
  );
};


const Map: React.FC<MapProps> = ({ latitude, longitude, onLocationSelect, language }) => {
  const t = useTranslate(language);
  const indiaCenter: [number, number] = [20.5937, 78.9629]; // Center of India

  return (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
      <MapContainer center={indiaCenter} zoom={5} scrollWheelZoom={true} className="w-full h-full min-h-[300px]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker latitude={latitude} longitude={longitude} onLocationSelect={onLocationSelect} />
        <MapController latitude={latitude} longitude={longitude} />
      </MapContainer>
      <div className="absolute bottom-0 w-full text-center p-1 bg-black/40 text-white text-xs z-[1000]">
        {t('mapInstruction')}
      </div>
    </div>
  );
};

export default Map;