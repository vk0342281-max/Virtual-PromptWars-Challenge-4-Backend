import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'fan' | 'organizer' | 'security' | 'medical';
export type PreferredLanguage = 'en' | 'es' | 'fr' | 'ar' | 'hi';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  preferredLanguage: PreferredLanguage;
  ticketNumber?: string;
  googleId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['fan', 'organizer', 'security', 'medical'],
        message: 'Role must be one of: fan, organizer, security, medical',
      },
      default: 'fan',
    },
    preferredLanguage: {
      type: String,
      enum: {
        values: ['en', 'es', 'fr', 'ar', 'hi'],
        message: 'Language must be one of: en, es, fr, ar, hi',
      },
      default: 'en',
    },
    ticketNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    googleId: {
      type: String,
      sparse: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).__v;
        delete (ret as any).password;
        delete (ret as any).googleId;
        return ret;
      },
    },
  },
);

// Indexes for efficient lookups
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
