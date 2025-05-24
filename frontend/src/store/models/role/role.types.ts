import type { PageElement } from '../page/page-element.types';
import type { Permission } from './permission.types';

export interface Role {
  _id: string;
  name: string;
  description?: string;
  pageElements: PageElement[];
  permissions: Permission[];
} 