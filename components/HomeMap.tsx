'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { getDlpStatus, getCategoryIcon, getCategoryBadgeClass, formatCrore } from '@/lib/helpers';

// Fix default marker icons in webpack/nextjs
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Tender {
  _id: string;
  tenderId: string;
  title: string;
  category: string;
  subCategory?: string;
  status: string;
  value?: number;
  organisation?: string;
  contractorName: string;
  defectLiabilityEndDate: string;
  roadLocation: { lat: number; lng: number; locationName: string; radiusKm?: number };
  distance?: number;
}

interface FlyToUserProps {
  lat: number;
  lng: number;
  zoom?: number;
}

function FlyToUser({ lat, lng, zoom = 13 }: FlyToUserProps) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { animate: true, duration: 1.2 });
  }, [lat, lng, zoom, map]);
  return null;
}

function createCategoryMarker(category: string, dlpStatus: string, isCancelled: boolean) {
  const icon = getCategoryIcon(category);
  const borderColor = isCancelled
    ? '#9ca3af'
    : dlpStatus === 'active'
    ? '#16a34a'
    : dlpStatus === 'expiring'
    ? '#d97706'
    : '#dc2626';

  const bgColor = isCancelled
    ? '#f3f4f6'
    : dlpStatus === 'active'
    ? '#f0fdf4'
    : dlpStatus === 'expiring'
    ? '#fffbeb'
    : '#fef2f2';

  return L.divIcon({
    className: 'custom-cat-pin',
    html: `
      <div style="
        background: ${bgColor};
        border: 2.5px solid ${borderColor};
        border-radius: 9999px;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 4px 8px -1px rgba(0,0,0,0.18), 0 2px 4px -2px rgba(0,0,0,0.1);
        transition: transform 0.15s ease;
      ">
        ${icon}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });
}

const userLocationIcon = L.divIcon({
  className: 'user-live-pin',
  html: `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: 28px;
        height: 28px;
        background-color: #3b82f6;
        border-radius: 9999px;
        opacity: 0.45;
        animation: pulse 2s infinite ease-in-out;
      "></div>
      <div style="
        position: relative;
        width: 16px;
        height: 16px;
        background-color: #2563eb;
        border: 2.5px solid white;
        border-radius: 9999px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

interface HomeMapProps {
  tenders: Tender[];
  userLocation: { lat: number; lng: number } | null;
  selectedRadiusKm?: number;
  highlightedTenderId?: string | null;
}

export default function HomeMap({
  tenders,
  userLocation,
  selectedRadiusKm = 10,
  highlightedTenderId,
}: HomeMapProps) {
  // Default center: Chennai (Guindy / Velachery central hub)
  const defaultCenter: [number, number] = [12.9800, 80.2100];
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <>
          <FlyToUser lat={userLocation.lat} lng={userLocation.lng} zoom={12} />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="text-xs p-1 text-center font-medium">
                <span className="text-blue-600 font-bold block mb-0.5">📍 Your Location</span>
                Searching tenders within {selectedRadiusKm} km
              </div>
            </Popup>
          </Marker>
          {selectedRadiusKm > 0 && selectedRadiusKm < 50 && (
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={selectedRadiusKm * 1000}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#93c5fd',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '4, 6',
              }}
            />
          )}
        </>
      )}

      {tenders.map((tender) => {
        const { status: dlpStatus, daysLeft } = getDlpStatus(tender.defectLiabilityEndDate);
        const isCancelled = tender.status === 'Cancelled';
        const markerIcon = createCategoryMarker(tender.category, dlpStatus, isCancelled);

        const dlpBadgeText = isCancelled
          ? 'Cancelled'
          : dlpStatus === 'expired'
          ? 'DLP Expired'
          : dlpStatus === 'expiring'
          ? `DLP ends in ${daysLeft}d`
          : `DLP Active (${daysLeft}d)`;

        const badgeClass = getCategoryBadgeClass(tender.category);

        return (
          <Marker
            key={tender._id}
            position={[tender.roadLocation.lat, tender.roadLocation.lng]}
            icon={markerIcon}
          >
            <Popup className="custom-popup">
              <div className="min-w-[220px] max-w-[280px] p-1 font-sans">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}
                  >
                    {getCategoryIcon(tender.category)} {tender.category}
                  </span>
                  {typeof tender.distance === 'number' && (
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      📍 {tender.distance} km
                    </span>
                  )}
                </div>

                <p className="font-bold text-xs text-gray-900 leading-snug mb-1">
                  {tender.title}
                </p>

                <p className="text-[11px] text-gray-600 mb-1 line-clamp-1">
                  🏗️ {tender.contractorName}
                </p>

                {tender.value ? (
                  <p className="text-[11px] text-gray-500 mb-2">
                    🏛️ {tender.organisation || 'Govt Tender'} • {formatCrore(tender.value)}
                  </p>
                ) : null}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isCancelled
                        ? 'bg-gray-100 text-gray-600'
                        : dlpStatus === 'expired'
                        ? 'bg-red-50 text-red-700'
                        : dlpStatus === 'expiring'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {dlpBadgeText}
                  </span>

                  <Link
                    href={`/tender/${tender.tenderId}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
