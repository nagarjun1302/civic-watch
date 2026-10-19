'use client';

import { useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Dynamically import DraggablePinMap with SSR disabled (Leaflet requires browser window)
const DraggablePinMap = dynamic(() => import('@/components/DraggablePinMap'), {
  ssr: false,
  loading: () => (
    <div className="h-56 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 border border-gray-200">
      Loading interactive map...
    </div>
  ),
});

const SEVERITY = ['Small', 'Medium', 'Large', 'Very Large'] as const;
const DANGER = ['Low', 'Medium', 'High', 'Extreme'] as const;

type SeverityType = (typeof SEVERITY)[number];
type DangerType = (typeof DANGER)[number];

const CITIES = [
  'Chennai',
  'Tambaram',
  'Avadi',
  'Velachery',
  'Porur',
  'Ambattur',
  'Sholinganallur',
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Hyderabad',
];

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Tambaram: { lat: 12.9249, lng: 80.1180 },
  Avadi: { lat: 13.1147, lng: 80.1017 },
  Velachery: { lat: 12.9752, lng: 80.2215 },
  Porur: { lat: 13.0382, lng: 80.1565 },
  Ambattur: { lat: 13.1143, lng: 80.1548 },
  Sholinganallur: { lat: 12.8997, lng: 80.2270 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
};


function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

function ReportWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTenderId = searchParams.get('tenderId');

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Photo & Location
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [roadArea, setRoadArea] = useState('');
  const [geotagCoords, setGeotagCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsSource, setGpsSource] = useState<'device' | 'exif' | 'map' | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Step 2: Severity, Danger & Remarks
  const [severity, setSeverity] = useState<SeverityType | null>(null);
  const [danger, setDanger] = useState<DangerType | null>(null);
  const [description, setDescription] = useState('');

  // Request browser GPS whenever user initiates photo capture
  const requestDeviceLocation = useCallback(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeotagCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsSource('device');
        },
        (err) => {
          console.warn('Browser GPS prompt dismissed or error:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  const handleTriggerUpload = () => {
    requestDeviceLocation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));

    // If device GPS didn't already capture coordinates, try EXIF GPS from photo
    if (!geotagCoords) {
      try {
        const exifr = (await import('exifr')).default;
        const gps = await exifr.gps(selectedFile);
        if (gps?.latitude && gps?.longitude) {
          setGeotagCoords({ lat: gps.latitude, lng: gps.longitude });
          setGpsSource('exif');
        }
      } catch {
        // No EXIF tags
      }
    }
  };

  const handleCityChange = useCallback((city: string | null) => {
    const chosen = city || '';
    setSelectedCity(chosen);
    // If coordinates are not yet set, center on city coordinates
    if (!geotagCoords && CITY_COORDS[chosen]) {
      setGeotagCoords(CITY_COORDS[chosen]);
      setGpsSource('map');
    }
  }, [geotagCoords]);

  const handleMapPinChange = (lat: number, lng: number) => {
    setGeotagCoords({ lat, lng });
    setGpsSource('map');
  };

  const handleSubmit = async () => {
    if (!file || !selectedCity || !severity || !danger) return;
    setSubmitting(true);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'roadwatch_unsigned';
      let photoUrl = '';

      // Try uploading to Cloudinary if configured; otherwise use Base64 for local database persistence
      if (cloudName && cloudName !== 'your_cloud_name') {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', uploadPreset);
          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: 'POST', body: formData }
          );
          const uploadData = await uploadRes.json();
          photoUrl = uploadData.secure_url || '';
        } catch (e) {
          console.warn('Cloudinary upload failed, falling back to data URL:', e);
        }
      }

      if (!photoUrl) {
        photoUrl = await fileToBase64(file);
      }

      const fullAddress = roadArea.trim()
        ? `${roadArea.trim()}, ${selectedCity}`
        : `${selectedCity}`;

      const body = {
        photoUrl,
        lat: geotagCoords?.lat ?? null,
        lng: geotagCoords?.lng ?? null,
        city: selectedCity,
        locationAddress: fullAddress,
        description: description.trim() || '',
        severity,
        dangerLevel: danger,
        matchedTenderId: preselectedTenderId || null,
        matchedTenderTitle: '',
        contractorName: '',
        responsibleOfficerName: '',
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      router.push(`/report/${data._id}`);
    } catch (err) {
      console.error(err);
      alert('Submission failed. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const chipClass = (selected: boolean) =>
    `px-4 py-2 rounded-lg border-2 text-sm font-medium cursor-pointer transition-all min-h-[44px] flex items-center justify-center ${
      selected
        ? 'border-green-600 bg-green-50 text-green-800'
        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
    }`;

  const currentMapCenter = geotagCoords || (selectedCity && CITY_COORDS[selectedCity]) || { lat: 12.9716, lng: 77.5946 };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          {['Photo & Location', 'Damage Details & Remarks'].map((label, i) => (
            <span key={label} className={step === i + 1 ? 'text-green-700 font-bold' : ''}>
              {label}
            </span>
          ))}
        </div>
        <Progress value={(step / 2) * 100} className="h-2" />
        <p className="text-xs text-gray-500 mt-1 text-right">Step {step} of 2</p>
      </div>

      {/* ====== STEP 1: Photo & Location ====== */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">📸 Geotagged Photo</h2>
            <p className="text-sm text-gray-500">
              Snap a live photo or upload an image of the road damage.
            </p>
          </div>

          {!preview ? (
            <div>
              <button
                type="button"
                onClick={handleTriggerUpload}
                className="w-full border-4 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center py-12 text-gray-400 hover:border-green-400 hover:text-green-600 transition-colors cursor-pointer bg-gray-50"
              >
                <span className="text-5xl mb-2">📷</span>
                <span className="text-base font-medium text-gray-700">Tap to snap or upload photo</span>
                <span className="text-xs text-gray-400 mt-1">Captures GPS coordinates automatically</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileChange(f);
                }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-2xl object-cover max-h-64 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setGeotagCoords(null);
                    setGpsSource(null);
                    setShowMap(false);
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md text-gray-600 hover:text-red-600"
                >
                  ✕
                </button>
              </div>

              {geotagCoords ? (
                <div className="flex items-center justify-between text-xs bg-green-50 p-2.5 rounded-lg border border-green-200 text-green-800">
                  <span>
                    📍 <strong>GPS Detected ({gpsSource}):</strong> {geotagCoords.lat.toFixed(5)}, {geotagCoords.lng.toFixed(5)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="text-green-700 underline font-medium hover:text-green-900 ml-2"
                  >
                    {showMap ? 'Hide Map' : 'Adjust Pin'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-800">
                  <span>ℹ️ GPS not detected automatically.</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCity && CITY_COORDS[selectedCity]) {
                        setGeotagCoords(CITY_COORDS[selectedCity]);
                      } else {
                        setGeotagCoords({ lat: 12.9716, lng: 77.5946 });
                      }
                      setShowMap(true);
                    }}
                    className="text-amber-800 underline font-medium ml-2"
                  >
                    Pin on Map
                  </button>
                </div>
              )}

              {/* Optional Interactive Map Pin Adjuster */}
              {showMap && (
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] text-gray-500">
                    💡 Drag the marker or tap anywhere on the map to pinpoint the exact pothole location:
                  </p>
                  <DraggablePinMap
                    lat={currentMapCenter.lat}
                    lng={currentMapCenter.lng}
                    onChange={handleMapPinChange}
                  />
                </div>
              )}
            </div>
          )}

          {/* City Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              🏙️ Select City <span className="text-red-500">*</span>
            </label>
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger className="bg-white min-h-[44px]">
                <SelectValue placeholder="Choose your city" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Road / Landmark */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              📍 Road Name or Landmark <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Input
              placeholder="e.g. Outer Ring Road, Near Bellandur Flyover"
              value={roadArea}
              onChange={(e) => setRoadArea(e.target.value)}
              className="bg-white min-h-[44px]"
            />
          </div>

          <Button
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white min-h-[48px]"
            disabled={!file || !selectedCity}
            onClick={() => setStep(2)}
          >
            Next: Describe Problem →
          </Button>
        </div>
      )}

      {/* ====== STEP 2: Describe the Problem & Remarks ====== */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">📝 Problem Details & Remarks</h2>
            <p className="text-sm text-gray-500">
              Location: {roadArea ? `${roadArea}, ${selectedCity}` : selectedCity}
              {geotagCoords && ` (📍 ${geotagCoords.lat.toFixed(4)}, ${geotagCoords.lng.toFixed(4)})`}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Pothole Size <span className="text-red-500">*</span></p>
            <div className="grid grid-cols-2 gap-2">
              {SEVERITY.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={chipClass(severity === s)}
                  onClick={() => setSeverity(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Danger Level <span className="text-red-500">*</span></p>
            <div className="grid grid-cols-2 gap-2">
              {DANGER.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={chipClass(danger === d)}
                  onClick={() => setDanger(d)}
                >
                  {d === 'Extreme' ? '🔴' : d === 'High' ? '🟠' : d === 'Medium' ? '🟡' : '🟢'} {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Citizen Remarks & Description <span className="text-gray-400 font-normal">(optional)</span>
            </p>
            <Textarea
              placeholder="e.g. Deep pothole on the right lane, hazardous at night or during rain, causing vehicle damage..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1 min-h-[48px]"
              onClick={() => setStep(1)}
            >
              ← Back
            </Button>
            <Button
              type="button"
              className="flex-1 min-h-[48px] bg-green-600 hover:bg-green-700 text-white"
              disabled={!severity || !danger || submitting}
              onClick={handleSubmit}
            >
              {submitting ? '⏳ Submitting...' : '✅ Submit Complaint'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>}>
      <ReportWizardInner />
    </Suspense>
  );
}