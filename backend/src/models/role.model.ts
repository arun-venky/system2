import mongoose, { Schema, Document } from 'mongoose';
import { IPageElement } from './page-element.model.js';


// Resource action interface
interface IResource {
  name: string;
  value: string;
}

// Resource action interface
interface IAction {
  resource: IResource;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// Role document interface
export interface IRole extends Document {
  name: string;
  description?: string;
  pageElements: IPageElement[];
  permissions: IAction[];
}

// Create Role schema
const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pageElements: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PageElement',
    },
    permissions: [
      {
        resource: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Resource',
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