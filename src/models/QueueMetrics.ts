import mongoose, { Document, Schema } from 'mongoose';

export interface IQueueMetrics extends Document {
  zoneId: mongoose.Types.ObjectId;
  zoneCode: string;
  timestamp: Date;
  queueLength: number;
  estimatedWaitMinutes: number;
  throughputPerMinute: number;
  servicePoints: number; // Number of active checkpoints/counters
  isBottleneck: boolean;
  source: 'simulation' | 'sensor' | 'manual';
}

const QueueMetricsSchema = new Schema<IQueueMetrics>(
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
    queueLength: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedWaitMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    throughputPerMinute: {
      type: Number,
      required: true,
      min: 0,
    },
    servicePoints: {
      type: Number,
      default: 1,
      min: 1,
    },
    isBottleneck: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['simulation', 'sensor', 'manual'],
      default: 'simulation',
    },
  },
  { timestamps: false },
);

// TTL: auto-delete after 7 days
QueueMetricsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });
QueueMetricsSchema.index({ zoneId: 1, timestamp: -1 });
QueueMetricsSchema.index({ isBottleneck: 1 });
QueueMetricsSchema.index({ estimatedWaitMinutes: -1 });

export const QueueMetrics = mongoose.model<IQueueMetrics>('QueueMetrics', QueueMetricsSchema);
