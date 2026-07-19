import mongoose, { Document, Schema } from 'mongoose';

export type AlertType = 'congestion' | 'medical' | 'security' | 'route_closed' | 'evacuation' | 'weather' | 'info';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface IAlert extends Document {
  alertId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  location: string;
  affectedZones: string[];
  recommendedAction: string;
  isActive: boolean;
  targetRoles: Array<'fan' | 'organizer' | 'security' | 'medical' | 'all'>;
  sourceIncidentId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  timestamp: Date;
  expiresAt?: Date;
  acknowledgedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['congestion', 'medical', 'security', 'route_closed', 'evacuation', 'weather', 'info'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    affectedZones: {
      type: [String],
      default: [],
    },
    recommendedAction: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    targetRoles: {
      type: [String],
      enum: ['fan', 'organizer', 'security', 'medical', 'all'],
      default: ['all'],
    },
    sourceIncidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
    acknowledgedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  { timestamps: true },
);

AlertSchema.pre('save', function (next) {
  if (this.isNew && !this.alertId) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.alertId = `ALT-${ts}-${rand}`;
  }
  next();
});

AlertSchema.index({ isActive: 1, timestamp: -1 });
AlertSchema.index({ severity: 1 });
AlertSchema.index({ type: 1 });
AlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-expire by expiresAt

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
