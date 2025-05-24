import mongoose, { Schema, Document } from 'mongoose';

// Audit log document interface
export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
}

// Create Audit Log schema
const AuditLogSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'create', 'read', 'update', 'delete',
      'login', 'logout', 'signup',
      'publish', 'unpublish', 'manage',
      'update_item', 'delete_item', 'add_item', 'remove_item',
      'verify_email', 'reset_password', 'change_password',
      'update_profile', 'resend_verification'
    ],
  },
  resource: {
    type: String,
    required: true,
    enum: ['users', 'pages', 'menus', 'roles', 'security', 'auth'],
  },
  details: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    required: false,
  }
});

// Create and export AuditLog model
export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);