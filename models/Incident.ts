import mongoose, { Document, Schema } from 'mongoose';

export type IncidentType = 'medical' | 'missing_child' | 'fire' | 'security' | 'crowd_surge' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'responding' | 'resolved' | 'closed';

export interface IIncident extends Document {
  incidentId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  location: {
    zoneId: string;
    zoneName: string;
    coordinates?: { x: number; y: number };
    description: string;
  };
  reportedBy: mongoose.Types.ObjectId;
  status: IncidentStatus;
  assignedTeam?: string;
  assignedResponders: mongoose.Types.ObjectId[];
  aiResponsePlan?: string;
  estimatedResponseMinutes?: number;
  affectedPeople?: number;
  timestamp: Date;
  respondedAt?: Date;
  resolvedAt?: Date;
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema = new Schema<IIncident>(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['medical', 'missing_child', 'fire', 'security', 'crowd_surge', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      zoneId: { type: String, required: true },
      zoneName: { type: String, required: true },
      coordinates: {
        x: Number,
        y: Number,
      },
      description: { type: String, default: '' },
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['reported', 'responding', 'resolved', 'closed'],
      default: 'reported',
    },
    assignedTeam: {
      type: String,
      trim: true,
    },
    assignedResponders: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    aiResponsePlan: {
      type: String,
    },
    estimatedResponseMinutes: {
      type: Number,
      min: 0,
    },
    affectedPeople: {
      type: Number,
      min: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    respondedAt: Date,
    resolvedAt: Date,
    notes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

IncidentSchema.index({ timestamp: -1 });
IncidentSchema.index({ status: 1 });
IncidentSchema.index({ severity: 1 });
IncidentSchema.index({ type: 1 });
IncidentSchema.index({ 'location.zoneId': 1 });

/**
 * Auto-generate incidentId before saving
 */
IncidentSchema.pre('save', function (next) {
  if (this.isNew && !this.incidentId) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.incidentId = `INC-${ts}-${rand}`;
  }
  next();
});

export const Incident = mongoose.model<IIncident>('Incident', IncidentSchema);
