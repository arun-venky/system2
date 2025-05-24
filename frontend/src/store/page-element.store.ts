import { defineStore } from 'pinia';
import type { PageElement } from '@/store/models/page/page-element.types';
import type { Page } from '@/store/models/page/page.types';
import api from '@/utils/api';

interface PageElementState {
  pageElements: PageElement[];
  selectedPageElement: PageElement | null;
  errorMessage: string | null;
  isLoading: boolean;
}

export const usePageElementStore = defineStore('pageElement', {
  state: (): PageElementState => ({
    pageElements: [],
    selectedPageElement: null,
    errorMessage: null,
    isLoading: false
  }),

  getters: {
    getPageElementById: (state) => (id: string) => {
      return state.pageElements.find(element => element._id === id) || null;
    }
  },

  actions: {
    async fetchPageElements() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        // First get all pages
        const pagesResponse = await api.get('/pages');
        const pages = pagesResponse.data.pages;
        
        // Then get elements for each page
        const elementsPromises = pages.map((page: Page) => 
          api.get(`/pages/${page._id}/elements`)
            .then(response => response.data.pageElements)
            .catch(() => []) // If a page has no elements, return empty array
        );
        
        const elementsArrays = await Promise.all(elementsPromises);
        this.pageElements = elementsArrays.flat();
        return { pageElements: this.pageElements };
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch page elements';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deletePageElement(id: string) {
      try {
        await api.delete(`/page-elements/${id}`);
        this.pageElements = this.pageElements.filter(element => element._id !== id);
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to delete page element';
        throw error;
      }
    },

    async createPageElement(element: PageElement) {
      try {
        const response = await api.post('/page-elements', element);
        this.pageElements.push(response.data.pageElement);
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to create page element';
        throw error;
      }
    },  

    async updatePageElement(id: string, element: PageElement) {
      try {
        const response = await api.put(`/page-elements/${id}`, element);
        const index = this.pageElements.findIndex(e => e._id === id);
        if (index !== -1) {
          this.pageElements[index] = response.data.pageElement;
        }
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to update page element';
        throw error;
      }
    },

    async bulkDeletePageElements(ids: string[]) {
      try {
        await api.delete('/page-elements/bulk', { data: { ids } });
        this.pageElements = this.pageElements.filter(element => !ids.includes(element._id));
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to bulk delete page elements'; 
        throw error;
      }
    },

    async savePageElement(element: PageElement) {
      try {
        const response = await api.post('/page-elements', element);
        this.pageElements.push(response.data.pageElement);
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to save page element'; 
        throw error;  
      }
    },

    setSelectedPageElement(element: PageElement | null) {
      this.selectedPageElement = element;
    },

    clearError() {
      this.errorMessage = null;
    }
  }
}); 