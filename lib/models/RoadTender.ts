import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoadTender extends Document {
  tenderId: string;
  title: string;
  organisation: string;
  department: string;
  category: string;
  subCategory?: string;
  projectStage?: string;
  status: 'Live' | 'Closed' | 'Cancelled';
  publishedDate: string;
  closingDate: string;
  value: number;
  description: string;
  roadLocation: {
    lat: number;
    lng: number;
    radiusKm: number;
    locationName: string;
  };
  contractorName: string;
  contractorPhone: string;
  contractorEmail: string;
  defectLiabilityEndDate: string;
  responsibleOfficerName: string;
  responsibleOfficerPhone: string;
  responsibleOfficerEmail: string;
}

const RoadTenderSchema = new Schema<IRoadTender>(
  {
    tenderId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    organisation: { type: String, required: true },
    department: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, default: '' },
    projectStage: {
      type: String,
      default: 'Completed (In DLP)',
    },
    status: { type: String, enum: ['Live', 'Closed', 'Cancelled'], required: true },
    publishedDate: { type: String, required: true },
    closingDate: { type: String, required: true },
    value: { type: Number, required: true },
    description: { type: String, required: true },
    roadLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      radiusKm: { type: Number, required: true },
      locationName: { type: String, required: true },
    },
    contractorName: { type: String, required: true },
    contractorPhone: { type: String, required: true },
    contractorEmail: { type: String, required: true },
    defectLiabilityEndDate: { type: String, required: true },
    responsibleOfficerName: { type: String, required: true },
    responsibleOfficerPhone: { type: String, required: true },
    responsibleOfficerEmail: { type: String, required: true },
  },
  { timestamps: true }
);

const RoadTender: Model<IRoadTender> =
  mongoose.models.RoadTender || mongoose.model<IRoadTender>('RoadTender', RoadTenderSchema);

export default RoadTender;

