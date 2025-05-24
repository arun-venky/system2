import mongoose, { Schema, Document } from 'mongoose';

// Page permission interface
export interface IPagePermission {
  role: mongoose.Types.ObjectId;
  actions: ('read' | 'update' | 'delete' | 'publish')[];
}

// Page version interface
export interface IPageVersion {
  _id?: mongoose.Types.ObjectId;
  content: string;
  publishedAt: Date;
  publishedBy: mongoose.Types.ObjectId;
  restoredAt?: Date;
  restoredBy?: mongoose.Types.ObjectId;
}

// Page document interface
export interface IPage extends Document {
  title: string;
  content: string;
  slug: string;
  permissions: IPagePermission[];
  roles?: mongoose.Types.ObjectId[];
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: mongoose.Types.ObjectId;
  unpublishedAt?: Date;
  unpublishedBy?: mongoose.Types.ObjectId;
  draft?: string;
  draftLastSaved?: Date;
  draftSavedBy?: mongoose.Types.ObjectId;
  versions: IPageVersion[];
  parentId?: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create Page schema
const PageSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    permissions: [
      {
        role: {
          type: Schema.Types.ObjectId,
          ref: 'Role',
          required: true,
        },
        actions: {
          type: [
            {
              type: String,
              enum: ['read', 'update', 'delete', 'publish'],
            },
          ],
          required: true,
        },
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    unpublishedAt: {
      type: Date,
    },
    unpublishedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    draft: {
      type: String,
    },
    draftLastSaved: {
      type: Date,
    },
    draftSavedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    versions: [
      {
        content: {
          type: String,
          required: true,
        },
        publishedAt: {
          type: Date,
          required: true,
        },
        publishedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        restoredAt: {
          type: Date,
        },
        restoredBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Page',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from title
PageSchema.pre('validate', function (next) {
  if (this.isModified('title') && !this.isModified('slug')) {
    // Type assertion to handle the 'unknown' type error
    this.slug = (this.title as string)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Create and export Page model
export const Page = mongoose.model<IPage>('Page', PageSchema);