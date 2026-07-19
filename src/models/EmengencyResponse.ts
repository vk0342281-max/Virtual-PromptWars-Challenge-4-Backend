import mongoose, { Document, Schema } from 'mongoose';

export type ResponseStatus = 'dispatched' | 'en_route' | 'on_scene' | 'resolved' | 'cancelled';

export interface IEmergencyResponse extends Document {
  incidentId: mongoose.Types.ObjectId;
  responderId: mongoose.Types.ObjectId;
  teamName: string;
  teamType: 'medical' | 'security' | 'fire' | 'evacuation';
  status: ResponseStatus;
  dispatchedAt: Date;
  arrivedAt?: Date;
  resolvedAt?: Date;
  recommendedRoute: string;
  estimatedArrivalMinutes: number;
  actualArrivalMinutes?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyResponseSchema = new Schema<IEmergencyResponse>(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      required: true,
    },
    responderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    teamType: {
      type: String,
      enum: ['medical', 'security', 'fire', 'evacuation'],
      required: true,
    },
    status: {
      type: String,
      enum: ['dispatched', 'en_route', 'on_scene', 'resolved', 'cancelled'],
      default: 'dispatched',
    },
    dispatchedAt: {
      type: Date,
      default: Date.now,
    },
    arrivedAt: Date,
    resolvedAt: Date,
    recommendedRoute: {
      type: String,
      required: true,
    },
    estimatedArrivalMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    actualArrivalMinutes: {
      type: Number,
      min: 0,
    },
    notes: String,
  },
  { timestamps: true },
);

EmergencyResponseSchema.index({ incidentId: 1 });
EmergencyResponseSchema.index({ status: 1 });
EmergencyResponseSchema.index({ teamType: 1 });
EmergencyResponseSchema.index({ dispatchedAt: -1 });

export const EmergencyResponse = mongoose.model<IEmergencyResponse>(
  'EmergencyResponse',
  EmergencyResponseSchema,
);
