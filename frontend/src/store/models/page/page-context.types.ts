import type { Page } from './page.types';
import type { PageElement } from './page-element.types';

export interface PageContext {
  pages: Page[];
  pageElements: PageElement[];
  selectedPage: Page | null;
  selectedPageElement: PageElement | null;
  errorMessage: string | null;
  isLoading: boolean;
  formData: {
    name: string;
    description: string;
    displayOrder: number;
    pageElements: PageElement[];
  };
  pageElementFormData: {
    name: string;
    description: string;
    isRoot: boolean;
    displayOrder: number;
  }
} 