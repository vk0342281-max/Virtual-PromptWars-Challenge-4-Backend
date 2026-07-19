import mongoose, { Document, Schema } from 'mongoose';

export type TicketCategory = 'standard' | 'premium' | 'vip' | 'accessible';

export interface ITicket extends Document {
  ticketNumber: string;
  userId: mongoose.Types.ObjectId;
  matchId: string;
  matchName: string;
  stadiumName: string;
  seatBlock: string;
  seatRow: string;
  seatNumber: string;
  gateEntry: string;
  category: TicketCategory;
  isAccessible: boolean;
  isUsed: boolean;
  validFrom: Date;
  validUntil: Date;
  qrCodeData?: string;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketNumber: {
      type: String,
      required: [true, 'Ticket number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    matchId: {
      type: String,
      required: true,
      trim: true,
    },
    matchName: {
      type: String,
      required: true,
      trim: true,
    },
    stadiumName: {
      type: String,
      required: true,
      trim: true,
    },
    seatBlock: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    seatRow: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    gateEntry: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['standard', 'premium', 'vip', 'accessible'],
      default: 'standard',
    },
    isAccessible: {
      type: Boolean,
      default: false,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    qrCodeData: {
      type: String,
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true },
);

TicketSchema.index({ ticketNumber: 1 }, { unique: true });
TicketSchema.index({ userId: 1 });
TicketSchema.index({ matchId: 1 });
TicketSchema.index({ isUsed: 1 });

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
