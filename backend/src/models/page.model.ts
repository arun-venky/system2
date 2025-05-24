import mongoose, { Schema, Document } from 'mongoose';

// Page document interface
export interface IPage extends Document {
  name: string;
  description?: string;
  displayOrder: number;
}

// Create Page schema
const PageSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    displayOrder: {
      type: Number,
      required: true,
    },   
  },
  {
    timestamps: true,
  }
);

PageSchema.virtual('pageElements', {
  ref: 'PageElement',
  localField: '_id',
  foreignField: 'page',
});

PageSchema.set('toObject', { virtuals: true });
PageSchema.set('toJSON', { virtuals: true });

// Create and export Page model
export const Page = mongoose.model<IPage>('Page', PageSchema);