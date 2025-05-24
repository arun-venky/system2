import type { Page } from "./page.types";

export interface PageElement {
  _id: string;
  name: string;
  description: string;
  isRoot: boolean;
  displayOrder: number; 
  page: Page;
} 