import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { IRole } from './role.model.js';

// User document interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: mongoose.Types.ObjectId;  
  isVerified: boolean;
  twoFactorEnabled: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  accessToken?: string;
  accessTokenExpiry?: Date;
  refreshToken?: string;
  refreshTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateResetToken(): Promise<string>;
  generateVerificationToken(): Promise<string>;
  setTokens(accessToken: string, refreshToken: string): Promise<void>;
  clearTokens(): Promise<void>;
}

// Create User schema
const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: undefined,
    },
    verificationTokenExpiry: {
      type: Date,
      default: undefined,
    },
    resetToken: {
      type: String,
      default: undefined,
    },
    resetTokenExpiry: {
      type: Date,
      default: undefined,
    },
    accessToken: {
      type: String,
      default: undefined,
    },
    accessTokenExpiry: {
      type: Date,
      default: undefined,
    },
    refreshToken: {
      type: String,
      default: undefined,
    },
    refreshTokenExpiry: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Add indexes for frequently queried fields
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ accessToken: 1 });
UserSchema.index({ refreshToken: 1 });

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
UserSchema.methods.generateResetToken = async function (): Promise<string> {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetToken = resetToken;
  this.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
  return resetToken;
};

// Method to generate email verification token
UserSchema.methods.generateVerificationToken = async function (): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = token;
  this.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

// Method to set tokens
UserSchema.methods.setTokens = async function(accessToken: string, refreshToken: string): Promise<void> {
  this.accessToken = accessToken;
  this.accessTokenExpiry = new Date(Date.now() + 3600000); // 1 hour for access token
  this.refreshToken = refreshToken;
  this.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 3600000); // 7 days for refresh token
  await this.save();
};

// Method to clear tokens
UserSchema.methods.clearTokens = async function(): Promise<void> {
  this.accessToken = undefined;
  this.accessTokenExpiry = undefined;
  this.refreshToken = undefined;
  this.refreshTokenExpiry = undefined;
  await this.save();
};

// Create and export User model
export const User = mongoose.model<IUser>('User', UserSchema);