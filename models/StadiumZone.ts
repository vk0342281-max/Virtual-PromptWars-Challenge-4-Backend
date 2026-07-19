import mongoose, { Document, Schema } from 'mongoose';

export type ZoneType =
  | 'gate'
  | 'seating'
  | 'food_court'
  | 'restroom'
  | 'medical'
  | 'emergency_exit'
  | 'parking'
  | 'command_center';

export type ZoneStatus = 'open' | 'crowded' | 'closed' | 'emergency';
export type DensityLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface IStadiumZone extends Document {
  zoneId: string;
  name: string;
  type: ZoneType;
  capacity: number;
  coordinates: { x: number; y: number; width: number; height: number };
  adjacentZones: string[];
  isAccessible: boolean;
  hasElevator: boolean;
  currentStatus: ZoneStatus;
  currentDensity: DensityLevel;
  currentCount: number;
  description?: string;
  level: number; // floor/level (0 = ground)
  createdAt: Date;
  updatedAt: Date;
}

const StadiumZoneSchema = new Schema<IStadiumZone>(
  {
    zoneId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Zone name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['gate', 'seating', 'food_court', 'restroom', 'medical', 'emergency_exit', 'parking', 'command_center'],
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: [0, 'Capacity cannot be negative'],
    },
    coordinates: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, required: true, default: 50 },
      height: { type: Number, required: true, default: 50 },
    },
    adjacentZones: {
      type: [String],
      default: [],
    },
    isAccessible: {
      type: Boolean,
      default: false,
    },
    hasElevator: {
      type: Boolean,
      default: false,
    },
    currentStatus: {
      type: String,
      enum: ['open', 'crowded', 'closed', 'emergency'],
      default: 'open',
    },
    currentDensity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      default: 'low',
    },
    currentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

StadiumZoneSchema.index({ zoneId: 1 }, { unique: true });
StadiumZoneSchema.index({ type: 1 });
StadiumZoneSchema.index({ currentStatus: 1 });
StadiumZoneSchema.index({ currentDensity: 1 });
StadiumZoneSchema.index({ isAccessible: 1 });

export const StadiumZone = mongoose.model<IStadiumZone>('StadiumZone', StadiumZoneSchema);
