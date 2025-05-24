import mongoose, { Schema, Document } from 'mongoose';

// Menu item interface
export interface IMenuItem {
  _id: mongoose.Types.ObjectId;
  label: string;
  url: string;
  roles: string[];
  order: number;
}

// Menu document interface
export interface IMenu extends Document {
  name: string;
  items: IMenuItem[];
  createdAt: Date;
  updatedAt: Date;
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
    items: [
      {
        label: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
        },
        roles: [
          {
            type: String,
            required: true,
          },
        ],
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create and export Menu model
export const Menu = mongoose.model<IMenu>('Menu', MenuSchema);