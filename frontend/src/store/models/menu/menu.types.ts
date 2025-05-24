import type { PageElement } from '../page/page-element.types';

export interface Menu {
  _id: string;
  name: string;
  label: string;
  icon: string;
  slug: string;
  displayOrder: number;
  parent?: Menu;
  pageElement?: PageElement;
  createdAt: string;
  updatedAt: string;
}

export interface MenuFormData {
  _id?: string;
  name: string;
  label: string;
  icon: string;
  slug: string;
  displayOrder: number;
  parent?: string;
  pageElement?: string;
}

export interface MenuResponse {
  menus: Menu[];
  roles: string[];
  message?: string;
} 