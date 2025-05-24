import mongoose, { Schema, Document } from 'mongoose';

// Resource action interface
interface IAction {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// Role document interface
export interface IRole extends Document {
  name: string;
  permissions: IAction[];
  createdAt: Date;
  updatedAt: Date;
}

// Create Role schema
const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['Admin', 'Editor', 'Viewer'],
      trim: true,
    },
    permissions: [
      {
        resource: {
          type: String,
          required: true,
          enum: ['users', 'pages', 'menus', 'roles', 'security'],
        },
        actions: {
          type: [
            {
              type: String,
              enum: ['create', 'read', 'update', 'delete'],
            },
          ],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create and export Role model
export const Role = mongoose.model<IRole>('Role', RoleSchema);