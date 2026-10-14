'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Report {
  _id: string;
  lat: number;
  lng: number;
  locationAddress: string;
  severity: string;
  dangerLevel: string;
  status: string;
}

interface ReportsMapProps {
  reports: Report[];
}

export default function ReportsMap({ reports }: ReportsMapProps) {
  const center: [number, number] =
    reports.length > 0
      ? [reports[0].lat, reports[0].lng]
      : [12.9716, 77.5946];

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map((report) => (
        <Marker
          key={report._id}
          position={[report.lat, report.lng]}
          icon={redIcon}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-semibold text-sm mb-1">{report.severity} Pothole</p>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{report.locationAddress}</p>
              <p className="text-xs mb-2">
                Danger: <span className="font-medium">{report.dangerLevel}</span> · Status:{' '}
                <span className="font-medium">{report.status}</span>
              </p>
              <Link href={`/report/${report._id}`} className="text-xs text-blue-600 underline">
                View Report →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
