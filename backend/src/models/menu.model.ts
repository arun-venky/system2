import mongoose, { Schema, Document } from 'mongoose';
import { IPageElement } from './page-element.model.js';

// Menu document interface
export interface IMenu extends Document {
  name: string;
  label: string;
  icon: string;  
  slug: string;  
  displayOrder: number;
  parent: mongoose.Types.ObjectId;
  pageElement: mongoose.Types.ObjectId;
}

// Create Menu schema
const MenuSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    displayOrder: {
      type: Number,
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: false,
    },
    pageElement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PageElement',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export Menu model
export const Menu = mongoose.model<IMenu>('Menu', MenuSchema);