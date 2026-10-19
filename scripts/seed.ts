import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import RoadTender from '../lib/models/RoadTender';
import PotholeReport from '../lib/models/PotholeReport';

// Try loading .env.local if MONGO_URI is not set
if (!process.env.MONGO_URI) {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...v] = trimmed.split('=');
        if (k && v.length) {
          process.env[k.trim()] = v.join('=').trim();
        }
      }
    }
  }
}

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roadwatch';

const sampleTenders = [
  // 🏢 Buildings & Construction
  {
    tenderId: 'CHN-BLD-2026-001',
    title: 'Construction of 100-Bed Maternal & Child Health Super Speciality Block',
    organisation: 'TN PWD & Health Dept',
    department: 'Buildings Division (South)',
    category: 'Buildings & Construction',
    subCategory: 'Hospital & Healthcare',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2024-03-10',
    closingDate: '2024-04-15',
    value: 385000000, // 38.5 Cr
    description: 'Construction of G+4 RCC framed hospital wing with neonatal ICU, surgical suites, central oxygen manifold, and modern diagnostic facilities at Tambaram Taluk Hospital.',
    roadLocation: {
      lat: 12.9249,
      lng: 80.1180,
      radiusKm: 4,
      locationName: 'Tambaram Taluk Hospital Complex, GST Road, Tambaram, Chennai',
    },
    contractorName: 'URC Construction Private Limited',
    contractorPhone: '+91 424 225 8961',
    contractorEmail: 'projects.health@urcc.in',
    defectLiabilityEndDate: '2027-08-31', // Active
    responsibleOfficerName: 'Er. R. Murugesan (Superintending Engineer, TN PWD Buildings)',
    responsibleOfficerPhone: '+91 94440 23150',
    responsibleOfficerEmail: 'se.bldgs.south@tn.gov.in',
  },
  {
    tenderId: 'CHN-BLD-2026-002',
    title: 'New Science & Innovation Academic Wing at GCC Higher Secondary School',
    organisation: 'Greater Chennai Corporation (GCC)',
    department: 'Education & Works Department',
    category: 'Buildings & Construction',
    subCategory: 'Educational Institution',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2024-06-01',
    closingDate: '2024-07-05',
    value: 142000000, // 14.2 Cr
    description: 'Modern G+3 composite school building with 24 digital classrooms, STEM labs, library, sanitation blocks, and rainwater harvesting structures.',
    roadLocation: {
      lat: 12.9752,
      lng: 80.2215,
      radiusKm: 3,
      locationName: 'Velachery Main Road, Near Vijayanagar Bus Terminus, Velachery, Chennai',
    },
    contractorName: 'B.R. Construction & Infra Tech',
    contractorPhone: '+91 44 2243 1890',
    contractorEmail: 'contact@brinfra.co.in',
    defectLiabilityEndDate: '2027-05-15', // Active
    responsibleOfficerName: 'Thiru K. Venkatesan (Executive Engineer, Zone 13 Adyar/Velachery)',
    responsibleOfficerPhone: '+91 94451 90013',
    responsibleOfficerEmail: 'eezone13@chennaicorporation.gov.in',
  },
  {
    tenderId: 'CHN-BLD-2026-003',
    title: 'Multi-Level Automated Car Parking & Commercial Plaza at Pondy Bazaar',
    organisation: 'Chennai Smart City Limited',
    department: 'Special Project Wing',
    category: 'Buildings & Construction',
    subCategory: 'Commercial & Civic Infrastructure',
    projectStage: 'Under Construction',
    status: 'Live',
    publishedDate: '2024-01-20',
    closingDate: '2024-03-01',
    value: 520000000, // 52 Cr
    description: 'Design and construction of 7-tier robotic automated parking facility for 600 cars and 1,000 two-wheelers with rooftop solar plant and pedestrian concourse.',
    roadLocation: {
      lat: 13.0418,
      lng: 80.2341,
      radiusKm: 2,
      locationName: 'Sir Thyagaraya Road (Pondy Bazaar), T. Nagar, Chennai',
    },
    contractorName: 'Marg Infrastructure & Civil Works',
    contractorPhone: '+91 44 2467 1100',
    contractorEmail: 'smartcity@marggroup.com',
    defectLiabilityEndDate: '2028-02-28',
    responsibleOfficerName: 'Dr. S. Rajendran, IAS (CEO, Chennai Smart City Ltd)',
    responsibleOfficerPhone: '+91 44 2538 4500',
    responsibleOfficerEmail: 'ceo@chennaismartcity.org',
  },
  {
    tenderId: 'CHN-BLD-2026-004',
    title: 'Construction of Sub-Registrar & Taluk Administrative Office Complex',
    organisation: 'Tamil Nadu PWD',
    department: 'Revenue & Public Works',
    category: 'Buildings & Construction',
    subCategory: 'Administrative Office',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2024-08-15',
    closingDate: '2024-09-20',
    value: 187000000, // 18.7 Cr
    description: 'Constructing integrated taluk administrative complex with centralized citizen service center, record vaults, disabled-friendly access, and solar backup.',
    roadLocation: {
      lat: 13.1143,
      lng: 80.1548,
      radiusKm: 3,
      locationName: 'CTH Road, Ambattur Industrial Estate Vicinity, Ambattur, Chennai',
    },
    contractorName: 'KCP Engineers Private Limited',
    contractorPhone: '+91 422 231 4545',
    contractorEmail: 'admin@kcpengineers.in',
    defectLiabilityEndDate: '2027-11-30',
    responsibleOfficerName: 'Er. N. Senthil Kumar (Executive Engineer, Ambattur PWD Division)',
    responsibleOfficerPhone: '+91 94441 55670',
    responsibleOfficerEmail: 'ee.ambattur@tn.gov.in',
  },
  {
    tenderId: 'CHN-BLD-2026-005',
    title: 'Avadi Municipal Multi-Sport Complex & Indoor Arena',
    organisation: 'Avadi City Municipal Corporation',
    department: 'Engineering & Community Infrastructure',
    category: 'Buildings & Construction',
    subCategory: 'Sports Infrastructure',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2024-04-12',
    closingDate: '2024-05-18',
    value: 235000000, // 23.5 Cr
    description: 'Indoor stadium with synthetic badminton courts, Olympic-size wrestling arena, spectator galleries, lighting systems, and gym facilities.',
    roadLocation: {
      lat: 13.1147,
      lng: 80.1017,
      radiusKm: 4,
      locationName: 'Near Avadi Railway Station & HVF Estate, Avadi, Chennai Suburb',
    },
    contractorName: 'Coromandel Engineering Company Ltd',
    contractorPhone: '+91 44 2530 1700',
    contractorEmail: 'contracts@coromandelengg.com',
    defectLiabilityEndDate: '2027-04-30',
    responsibleOfficerName: 'Thiru M. Balaji (City Engineer, Avadi Corporation)',
    responsibleOfficerPhone: '+91 94454 62100',
    responsibleOfficerEmail: 'cityengineer@avadimunicipalcorporation.com',
  },

  // 🛣️ Roads & Bridges
  {
    tenderId: 'CHN-RDS-2026-006',
    title: 'Grade Separator & Bi-directional Flyover at Medavakkam - Sholinganallur Junction',
    organisation: 'Tamil Nadu Highways Department',
    department: 'Metro Wing (Highways)',
    category: 'Roads & Bridges',
    subCategory: 'Flyover & Grade Separator',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2023-11-05',
    closingDate: '2023-12-15',
    value: 980000000, // 98 Cr
    description: '3-tier grade separator including 1.8 km flyover over Medavakkam junction, slip roads, LED lighting, storm drains, and pedestrian underpass.',
    roadLocation: {
      lat: 12.9194,
      lng: 80.1873,
      radiusKm: 5,
      locationName: 'Velachery-Tambaram Road & Medavakkam-Mambakkam Junction, Medavakkam, Chennai',
    },
    contractorName: 'Larsen & Toubro Ltd (L&T Heavy Civil Infra)',
    contractorPhone: '+91 44 2252 6000',
    contractorEmail: 'inframetro.chennai@larsentoubro.com',
    defectLiabilityEndDate: '2027-09-30', // Active
    responsibleOfficerName: 'Er. D. Sivakumar (Divisional Engineer, Metro Highways Chennai)',
    responsibleOfficerPhone: '+91 94440 45890',
    responsibleOfficerEmail: 'de.metro.chennai@tnhighways.gov.in',
  },
  {
    tenderId: 'CHN-RDS-2026-007',
    title: 'Widening to 6-Lanes and Pavement of Mount-Poonamallee Road at Porur',
    organisation: 'Tamil Nadu Highways Department',
    department: 'Construction & Maintenance',
    category: 'Roads & Bridges',
    subCategory: 'Arterial Road Widening',
    projectStage: 'Under Construction',
    status: 'Live',
    publishedDate: '2024-05-10',
    closingDate: '2024-06-20',
    value: 410000000, // 41 Cr
    description: 'Widening of Mount-Poonamallee corridor between Ramapuram, Porur Roundabout and Iyyappanthangal with utility duct laying, median greenery, and mastic asphalt surfacing.',
    roadLocation: {
      lat: 13.0382,
      lng: 80.1565,
      radiusKm: 4,
      locationName: 'Mount-Poonamallee Road, Porur Junction to Iyyappanthangal, Porur, Chennai',
    },
    contractorName: 'Ramalingam Construction Co. Pvt Ltd',
    contractorPhone: '+91 422 434 7777',
    contractorEmail: 'projects@rccpl.in',
    defectLiabilityEndDate: '2028-06-30',
    responsibleOfficerName: 'Er. V. Kannan (Assistant Divisional Engineer, Highways Porur)',
    responsibleOfficerPhone: '+91 98402 11980',
    responsibleOfficerEmail: 'ade.porur@tnhighways.gov.in',
  },
  {
    tenderId: 'CHN-RDS-2026-008',
    title: 'OMR Service Road Reconstruction, Concrete Paving & Bicycle Lanes',
    organisation: 'TNRDC (Tamil Nadu Road Development Company)',
    department: 'IT Corridor Project Wing',
    category: 'Roads & Bridges',
    subCategory: 'Urban IT Corridor',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2024-02-14',
    closingDate: '2024-03-25',
    value: 320000000, // 32 Cr
    description: 'Upgrading both east and west service lanes of Rajiv Gandhi Salai (OMR) from Perungudi to Sholinganallur with high-strength PQC concrete, covered pedestrian walkways, and LED lamps.',
    roadLocation: {
      lat: 12.8997,
      lng: 80.2270,
      radiusKm: 6,
      locationName: 'Rajiv Gandhi Salai (OMR), Sholinganallur to Navalur Toll, Chennai OMR Suburb',
    },
    contractorName: 'GVR Infra Projects Limited',
    contractorPhone: '+91 44 4293 8888',
    contractorEmail: 'omr.works@gvrinfra.in',
    defectLiabilityEndDate: '2027-03-31', // Active
    responsibleOfficerName: 'Shri G. Prakash (Project Manager, TNRDC OMR Cell)',
    responsibleOfficerPhone: '+91 94443 67120',
    responsibleOfficerEmail: 'pm.omr@tnrdc.com',
  },
  {
    tenderId: 'CHN-RDS-2026-009',
    title: 'Chromepet - Thoraipakkam 200 Feet Radial Road Resurfacing & Drainage',
    organisation: 'CMDA & Highways Dept',
    department: 'Special Corridor Wing',
    category: 'Roads & Bridges',
    subCategory: 'Radial Expressway',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2024-07-01',
    closingDate: '2024-08-10',
    value: 295000000, // 29.5 Cr
    description: 'Milling, dense bituminous macadam (DBM) resurfacing, median jersey barriers, and box culvert drainage along the 200ft Radial connecting GST and OMR.',
    roadLocation: {
      lat: 12.9516,
      lng: 80.1700,
      radiusKm: 5,
      locationName: '200 Feet Radial Road, Chromepet to Thoraipakkam Link, Pallavaram / Keelkattalai, Chennai',
    },
    contractorName: 'KNR Constructions Limited',
    contractorPhone: '+91 40 4026 8761',
    contractorEmail: 'chennai.radial@knrcl.com',
    defectLiabilityEndDate: '2027-02-15', // Expiring in ~115 days
    responsibleOfficerName: 'Er. P. Shanmugam (Executive Engineer, CMDA Roads)',
    responsibleOfficerPhone: '+91 94450 78231',
    responsibleOfficerEmail: 'ee.roads@cmda.gov.in',
  },
  {
    tenderId: 'CHN-RDS-2026-010',
    title: 'Poonamallee High Road (NH-48) Surface Renewal and Pedestrian Footpaths',
    organisation: 'NHAI / State PWD',
    department: 'National Highway Corridor',
    category: 'Roads & Bridges',
    subCategory: 'Highway Surface Renewal',
    projectStage: 'Completed (Expired)',
    status: 'Live',
    publishedDate: '2023-01-10',
    closingDate: '2023-02-20',
    value: 210000000, // 21 Cr
    description: 'Periodic surface renewal, microsurfacing, crash barriers, and bus shelter construction along Poonamallee bypass stretch.',
    roadLocation: {
      lat: 13.0487,
      lng: 80.0911,
      radiusKm: 6,
      locationName: 'Poonamallee High Road Bypass (NH-48), Poonamallee, Chennai Western Suburb',
    },
    contractorName: 'Madhucon Projects Ltd',
    contractorPhone: '+91 40 2355 6001',
    contractorEmail: 'nh48.chennai@madhucon.com',
    defectLiabilityEndDate: '2026-01-15', // Expired
    responsibleOfficerName: 'Shri R. Krishnaraj (Project Director, NHAI PIU Chennai)',
    responsibleOfficerPhone: '+91 44 2615 1111',
    responsibleOfficerEmail: 'pdchennai@nhai.org',
  },

  // 💧 Water Supply & Drainage
  {
    tenderId: 'CHN-WTR-2026-011',
    title: 'Kosasthalaiyar River Basin Integrated Stormwater Drain Network',
    organisation: 'Greater Chennai Corporation (GCC)',
    department: 'Storm Water Drains (SWD) Department',
    category: 'Water Supply & Drainage',
    subCategory: 'Stormwater Drainage & Flood Mitigation',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2023-09-15',
    closingDate: '2023-10-30',
    value: 740000000, // 74 Cr
    description: 'Construction of 28.5 km integrated RCC micro and macro stormwater drains, silt catch pits, and storm outfall structures across Kolathur and Retteri catchments.',
    roadLocation: {
      lat: 13.1250,
      lng: 80.2150,
      radiusKm: 5,
      locationName: 'Kolathur, Retteri Lake catchment and Ambattur Link, North Chennai',
    },
    contractorName: 'NCC Limited (Nagarjuna Construction)',
    contractorPhone: '+91 40 2326 8888',
    contractorEmail: 'swd.chennai@nccltd.in',
    defectLiabilityEndDate: '2027-10-31', // Active
    responsibleOfficerName: 'Er. S. Rajagopal (Chief Engineer, Storm Water Drains, GCC)',
    responsibleOfficerPhone: '+91 94451 90050',
    responsibleOfficerEmail: 'ce.swd@chennaicorporation.gov.in',
  },
  {
    tenderId: 'CHN-WTR-2026-012',
    title: 'Underground Sewerage Scheme (UGSS) & Sewage Pumping Station at Pallavaram & Chromepet',
    organisation: 'Chennai Metrowater (CMWSSB)',
    department: 'Sewerage Infrastructure Wing',
    category: 'Water Supply & Drainage',
    subCategory: 'Underground Sewerage & Pumping',
    projectStage: 'Under Construction',
    status: 'Live',
    publishedDate: '2024-03-01',
    closingDate: '2024-04-10',
    value: 480000000, // 48 Cr
    description: 'Laying 42 km DWC sewerage pipeline network, 1,200 manholes, house service connections, and construction of 15 MLD terminal sewage pumping station.',
    roadLocation: {
      lat: 12.9600,
      lng: 80.1462,
      radiusKm: 4,
      locationName: 'GST Road to Hasthinapuram corridor, Pallavaram & Chromepet, South Chennai Suburb',
    },
    contractorName: 'VA Tech Wabag & Larsen Joint Consortium',
    contractorPhone: '+91 44 6123 2323',
    contractorEmail: 'ugss.pallavaram@wabag.com',
    defectLiabilityEndDate: '2028-04-30',
    responsibleOfficerName: 'Thiru C. Sundaramoorthy (Area Engineer IX, CMWSSB)',
    responsibleOfficerPhone: '+91 94458 63009',
    responsibleOfficerEmail: 'area9@chennaimetrowater.in',
  },
  {
    tenderId: 'CHN-WTR-2026-013',
    title: '900mm Potable Water Transmission Line from Nemmeli Desalination Plant to Guindy & Velachery',
    organisation: 'Chennai Metrowater (CMWSSB)',
    department: 'Water Supply & Engineering',
    category: 'Water Supply & Drainage',
    subCategory: 'Desalination Water Trunk Main',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2023-12-10',
    closingDate: '2024-01-20',
    value: 610000000, // 61 Cr
    description: 'Mild steel pipeline laying with anti-corrosive wrapping, electromagnetic flow metering, and intermediate booster distribution reservoirs.',
    roadLocation: {
      lat: 13.0067,
      lng: 80.2025,
      radiusKm: 5,
      locationName: 'Guindy Industrial Estate & Velachery Road corridor, Guindy, Chennai',
    },
    contractorName: 'Tata Projects Limited',
    contractorPhone: '+91 22 6625 5600',
    contractorEmail: 'waterinfra@tataprojects.com',
    defectLiabilityEndDate: '2027-06-30', // Active
    responsibleOfficerName: 'Er. T. Sivaraman (Superintending Engineer, Water Supply CMWSSB)',
    responsibleOfficerPhone: '+91 94458 63002',
    responsibleOfficerEmail: 'se.water@chennaimetrowater.in',
  },
  {
    tenderId: 'CHN-WTR-2026-014',
    title: 'Porur Lake Surplussing Channel Widening, Bund Protection & Desilting',
    organisation: 'Water Resources Department (WRD Tamil Nadu)',
    department: 'Palar Basin Circle',
    category: 'Water Supply & Drainage',
    subCategory: 'Lake Restoration & Water Security',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2024-04-05',
    closingDate: '2024-05-12',
    value: 175000000, // 17.5 Cr
    description: 'Deepening lake foreshore, gabion wall protection along surplus channel leading to Adyar River, and installing automatic telemetry water level sensors.',
    roadLocation: {
      lat: 13.0320,
      lng: 80.1480,
      radiusKm: 3,
      locationName: 'Porur Lake & Surplus Channel, Porur, Western Chennai',
    },
    contractorName: 'Shri Balaji Infra Constructions',
    contractorPhone: '+91 44 2499 5500',
    contractorEmail: 'porurlake@balajiinfra.com',
    defectLiabilityEndDate: '2027-05-31',
    responsibleOfficerName: 'Er. K. Anand (Executive Engineer, WRD Lower Palar Basin)',
    responsibleOfficerPhone: '+91 94441 22800',
    responsibleOfficerEmail: 'ee.wrd.palar@tn.gov.in',
  },

  // 🚇 Metro & Transit
  {
    tenderId: 'CHN-MTR-2026-015',
    title: 'Chennai Metro Phase 2: Elevated Viaduct & Perungudi Station Construction (Corridor 3)',
    organisation: 'Chennai Metro Rail Limited (CMRL)',
    department: 'Viaduct & Station Construction Wing',
    category: 'Metro & Transit',
    subCategory: 'Elevated Rapid Transit',
    projectStage: 'Under Construction',
    status: 'Live',
    publishedDate: '2023-08-10',
    closingDate: '2023-09-30',
    value: 1240000000, // 124 Cr
    description: 'Construction of 4.2 km elevated double-line viaduct, pier bents, and elevated passenger stations at Perungudi and Thoraipakkam along OMR.',
    roadLocation: {
      lat: 12.9654,
      lng: 80.2461,
      radiusKm: 5,
      locationName: 'Old Mahabalipuram Road (OMR), Perungudi Metro Station Site, Chennai',
    },
    contractorName: 'Larsen & Toubro Ltd — Heavy Civil Infrastructure',
    contractorPhone: '+91 44 2252 8000',
    contractorEmail: 'cmrl.corridor3@larsentoubro.com',
    defectLiabilityEndDate: '2029-12-31',
    responsibleOfficerName: 'Thiru T. Archunan (Director Projects, CMRL)',
    responsibleOfficerPhone: '+91 44 2437 8000',
    responsibleOfficerEmail: 'director.projects@cmrl.in',
  },
  {
    tenderId: 'CHN-MTR-2026-016',
    title: 'Guindy Multi-Modal Transit Hub Modernization and Pedestrian Skywalk',
    organisation: 'CMDA & Metro Transport Corporation (MTC)',
    department: 'Urban Transport Wing',
    category: 'Metro & Transit',
    subCategory: 'Multi-Modal Hub',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2024-01-10',
    closingDate: '2024-02-15',
    value: 260000000, // 26 Cr
    description: 'Seamless integration between Guindy Suburban Railway, Metro Station, and MTC bus terminal with an air-conditioned elevated travellator and escalators.',
    roadLocation: {
      lat: 13.0070,
      lng: 80.2100,
      radiusKm: 2,
      locationName: 'Guindy Railway Station & Metro Interchange, GST Road, Guindy, Chennai',
    },
    contractorName: 'Afcons Infrastructure Limited',
    contractorPhone: '+91 22 6719 1000',
    contractorEmail: 'afcons.transit@afcons.com',
    defectLiabilityEndDate: '2027-07-31',
    responsibleOfficerName: 'Shri V. Raman (Chief Planner, Transport & Traffic, CMDA)',
    responsibleOfficerPhone: '+91 44 2841 4855',
    responsibleOfficerEmail: 'chiefplanner.transport@cmda.gov.in',
  },

  // 🌳 Public Amenities & Parks
  {
    tenderId: 'CHN-PRK-2026-017',
    title: 'Eco-Park & Wetland Bio-Diversity Walkway at Retteri Lake',
    organisation: 'Greater Chennai Corporation (GCC)',
    department: 'Parks & Environment Department',
    category: 'Public Amenities & Parks',
    subCategory: 'Eco-Park & Rejuvenation',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2024-03-20',
    closingDate: '2024-04-28',
    value: 125000000, // 12.5 Cr
    description: 'Development of 3.2 km illuminated lakeside boardwalk, butterfly conservatory, open gym, children recreational play arena, and solar illumination.',
    roadLocation: {
      lat: 13.1482,
      lng: 80.2050,
      radiusKm: 4,
      locationName: 'Retteri Lake Bund, 200 Feet Inner Ring Road, Kolathur / Madhavaram, Chennai Suburb',
    },
    contractorName: 'Greenfield Landscapes & Infrastructure',
    contractorPhone: '+91 44 2626 9911',
    contractorEmail: 'info@greenfieldparks.in',
    defectLiabilityEndDate: '2027-05-31',
    responsibleOfficerName: 'Dr. M. Sangeetha (Deputy Commissioner Works, GCC)',
    responsibleOfficerPhone: '+91 94451 90002',
    responsibleOfficerEmail: 'dcworks@chennaicorporation.gov.in',
  },
  {
    tenderId: 'CHN-PRK-2026-018',
    title: 'Modern Organic Farmers Market & Civic Plaza, Sholinganallur',
    organisation: 'Greater Chennai Corporation (GCC)',
    department: 'Commercial Markets Division',
    category: 'Public Amenities & Parks',
    subCategory: 'Civic Plaza & Community Market',
    projectStage: 'Completed (In DLP)',
    status: 'Live',
    publishedDate: '2024-05-02',
    closingDate: '2024-06-08',
    value: 98000000, // 9.8 Cr
    description: 'Constructing eco-friendly steel-roofed community market with cold storage rooms, electric vehicle charging stations, and zero-waste composting facility.',
    roadLocation: {
      lat: 12.9020,
      lng: 80.2290,
      radiusKm: 3,
      locationName: 'Sholinganallur Junction, Near ECR Link Road, Sholinganallur, Chennai',
    },
    contractorName: 'Prestige Civil Builders Pvt Ltd',
    contractorPhone: '+91 44 2827 7788',
    contractorEmail: 'civic@prestigecivil.com',
    defectLiabilityEndDate: '2027-06-15',
    responsibleOfficerName: 'Thiru R. Devanathan (Executive Engineer, Zone 15 Sholinganallur)',
    responsibleOfficerPhone: '+91 94451 90015',
    responsibleOfficerEmail: 'eezone15@chennaicorporation.gov.in',
  },
];

const sampleReports = [
  {
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    lat: 12.9754,
    lng: 80.2220,
    city: 'Chennai',
    locationAddress: 'Velachery Main Road, near GCC Higher Secondary School, Velachery, Chennai',
    description: 'Deep structural hair-line cracks noticed on the 2nd floor balcony wall of the newly inaugurated school building. Rainwater is seeping through the plastering.',
    severity: 'Medium' as const,
    dangerLevel: 'High' as const,
    matchedTenderId: 'CHN-BLD-2026-002',
    matchedTenderTitle: 'New Science & Innovation Academic Wing at GCC Higher Secondary School',
    contractorName: 'B.R. Construction & Infra Tech',
    responsibleOfficerName: 'Thiru K. Venkatesan (Executive Engineer, Zone 13)',
    status: 'In Review' as const,
    adminRemarks: 'Inspected by Assistant Executive Engineer on Oct 16. Structural plastering repair notice issued to contractor under DLP Clause 14.',
    reportedAt: new Date(Date.now() - 3 * 86400000),
  },
  {
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80',
    lat: 12.8990,
    lng: 80.2265,
    city: 'Chennai',
    locationAddress: 'OMR Service Road near Sholinganallur Junction, Chennai',
    description: 'Significant road subsidence and depression on the concrete service road edge. Two-wheelers losing balance during peak traffic hours.',
    severity: 'Large' as const,
    dangerLevel: 'Extreme' as const,
    matchedTenderId: 'CHN-RDS-2026-008',
    matchedTenderTitle: 'OMR Service Road Reconstruction, Concrete Paving & Bicycle Lanes',
    contractorName: 'GVR Infra Projects Limited',
    responsibleOfficerName: 'Shri G. Prakash (Project Manager, TNRDC)',
    status: 'Open' as const,
    reportedAt: new Date(Date.now() - 1 * 86400000),
  },
  {
    photoUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&q=80',
    lat: 12.9240,
    lng: 80.1175,
    city: 'Tambaram',
    locationAddress: 'Tambaram Taluk Hospital New Maternal Block Entrance, GST Road, Tambaram',
    description: 'Water ponding and broken pavement tiles right at the ramp entrance to the hospital wing. Dangerous for stretchers and elderly patients.',
    severity: 'Medium' as const,
    dangerLevel: 'Medium' as const,
    matchedTenderId: 'CHN-BLD-2026-001',
    matchedTenderTitle: 'Construction of 100-Bed Maternal & Child Health Super Speciality Block',
    contractorName: 'URC Construction Private Limited',
    responsibleOfficerName: 'Er. R. Murugesan (Superintending Engineer, TN PWD)',
    status: 'In Review' as const,
    adminRemarks: 'Contractor engineer notified; paving leveling scheduled this weekend.',
    reportedAt: new Date(Date.now() - 2 * 86400000),
  },
  {
    photoUrl: 'https://images.unsplash.com/photo-1584463699042-494b59523f66?w=800&q=80',
    lat: 13.1255,
    lng: 80.2145,
    city: 'Chennai',
    locationAddress: 'Kolathur Main Road storm drain culvert, Kolathur, Chennai',
    description: 'RCC drain cover slab shifted and cracked open. Children walk past this spot daily to reach school.',
    severity: 'Very Large' as const,
    dangerLevel: 'Extreme' as const,
    matchedTenderId: 'CHN-WTR-2026-011',
    matchedTenderTitle: 'Kosasthalaiyar River Basin Integrated Stormwater Drain Network',
    contractorName: 'NCC Limited (Nagarjuna Construction)',
    responsibleOfficerName: 'Er. S. Rajagopal (Chief Engineer, GCC)',
    status: 'Resolved' as const,
    adminRemarks: 'Heavy duty precast slab replaced on Oct 17. Site secured with barricades.',
    resolvedAt: new Date(Date.now() - 1 * 86400000),
    reportedAt: new Date(Date.now() - 5 * 86400000),
  },
  {
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&q=80',
    lat: 13.0380,
    lng: 80.1560,
    city: 'Porur',
    locationAddress: 'Mount-Poonamallee Road near Porur Roundabout, Chennai',
    description: 'Deep road trench left without flashing warning lights or warning signs near the road widening segment.',
    severity: 'Large' as const,
    dangerLevel: 'High' as const,
    matchedTenderId: 'CHN-RDS-2026-007',
    matchedTenderTitle: 'Widening to 6-Lanes and Pavement of Mount-Poonamallee Road at Porur',
    contractorName: 'Ramalingam Construction Co. Pvt Ltd',
    responsibleOfficerName: 'Er. V. Kannan (Assistant Divisional Engineer)',
    status: 'Open' as const,
    reportedAt: new Date(Date.now() - 8 * 3600000),
  },
];

async function seed() {
  console.log('Connecting to MongoDB:', MONGO_URI.replace(/:\/\/.*@/, '://<credentials>@'));
  await mongoose.connect(MONGO_URI);
  console.log('Connected successfully!');

  // Clear existing tenders and reports
  await RoadTender.deleteMany({});
  console.log('Cleared existing RoadTenders.');

  await PotholeReport.deleteMany({});
  console.log('Cleared existing PotholeReports.');

  // Insert sample tenders
  const insertedTenders = await RoadTender.insertMany(sampleTenders);
  console.log(`Inserted ${insertedTenders.length} Chennai & Suburbs Tenders across Buildings, Roads, Water, Metro & Parks.`);

  // Insert sample reports
  const insertedReports = await PotholeReport.insertMany(sampleReports);
  console.log(`Inserted ${insertedReports.length} sample grievance reports.`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
