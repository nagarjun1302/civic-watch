import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPotholeReport extends Document {
  photoUrl: string;
  lat?: number | null;
  lng?: number | null;
  city?: string;
  locationAddress: string;
  description: string;
  severity: 'Small' | 'Medium' | 'Large' | 'Very Large';
  dangerLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  matchedTenderId: string | null;
  matchedTenderTitle: string;
  contractorName: string;
  responsibleOfficerName: string;
  status: 'Open' | 'In Review' | 'Resolved';
  reportedAt: Date;
}

const PotholeReportSchema = new Schema<IPotholeReport>(
  {
    photoUrl: { type: String, required: true },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    city: { type: String, default: '' },
    locationAddress: { type: String, required: true },
    description: { type: String, default: '' },
    severity: {
      type: String,
      enum: ['Small', 'Medium', 'Large', 'Very Large'],
      required: true,
    },
    dangerLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Extreme'],
      required: true,
    },
    matchedTenderId: { type: String, default: null },
    matchedTenderTitle: { type: String, default: '' },
    contractorName: { type: String, default: '' },
    responsibleOfficerName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Open', 'In Review', 'Resolved'],
      default: 'Open',
    },
    reportedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PotholeReport: Model<IPotholeReport> =
  mongoose.models.PotholeReport ||
  mongoose.model<IPotholeReport>('PotholeReport', PotholeReportSchema);

export default PotholeReport;
