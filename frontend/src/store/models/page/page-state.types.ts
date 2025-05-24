import type { Page } from './page.types';
import type { PageElement } from './page-element.types';

export interface PageState {
  pages: Page[];
  selectedPage: Page | null;
  selectedPageElement: PageElement | null;
  errorMessage: string | null;
  isLoading: boolean;
  formData: {
    name: string;
    displayOrder: number;
    pageElements: PageElement[];    
  };
  pageElementFormData: {
    name: string;
    description: string;
    isRoot: boolean;
    displayOrder: number;
  };
} 