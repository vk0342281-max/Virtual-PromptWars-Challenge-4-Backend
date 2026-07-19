import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodItem {
  name: string;
  price: number;
  quantity: number;
}

export interface IFoodOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IFoodItem[];
  subtotal: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  pickupCounter: string;
  estimatedReadyTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FoodItemSchema = new Schema<IFoodItem>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const FoodOrderSchema = new Schema<IFoodOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [FoodItemSchema], required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentId: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    pickupCounter: {
      type: String,
      default: () => `Counter ${Math.floor(Math.random() * 8) + 1}`,
    },
    estimatedReadyTime: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 mins from now
    },
  },
  { timestamps: true },
);

FoodOrderSchema.index({ userId: 1 });
FoodOrderSchema.index({ status: 1 });

export const FoodOrder = mongoose.model<IFoodOrder>('FoodOrder', FoodOrderSchema);
