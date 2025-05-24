import type { PageElement } from "./page-element.types";

export interface Page {
  selectedPageElement: any;
  _id: string;
  name: string;
  description?: string;
  displayOrder: number;
  pageElements: PageElement[];
}