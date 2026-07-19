import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentRecord extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string; // Internal Order or Ticket ID
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  type: 'food_order' | 'ticket_booking';
  status: 'created' | 'successful' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRecordSchema = new Schema<IPaymentRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    type: { type: String, enum: ['food_order', 'ticket_booking'], required: true },
    status: {
      type: String,
      enum: ['created', 'successful', 'failed'],
      default: 'created',
    },
  },
  { timestamps: true },
);

PaymentRecordSchema.index({ userId: 1 });
PaymentRecordSchema.index({ razorpayOrderId: 1 }, { unique: true });

export const PaymentRecord = mongoose.model<IPaymentRecord>('PaymentRecord', PaymentRecordSchema);
