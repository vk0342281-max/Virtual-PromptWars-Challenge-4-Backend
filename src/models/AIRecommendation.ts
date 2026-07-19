import mongoose, { Document, Schema } from 'mongoose';

export type RecommendationCategory = 'crowd' | 'security' | 'medical' | 'operations' | 'routing';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RecommendationStatus = 'pending' | 'acknowledged' | 'implemented' | 'dismissed';

export interface IAIRecommendation extends Document {
  category: RecommendationCategory;
  priority: RecommendationPriority;
  recommendation: string;
  reasoning: string;
  affectedZones: string[];
  triggerData: {
    crowdLevels?: Record<string, number>;
    incidents?: string[];
    queueLengths?: Record<string, number>;
    timestamp: Date;
  };
  status: RecommendationStatus;
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  implementedAt?: Date;
  dismissedReason?: string;
  confidenceScore: number; // 0-100 AI confidence
  aiModel: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIRecommendationSchema = new Schema<IAIRecommendation>(
  {
    category: {
      type: String,
      enum: ['crowd', 'security', 'medical', 'operations', 'routing'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      required: true,
    },
    recommendation: {
      type: String,
      required: true,
      trim: true,
    },
    reasoning: {
      type: String,
      required: true,
      trim: true,
    },
    affectedZones: {
      type: [String],
      default: [],
    },
    triggerData: {
      crowdLevels: { type: Map, of: Number },
      incidents: [String],
      queueLengths: { type: Map, of: Number },
      timestamp: { type: Date, default: Date.now },
    },
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'implemented', 'dismissed'],
      default: 'pending',
    },
    acknowledgedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedAt: Date,
    implementedAt: Date,
    dismissedReason: String,
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 80,
    },
    aiModel: {
      type: String,
      default: 'llama-3.3-70b-versatile',
    },
  },
  { timestamps: true },
);

// TTL: auto-delete recommendations older than 24 hours if still pending
AIRecommendationSchema.index({ createdAt: 1 });
AIRecommendationSchema.index({ status: 1 });
AIRecommendationSchema.index({ priority: 1, status: 1 });
AIRecommendationSchema.index({ category: 1 });

export const AIRecommendation = mongoose.model<IAIRecommendation>(
  'AIRecommendation',
  AIRecommendationSchema,
);
