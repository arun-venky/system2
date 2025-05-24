import mongoose, { Schema, Document } from 'mongoose';
import { IPage } from './page.model.js';

// PageElement document interface
export interface IPageElement extends Document {
  name: string;
  description: string; 
  isRoot: boolean;
  displayOrder: number; 
  page: mongoose.Types.ObjectId;
}

// Create PageElement schema
const PageElementSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isRoot: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      required: true,
    },
    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export PageElement model
export const PageElement = mongoose.model<IPageElement>('PageElement', PageElementSchema);