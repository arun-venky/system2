import { Page } from './page.types';

export interface PageContext {
  pages: Page[];
  selectedPage: Page | null;
  errorMessage: string | null;
  isLoading: boolean;
  formData: {
    title: string;
    content: string;
    slug: string;
    parentId: string;
  };
} 