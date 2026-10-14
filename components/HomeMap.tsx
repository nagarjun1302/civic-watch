'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { getDlpStatus } from '@/lib/helpers';
import { useEffect } from 'react';

// Fix default marker icons in webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const amberIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Tender {
  _id: string;
  tenderId: string;
  title: string;
  status: string;
  contractorName: string;
  defectLiabilityEndDate: string;
  roadLocation: { lat: number; lng: number; locationName: string };
}

interface FlyToUserProps {
  lat: number;
  lng: number;
}

function FlyToUser({ lat, lng }: FlyToUserProps) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { animate: true, duration: 1.5 });
  }, [lat, lng, map]);
  return null;
}

interface HomeMapProps {
  tenders: Tender[];
  userLocation: { lat: number; lng: number } | null;
}

export default function HomeMap({ tenders, userLocation }: HomeMapProps) {
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [12.9716, 77.5946]; // Default: Bengaluru

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && <FlyToUser lat={userLocation.lat} lng={userLocation.lng} />}

      {tenders.map((tender) => {
        const { status, daysLeft } = getDlpStatus(tender.defectLiabilityEndDate);
        const isCancelled = tender.status === 'Cancelled';

        let icon = greenIcon;
        if (isCancelled) icon = greyIcon;
        else if (status === 'expired') icon = redIcon;
        else if (status === 'expiring') icon = amberIcon;

        const dlpLabel = isCancelled
          ? 'Cancelled'
          : status === 'expired'
          ? 'DLP Expired'
          : status === 'expiring'
          ? `DLP expiring in ${daysLeft} days`
          : `DLP ends in ${daysLeft} days`;

        return (
          <Marker
            key={tender._id}
            position={[tender.roadLocation.lat, tender.roadLocation.lng]}
            icon={icon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <p className="font-bold text-sm mb-1">{tender.title}</p>
                <p className="text-xs text-gray-600 mb-1">{tender.contractorName}</p>
                <p
                  className={`text-xs font-semibold mb-2 ${
                    isCancelled
                      ? 'text-gray-500'
                      : status === 'expired'
                      ? 'text-red-600'
                      : status === 'expiring'
                      ? 'text-amber-600'
                      : 'text-green-600'
                  }`}
                >
                  {dlpLabel}
                </p>
                <Link
                  href={`/tender/${tender.tenderId}`}
                  className="text-xs text-blue-600 underline"
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
