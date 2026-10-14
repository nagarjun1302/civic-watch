import mongoose from 'mongoose';
import RoadTender from '../lib/models/RoadTender';
import PotholeReport from '../lib/models/PotholeReport';

const MONGO_URI = process.env.MONGO_URI;

const sampleTenders = [
  {
    tenderId: 'TND-2026-001',
    title: 'Resurfacing of Outer Ring Road — Hebbal to Silk Board',
    organisation: 'BBMP',
    department: 'Roads & Infrastructure',
    category: 'Road',
    status: 'Live',
    publishedDate: '2025-01-15',
    closingDate: '2025-02-15',
    value: 450000000, // 45 Cr
    description: 'Comprehensive milling, resurfacing, and lane marking of Outer Ring Road stretch between Hebbal Flyover and Central Silk Board junction.',
    roadLocation: {
      lat: 12.9254,
      lng: 77.6844,
      radiusKm: 18,
      locationName: 'Outer Ring Road, Hebbal to Silk Board, Bengaluru',
    },
    contractorName: 'Larsen & Toubro Infrastructure Ltd',
    contractorPhone: '+91 80 2852 0100',
    contractorEmail: 'contact.infra@larsentoubro.com',
    defectLiabilityEndDate: '2027-03-31', // Active
    responsibleOfficerName: 'Er. Ramesh Kumar (Executive Engineer, BBMP)',
    responsibleOfficerPhone: '+91 94806 85201',
    responsibleOfficerEmail: 'ee.infra.bbmp@karnataka.gov.in',
  },
  {
    tenderId: 'TND-2026-002',
    title: 'NH-48 Pothole Repair and Maintenance — Tumkur Road Section',
    organisation: 'NHAI',
    department: 'National Highways Authority of India',
    category: 'Highway',
    status: 'Live',
    publishedDate: '2025-04-10',
    closingDate: '2025-05-10',
    value: 280000000, // 28 Cr
    description: 'Periodic surface renewal, pothole repair, micro-surfacing, and drain desilting from Peenya to Nelamangala toll plaza.',
    roadLocation: {
      lat: 13.0528,
      lng: 77.4932,
      radiusKm: 15,
      locationName: 'NH-48 Tumkur Road Section, Bengaluru',
    },
    contractorName: 'Dilip Buildcon Limited',
    contractorPhone: '+91 755 402 9999',
    contractorEmail: 'roads.south@dilipbuildcon.com',
    defectLiabilityEndDate: '2027-06-30', // Active
    responsibleOfficerName: 'Shri S. K. Verma (Project Director, NHAI)',
    responsibleOfficerPhone: '+91 98450 12345',
    responsibleOfficerEmail: 'pd.bengaluru@nhai.org',
  },
  {
    tenderId: 'TND-2026-003',
    title: 'BDA Road Widening and Asphalting — Whitefield to Marathahalli',
    organisation: 'BDA',
    department: 'Bangalore Development Authority',
    category: 'Road',
    status: 'Closed',
    publishedDate: '2023-08-01',
    closingDate: '2023-09-01',
    value: 165000000, // 16.5 Cr
    description: '4-lane widening and dense bituminous macadam overlay between Hope Farm and Marathahalli Bridge.',
    roadLocation: {
      lat: 12.9591,
      lng: 77.7129,
      radiusKm: 8,
      locationName: 'Whitefield Main Road to Marathahalli, Bengaluru',
    },
    contractorName: 'NCC Urban Infrastructure Ltd',
    contractorPhone: '+91 80 4119 1000',
    contractorEmail: 'enquiry@nccurban.com',
    // Expiring in ~15 days relative to current time 2026-10-14
    defectLiabilityEndDate: '2026-10-29',
    responsibleOfficerName: 'Er. Manjunath Reddy (AEE, BDA)',
    responsibleOfficerPhone: '+91 94484 98765',
    responsibleOfficerEmail: 'aee.east@bdabangalore.org',
  },
  {
    tenderId: 'TND-2026-004',
    title: 'BBMP Ward Road Repair — Koramangala Zone B',
    organisation: 'BBMP',
    department: 'South Zone Civil Works',
    category: 'Road',
    status: 'Closed',
    publishedDate: '2022-03-12',
    closingDate: '2022-04-12',
    value: 62000000, // 6.2 Cr
    description: 'Internal ward road resurfacing, paver block installation, and drain cover repairs across Koramangala 4th, 5th, and 6th Blocks.',
    roadLocation: {
      lat: 12.9345,
      lng: 77.6266,
      radiusKm: 4,
      locationName: 'Koramangala Ward 151, Bengaluru',
    },
    contractorName: 'Star Constro Enterprises',
    contractorPhone: '+91 80 2553 4422',
    contractorEmail: 'starconstro@gmail.com',
    defectLiabilityEndDate: '2024-05-15', // Expired
    responsibleOfficerName: 'Er. Lakshmi Narayana (AE, BBMP Ward 151)',
    responsibleOfficerPhone: '+91 94806 83151',
    responsibleOfficerEmail: 'ae.ward151@bbmp.gov.in',
  },
  {
    tenderId: 'TND-2026-005',
    title: 'Pune–Mumbai Expressway Maintenance Contract',
    organisation: 'MSRDC',
    department: 'Maharashtra State Road Development Corporation',
    category: 'Highway',
    status: 'Live',
    publishedDate: '2024-11-01',
    closingDate: '2024-12-01',
    value: 950000000, // 95 Cr
    description: 'Comprehensive routine maintenance, high-friction surface treatment, and bridge expansion joints between Khandala and Khalapur.',
    roadLocation: {
      lat: 18.7562,
      lng: 73.3768,
      radiusKm: 25,
      locationName: 'Pune–Mumbai Expressway, Lonavala Ghat Section',
    },
    contractorName: 'IRB Infrastructure Developers Ltd',
    contractorPhone: '+91 22 6733 6400',
    contractorEmail: 'operations@irb.co.in',
    defectLiabilityEndDate: '2028-01-31', // Active
    responsibleOfficerName: 'Shri Rahul Patil (Superintending Engineer, MSRDC)',
    responsibleOfficerPhone: '+91 98220 54321',
    responsibleOfficerEmail: 'se.expressway@msrdc.in',
  },
  {
    tenderId: 'TND-2026-006',
    title: 'SH-43 Repair — Banjara Hills to Jubilee Hills',
    organisation: 'GHMC',
    department: 'Greater Hyderabad Municipal Corporation',
    category: 'Road',
    status: 'Live',
    publishedDate: '2025-02-18',
    closingDate: '2025-03-20',
    value: 120000000, // 12 Cr
    description: 'Road milling, Bituminous Concrete (BC) overlay, storm water grating adjustment along Road No. 1 & Road No. 36.',
    roadLocation: {
      lat: 17.4325,
      lng: 78.4071,
      radiusKm: 6,
      locationName: 'Road No. 36, Jubilee Hills, Hyderabad',
    },
    contractorName: 'KMV Projects Pvt Ltd',
    contractorPhone: '+91 40 2330 8989',
    contractorEmail: 'kmvhyderabad@kmvgroup.com',
    defectLiabilityEndDate: '2027-04-15', // Active
    responsibleOfficerName: 'Er. Venkat Rao (Executive Engineer, GHMC Circle 18)',
    responsibleOfficerPhone: '+91 99899 30456',
    responsibleOfficerEmail: 'ee.circle18@ghmc.gov.in',
  },
  {
    tenderId: 'TND-2026-007',
    title: 'NH-16 Pothole Rectification — Visakhapatnam Urban Section',
    organisation: 'NHAI',
    department: 'PIU Visakhapatnam',
    category: 'Highway',
    status: 'Live',
    publishedDate: '2025-03-05',
    closingDate: '2025-04-05',
    value: 180000000, // 18 Cr
    description: 'Emergency patch works, mastic asphalt application, and shoulder improvement between Maddilapalem and Gajuwaka.',
    roadLocation: {
      lat: 17.7231,
      lng: 83.2842,
      radiusKm: 12,
      locationName: 'NH-16 Maddilapalem to Gajuwaka, Visakhapatnam',
    },
    contractorName: 'KNR Constructions Limited',
    contractorPhone: '+91 40 4026 8761',
    contractorEmail: 'info@knrcl.com',
    defectLiabilityEndDate: '2027-09-30', // Active
    responsibleOfficerName: 'Shri P. C. Das (Project Director, NHAI Vizag)',
    responsibleOfficerPhone: '+91 94401 56789',
    responsibleOfficerEmail: 'pd.vizag@nhai.org',
  },
  {
    tenderId: 'TND-2026-008',
    title: 'Anna Salai Resurfacing — Guindy to Adyar',
    organisation: 'Greater Chennai Corporation',
    department: 'Bus Route Roads Department',
    category: 'Road',
    status: 'Closed',
    publishedDate: '2023-11-20',
    closingDate: '2023-12-20',
    value: 145000000, // 14.5 Cr
    description: 'Cold milling of worn asphalt and laying of Stone Matrix Asphalt (SMA) with thermoplastic lane delineation.',
    roadLocation: {
      lat: 13.0067,
      lng: 80.2206,
      radiusKm: 7,
      locationName: 'Anna Salai, Guindy to Adyar Junction, Chennai',
    },
    contractorName: 'Bhartia Infra Projects Ltd',
    contractorPhone: '+91 44 2434 1122',
    contractorEmail: 'chennai.ops@bhartiainfra.com',
    // Expiring in ~30 days relative to current time 2026-10-14
    defectLiabilityEndDate: '2026-11-13',
    responsibleOfficerName: 'Er. S. Thiagarajan (Superintending Engineer, GCC)',
    responsibleOfficerPhone: '+91 94451 90050',
    responsibleOfficerEmail: 'se.brr@chennaicorporation.gov.in',
  },
  {
    tenderId: 'TND-2026-009',
    title: 'Dwarka Expressway Surface Maintenance',
    organisation: 'NHAI',
    department: 'Delhi-NCR Highway Division',
    category: 'Highway',
    status: 'Closed',
    publishedDate: '2021-06-10',
    closingDate: '2021-07-10',
    value: 520000000, // 52 Cr
    description: 'Flyover approach slab leveling, bituminous wear layer, and drainage maintenance along Sector 109 to Bajghera.',
    roadLocation: {
      lat: 28.5244,
      lng: 77.0322,
      radiusKm: 14,
      locationName: 'Dwarka Expressway, Sector 109, Delhi-NCR',
    },
    contractorName: 'Shapoorji Pallonji Infrastructure',
    contractorPhone: '+91 11 4160 5500',
    contractorEmail: 'delhi.infra@shapoorji.com',
    defectLiabilityEndDate: '2024-08-31', // Expired
    responsibleOfficerName: 'Shri Anil Chawla (General Manager, NHAI Tech)',
    responsibleOfficerPhone: '+91 98110 33445',
    responsibleOfficerEmail: 'gm.delhi@nhai.org',
  },
  {
    tenderId: 'TND-2026-010',
    title: 'Eastern Express Highway Repair — Vikhroli to Thane',
    organisation: 'MSRDC',
    department: 'Mumbai Urban Transport Project',
    category: 'Highway',
    status: 'Live',
    publishedDate: '2025-05-02',
    closingDate: '2025-06-02',
    value: 380000000, // 38 Cr
    description: 'Asphalt resurfacing, expansion joint replacement, and central median safety railing upgradation.',
    roadLocation: {
      lat: 19.1418,
      lng: 72.9312,
      radiusKm: 12,
      locationName: 'Eastern Express Highway, Vikhroli to Thane Toll, Mumbai',
    },
    contractorName: 'J. Kumar Infraprojects Ltd',
    contractorPhone: '+91 22 6774 3555',
    contractorEmail: 'info@jkumar.com',
    defectLiabilityEndDate: '2027-11-30', // Active
    responsibleOfficerName: 'Shri M. D. Shinde (Chief Engineer, MSRDC Mumbai)',
    responsibleOfficerPhone: '+91 98200 99887',
    responsibleOfficerEmail: 'ce.mumbai@msrdc.in',
  },
];

const sampleReports = [
  {
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    lat: 12.9265,
    lng: 77.6852,
    locationAddress: 'Near Ecospace Bellandur, Outer Ring Road, Bengaluru, Karnataka 560103',
    description: 'Massive crater on the center lane right after the flyover descent. Causes heavy two-wheeler skidding during peak hours.',
    severity: 'Large',
    dangerLevel: 'High',
    matchedTenderId: 'TND-2026-001',
    matchedTenderTitle: 'Resurfacing of Outer Ring Road — Hebbal to Silk Board',
    contractorName: 'Larsen & Toubro Infrastructure Ltd',
    responsibleOfficerName: 'Er. Ramesh Kumar (Executive Engineer, BBMP)',
    status: 'Open',
    reportedAt: new Date('2026-10-10T09:30:00Z'),
  },
  {
    photoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    lat: 13.0489,
    lng: 77.4981,
    locationAddress: 'Opposite Jindal Naturecure, Tumkur Road NH-48, Bengaluru, Karnataka 560073',
    description: 'Cluster of deep potholes on the service road connecting to main highway. Several auto-rickshaws have overturned.',
    severity: 'Very Large',
    dangerLevel: 'Extreme',
    matchedTenderId: 'TND-2026-002',
    matchedTenderTitle: 'NH-48 Pothole Repair and Maintenance — Tumkur Road Section',
    contractorName: 'Dilip Buildcon Limited',
    responsibleOfficerName: 'Shri S. K. Verma (Project Director, NHAI)',
    status: 'In Review',
    reportedAt: new Date('2026-10-11T14:15:00Z'),
  },
  {
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    lat: 12.9568,
    lng: 77.7145,
    locationAddress: 'Near Spice Garden Bus Stop, Marathahalli Main Road, Bengaluru, Karnataka 560037',
    description: 'Asphalt peeling off after recent rains, exposing loose stones and creating sharp edge potholes.',
    severity: 'Medium',
    dangerLevel: 'Medium',
    matchedTenderId: 'TND-2026-003',
    matchedTenderTitle: 'BDA Road Widening and Asphalting — Whitefield to Marathahalli',
    contractorName: 'NCC Urban Infrastructure Ltd',
    responsibleOfficerName: 'Er. Manjunath Reddy (AEE, BDA)',
    status: 'Open',
    reportedAt: new Date('2026-10-12T11:45:00Z'),
  },
  {
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    lat: 17.4341,
    lng: 78.4095,
    locationAddress: 'Near Peddamma Temple Metro Station, Jubilee Hills Rd 36, Hyderabad, Telangana 500033',
    description: 'Depression near manhole causing sudden bump for fast moving cars.',
    severity: 'Small',
    dangerLevel: 'Low',
    matchedTenderId: 'TND-2026-006',
    matchedTenderTitle: 'SH-43 Repair — Banjara Hills to Jubilee Hills',
    contractorName: 'KMV Projects Pvt Ltd',
    responsibleOfficerName: 'Er. Venkat Rao (Executive Engineer, GHMC Circle 18)',
    status: 'Resolved',
    reportedAt: new Date('2026-10-08T16:00:00Z'),
  },
  {
    photoUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    lat: 19.1452,
    lng: 72.9335,
    locationAddress: 'Eastern Express Highway near Godrej Colony Flyover, Vikhroli East, Mumbai, Maharashtra 400079',
    description: 'Long longitudinal rutting and pothole row in the leftmost lane. Danger for two wheelers during night hours.',
    severity: 'Large',
    dangerLevel: 'High',
    matchedTenderId: 'TND-2026-010',
    matchedTenderTitle: 'Eastern Express Highway Repair — Vikhroli to Thane',
    contractorName: 'J. Kumar Infraprojects Ltd',
    responsibleOfficerName: 'Shri M. D. Shinde (Chief Engineer, MSRDC Mumbai)',
    status: 'Open',
    reportedAt: new Date('2026-10-13T08:20:00Z'),
  },
];

async function seed() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected successfully!');

  console.log('Clearing existing RoadTender and PotholeReport data...');
  await RoadTender.deleteMany({});
  await PotholeReport.deleteMany({});

  console.log(`Inserting ${sampleTenders.length} realistic road tenders...`);
  await RoadTender.insertMany(sampleTenders);

  console.log(`Inserting ${sampleReports.length} sample pothole reports...`);
  await PotholeReport.insertMany(sampleReports);

  console.log('✅ Seed completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
