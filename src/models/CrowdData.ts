import mongoose, { Document, Schema } from 'mongoose';

export type DensityLevel = 'low' | 'moderate' | 'high' | 'critical';
export type Trend = 'increasing' | 'stable' | 'decreasing';

export interface ICrowdData extends Document {
  zoneId: mongoose.Types.ObjectId;
  zoneCode: string;
  timestamp: Date;
  currentCount: number;
  capacityPercent: number;
  densityLevel: DensityLevel;
  trend: Trend;
  predictedCount15Min?: number;
  congestionScore: number; // 0-100
  source: 'simulation' | 'sensor' | 'manual';
}

const CrowdDataSchema = new Schema<ICrowdData>(
  {
    zoneId: {
      type: Schema.Types.ObjectId,
      ref: 'StadiumZone',
      required: true,
    },
    zoneCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    currentCount: {
      type: Number,
      required: true,
      min: 0,
    },
    capacityPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    densityLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      required: true,
    },
    trend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing'],
      default: 'stable',
    },
    predictedCount15Min: {
      type: Number,
      min: 0,
    },
    congestionScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    source: {
      type: String,
      enum: ['simulation', 'sensor', 'manual'],
      default: 'simulation',
    },
  },
  {
    timestamps: false, // uses custom timestamp field
  },
);

// TTL: auto-delete crowd data older than 7 days
CrowdDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });
CrowdDataSchema.index({ zoneId: 1, timestamp: -1 });
CrowdDataSchema.index({ densityLevel: 1 });
CrowdDataSchema.index({ congestionScore: -1 });

export const CrowdData = mongoose.model<ICrowdData>('CrowdData', CrowdDataSchema);
