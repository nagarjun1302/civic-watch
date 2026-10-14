'use client';

import { useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SEVERITY = ['Small', 'Medium', 'Large', 'Very Large'] as const;
const DANGER = ['Low', 'Medium', 'High', 'Extreme'] as const;

type SeverityType = (typeof SEVERITY)[number];
type DangerType = (typeof DANGER)[number];

const CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Visakhapatnam',
];

function ReportWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTenderId = searchParams.get('tenderId');

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Photo & City
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [roadArea, setRoadArea] = useState('');
  const [geotagCoords, setGeotagCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Step 2: Severity, Danger & Description
  const [severity, setSeverity] = useState<SeverityType | null>(null);
  const [danger, setDanger] = useState<DangerType | null>(null);
  const [description, setDescription] = useState('');

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));

    // Read EXIF geotag from photo if available
    try {
      const exifr = (await import('exifr')).default;
      const gps = await exifr.gps(selectedFile);
      if (gps?.latitude && gps?.longitude) {
        setGeotagCoords({ lat: gps.latitude, lng: gps.longitude });
      } else {
        setGeotagCoords(null);
      }
    } catch {
      setGeotagCoords(null);
    }
  };

  const handleCityChange = useCallback((city: string | null) => {
    setSelectedCity(city || '');
  }, []);

  const handleSubmit = async () => {
    if (!file || !selectedCity || !severity || !danger) return;
    setSubmitting(true);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'roadwatch_unsigned';
      let photoUrl = '';

      if (cloudName && cloudName !== 'your_cloud_name') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        );
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.secure_url || '';
      } else {
        photoUrl = preview || '';
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
        description: description || '',
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
      alert('Submission failed. Please try again.');
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

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          {['Photo & City', 'Problem Details'].map((label, i) => (
            <span key={label} className={step === i + 1 ? 'text-green-700 font-bold' : ''}>
              {label}
            </span>
          ))}
        </div>
        <Progress value={(step / 2) * 100} className="h-2" />
        <p className="text-xs text-gray-500 mt-1 text-right">Step {step} of 2</p>
      </div>

      {/* ====== STEP 1: Photo & City ====== */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">📸 Geotagged Photo</h2>
            <p className="text-sm text-gray-500">
              Upload or snap a photo of the road damage.
            </p>
          </div>

          {!preview ? (
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-4 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center py-12 text-gray-400 hover:border-green-400 hover:text-green-600 transition-colors cursor-pointer bg-gray-50"
              >
                <span className="text-5xl mb-2">📷</span>
                <span className="text-base font-medium text-gray-700">Tap to upload photo</span>
                <span className="text-xs text-gray-400 mt-1">Reads geotag metadata automatically</span>
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
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-2xl object-cover max-h-64"
              />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setGeotagCoords(null);
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md text-gray-600 hover:text-red-600"
              >
                ✕
              </button>

              {geotagCoords ? (
                <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded-lg border border-green-200">
                  📍 <strong>Geotag detected:</strong> {geotagCoords.lat.toFixed(5)}, {geotagCoords.lng.toFixed(5)}
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  ℹ️ Photo uploaded without embedded GPS tags.
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

      {/* ====== STEP 2: Describe the Problem ====== */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">📝 Describe the Problem</h2>
            <p className="text-sm text-gray-500">Location: {roadArea ? `${roadArea}, ${selectedCity}` : selectedCity}</p>
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
            <p className="text-sm font-semibold text-gray-700 mb-1">Additional Details (optional)</p>
            <Textarea
              placeholder="e.g. Dangerous for two-wheelers at night, near water logging..."
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
              {submitting ? '⏳ Submitting...' : '✅ Submit Report'}
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