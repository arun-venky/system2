import { PageVersion } from './page-version.types';
import { PageDraft } from './page-draft.types';

export interface Page {
  _id: string;
  title: string;
  content: string;
  slug: string;
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: string;
  draft?: PageDraft;
  versions: PageVersion[];
  parentId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
} 