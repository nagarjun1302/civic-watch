# 🏛️ CivicWatch by TendAI - Citizen Public Works & Tender Accountability Platform

> Bridges citizen grievances directly to government public works tenders, contractor accountability, and **Defect Liability Periods (DLP)** across all infrastructure sectors.

---

## 💡 What is CivicWatch?

Public infrastructure — from roads and bridges to government schools, hospitals, water supply pipelines, and drainage systems — is executed under tenders that enforce a **Defect Liability Period (DLP)**. During this warranty period, the contractor is legally obligated to repair any damages, leaks, or defects for free at zero public expense.

Citizens often experience substandard infrastructure because they do not know:
1. **Which contractor** built or maintains the facility
2. Whether the asset is still within its **legally enforceable DLP warranty**
3. Who the **responsible executive engineer / government officer** is and how to contact them
4. What **tenders and public projects** are currently active or completed in their immediate neighborhood

**CivicWatch solves this**:
- 📍 **Near My Location (GPS)**: One-click live GPS detection fetches and sorts all public tenders within your chosen radius (`3 km` to `50 km`).
- 🏗️ **All Tender Categories**: Covers **Buildings & Construction**, **Roads & Bridges**, **Water Supply & Drainage**, **Metro & Transit**, and **Parks & Civic Amenities**.
- 📸 **Spot & Report**: Citizen snaps a photo with automatic GPS geotagging.
- 🔍 **Contractor Matching**: Proximity matching links the defect directly to the responsible contractor and public authority.
- ⚖️ **Legal Notice Generation**: Pre-fills formal legal notices citing the tender ID, contractor contact details, and the DLP obligation clause.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Maps**: Leaflet.js + `react-leaflet` (dynamic SSR-safe client components with custom category markers and pulsing GPS pins)
- **Database**: MongoDB + Mongoose (standalone or Atlas connection)
- **Photo Storage**: Cloudinary (Unsigned client upload preset with local fallback)
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

# Cloudinary Setup (Optional - Free Tier)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=roadwatch_unsigned
```

### 3. Seed Realistic Chennai & Suburbs Public Tenders
Populates **18 realistic tenders** (GCC, TN PWD, CMDA, CMWSSB, CMRL, Highways Dept) and sample grievance reports across Chennai, Velachery, Guindy, Tambaram, Chromepet, Porur, Poonamallee, Ambattur, Avadi, OMR, and Sholinganallur:

```bash
npx tsx --env-file=.env.local scripts/seed.ts
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Application Overview & Routes

| Route | Description |
|---|---|
| `/` | **Home / Live Map & Tender Feed**: Auto-detects user GPS, allows radius adjustments (3–50 km), filters by sector (Buildings, Roads, Water, Metro, Parks) or neighborhood, and toggles between Split View, Map Only, and List Only. |
| `/tender/[id]` | **Tender Detail**: Project specifications, organisation, contract value, DLP warranty countdown, mini-map, contractor contact card (`tel:` and `mailto:`), responsible officer details, and linked citizen complaints. |
| `/report` | **Multi-step Report Wizard**: Photo capture with EXIF GPS parsing, draggable map pin, automated contractor matching, and defect categorization. |
| `/report/[id]` | **Report Detail & Legal Complaint**: Full photo view, status badge, map pin, matched contractor summary, and formal legal complaint letter. |
| `/reports` | **Browse Public Reports**: Filter by suburb, status (Open, In Review, Resolved), severity, and danger level. |
| `/admin/complaints` | **Municipal Admin Dashboard**: Official status updates, remarks, and complaint resolution tracking. |

---

## 🏗️ Supported Tender Categories

- 🏢 **Buildings & Construction**: Government schools, taluk administrative complexes, hospitals, automated multi-level parking, municipal stadiums.
- 🛣️ **Roads & Bridges**: Flyovers, arterial road widening, concrete corridors, expressways, bypasses.
- 💧 **Water Supply & Drainage**: Stormwater drainage networks (SWD), underground sewerage schemes (UGSS), desalination trunk mains, lake channels.
- 🚇 **Metro & Transit**: Elevated metro viaducts, multi-modal transit interchanges, pedestrian skywalks.
- 🌳 **Public Amenities & Parks**: Eco-parks, lake promenades, civic plazas, organic farmers markets.

---

## 🔗 API Reference

- `GET /api/road-tenders`: Query tenders with optional `?lat=X&lng=Y&radius=10`, `?category=...`, `?status=...`, and `?search=...`. When coordinates are provided, results are sorted nearest to farthest with computed distances.
- `GET /api/road-tenders/nearby?lat=X&lng=Y&radius=10&category=...`: Proximity search returning tenders covering the given GPS coordinates.
- `GET /api/road-tenders/[id]`: Retrieve single tender with matched report count and linked grievance documents.
- `GET /api/reports`: List citizen grievance reports with optional filters.
- `POST /api/reports`: Submit a new citizen grievance with photo and location coordinates.
- `GET /api/reports/nearby?lat=X&lng=Y&radius=5`: Retrieve nearby civic reports.
- `PATCH /api/reports/[id]/status`: Update report status (`Open` | `In Review` | `Resolved`) and admin remarks.
