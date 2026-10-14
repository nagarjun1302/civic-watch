# 🛣️ RoadWatch — Citizen Road Accountability Platform

> Inspired by **Vyom Bhatnagar's Nagrik app concept**.  
> Bridges citizen grievances directly to government road contracts and contractor accountability via Defect Liability Periods (DLP).

---

## 💡 What is RoadWatch?

India's roads are constructed and maintained under tenders that enforce a **Defect Liability Period (DLP)** — during which the contractor is legally obligated to repair any damages or potholes for free at zero public expense.

Citizens often suffer from bad roads because they do not know:
1. Which contractor laid the road
2. Whether the road is still within its DLP warranty
3. Who the responsible executive engineer/officer is and how to contact them

**RoadWatch solves this**:
- 📸 **Spot & Snap**: Citizen snaps a photo directly on the street.
- 📍 **Auto-Geotag**: GPS coordinates are extracted from phone EXIF data or device GPS.
- 🏗️ **Contractor Matching**: Nearby active road contracts are automatically fetched.
- ⚖️ **Legal Accountability**: Generates a pre-filled, formal legal notice referencing the tender ID, contractor name, phone/email, and DLP clause.
- 📤 **Instant Sharing**: Send via WhatsApp, email, or copy to clipboard in one tap.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Maps**: Leaflet.js + `react-leaflet` (dynamic SSR-safe client components)
- **Database**: MongoDB + Mongoose (can share DB with TendAI or run standalone)
- **Photo Storage**: Cloudinary (Unsigned client upload preset)
- **EXIF Extraction**: `exifr` (automatic GPS metadata reading from camera photos)
- **Reverse Geocoding**: OpenStreetMap Nominatim API

---

## ⚙️ Prerequisites & Setup

### 1. Clone & Install Dependencies
```bash
cd RoadWatch
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
MONGO_URI=mongodb://127.0.0.1:27017/roadwatch
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudinary Setup (Free Tier)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=roadwatch_unsigned
```

> [!TIP]
> **Getting Cloudinary Credentials (Takes 2 minutes)**:
> 1. Sign up for a free account at [Cloudinary](https://cloudinary.com).
> 2. Go to **Settings** (gear icon) → **Upload**.
> 3. Scroll to **Upload presets** and click **Add upload preset**.
> 4. Set **Signing Mode** to **Unsigned**.
> 5. Name the preset `roadwatch_unsigned` (or matching your env var).
> 6. Copy your **Cloud Name** from the dashboard home.
> *(If Cloudinary is not configured, RoadWatch will gracefully fallback to local preview URLs for testing).*

### 3. Ensure MongoDB is Running
- **Local MongoDB**: Ensure `mongod` service is active on `mongodb://127.0.0.1:27017`
- Or use **MongoDB Atlas**: Provide your connection string in `MONGO_URI`.

### 4. Seed Realistic Indian Road Tenders & Reports
Run the seed script to populate 10 real-world Indian road contracts (Bengaluru BBMP, NHAI NH-48, Hyderabad GHMC, Mumbai MSRDC, Chennai, Delhi Dwarka Expressway) and 5 sample pothole reports:
```bash
npx tsx scripts/seed.ts
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Application Overview & Routes

| Route | Description |
|---|---|
| `/` | **Home / Live Map**: Centered on user GPS, showing all tenders color-coded by DLP status (🟢 Green = Active DLP, 🟡 Amber = Expiring in <30 days, 🔴 Red = Expired). Top search bar and floating report button. |
| `/tender/[id]` | **Tender Detail**: Road details, organisation, contract value, DLP countdown, mini-map, contractor contact card (`tel:` and `mailto:`), responsible officer details, and linked pothole complaints. |
| `/report` | **Multi-step Report Wizard**: Step 1: Camera photo upload with EXIF GPS parsing. Step 2: Draggable map pin & reverse geocode address confirmation. Step 3: Proximity match to contractor. Step 4: Severity & danger selector + Cloudinary upload. |
| `/report/[id]` | **Report Detail & Complaint Letter**: Full photo view, status badge, map pin, matched contractor summary, formal legal complaint letter, and WhatsApp/Email/Clipboard sharing. |
| `/reports` | **Browse Reports**: Toggle between Map view and List view with filtering by Status (Open, In Review, Resolved), Severity, and Danger Level. |

---

## 🔗 API Reference

- `GET /api/road-tenders`: Retrieve all road tenders with optional `?search=` and `?status=` filters.
- `GET /api/road-tenders/nearby?lat=X&lng=Y&radius=5`: Finds road tenders covering the given GPS coordinates using Haversine calculation.
- `GET /api/road-tenders/[id]`: Retrieve single tender with matched report count and report documents.
- `GET /api/reports`: List all citizen reports with optional filters.
- `POST /api/reports`: Submit a new citizen grievance.
- `GET /api/reports/nearby?lat=X&lng=Y&radius=3`: Get nearby pothole reports.
- `PATCH /api/reports/[id]/status`: Update report status (`Open` | `In Review` | `Resolved`).
