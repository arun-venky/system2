import { defineStore } from 'pinia';
import type { Page, PageState } from '@/store/models';
import type { PageElement } from './models/page/page-element.types';
import api from '@/utils/api';

export const usePageStore = defineStore('page', {
  state: (): PageState => ({
    pages: [],
    selectedPage: null,
    selectedPageElement: null,
    errorMessage: null,
    isLoading: false,
    formData: {
      name: '',
      displayOrder: 0,
      pageElements: []
    },
    pageElementFormData: {
      name: '',
      description: '',
      isRoot: true,
      displayOrder: 0
    }
  }),

  getters: {
    getPageById: (state) => (id: string) => {
      return state.pages.find(page => page._id === id) || null;
    }
  },

  actions: {
    async fetchPages() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const apiResponse = await api.get('/pages');
        const response = apiResponse.data;
        this.pages = response.pages;
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch pages';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchPageById(id: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const apiResponse = await api.get(`/pages/${id}`);
        const page =  apiResponse.data;
        this.selectedPage = page;
        return page;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch page';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchPageBySlug(slug: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const apiResponse = await api.get(`/pages/slug/${slug}`);
        const response = apiResponse.data;
        this.selectedPage = response;
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch page';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async createPage(pageData: Partial<Page>) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.post('/pages', pageData);
        const page = response.data;
        this.pages.push(page);
        return page;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to create page';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async updatePage(id: string, pageData: Partial<Page>) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.put(`/pages/${id}`, pageData);
        const page = response.data;
        const index = this.pages.findIndex(page => page._id === id);
        if (index !== -1) {
          this.pages[index] = page;
        }
        if (this.selectedPage?._id === id) {
          this.selectedPage = page;
        }
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to update page';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async deletePage(id: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        await api.delete(`/pages/${id}`);
        this.pages = this.pages.filter(page => page._id !== id);
        if (this.selectedPage?._id === id) {
          this.selectedPage = null;
        }
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to delete page';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async managePages(operations: any[]) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.post('/pages/manage', { operations });
        const pages = response.data;
        this.pages = pages;
        return pages;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to manage pages';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    setFormData(data: Partial<Page>) {
      this.formData = {
        ...this.formData,
        ...data
      };
    },

    clearFormData() {
      this.formData = {
        name: '',
        displayOrder: 0,
        pageElements: []
      };
    },

    setSelectedPage(page: Page | null) {
      this.selectedPage = page;
    },

    clearError() {
      this.errorMessage = null;
    },

    setPageElementFormData(data: Partial<PageElement>) {
      this.pageElementFormData = {
        ...this.pageElementFormData,
        ...data
      };
    },

    clearPageElementFormData() {
      this.pageElementFormData = {
        name: '',
        description: '',
        isRoot: true,
        displayOrder: 0
      };
    },

    async fetchPageElements(pageId: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.get(`/pages/${pageId}/elements`);
        return response.data;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch page elements';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createPageElement(pageElementData: Partial<PageElement>) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.post(`/pages/${pageElementData.page?._id}/elements`, pageElementData);
        const pageElement = response.data;  
        this.selectedPage?.pageElements.push(pageElement);
        return pageElement;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to create page element';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updatePageElement(id: string, pageElementData: Partial<PageElement>) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.put(`/pages/${pageElementData.page?._id}/elements/${id}`, pageElementData);
        const pageElement = response.data;
        if (this.selectedPage) {
          const index = this.selectedPage.pageElements.findIndex(element => element._id === id);
          if (index !== -1) {
            this.selectedPage.pageElements[index] = pageElement;
          }
        }
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to update page element';
        throw error;
      } finally { 
        this.isLoading = false;
      }
    },

    async deletePageElement(id: string) {
      this.isLoading = true;
      this.errorMessage = null;     
      try {
        await api.delete(`/pages/${this.selectedPage?._id}/elements/${id}`);
        if (this.selectedPage) {
          this.selectedPage.pageElements = this.selectedPage.pageElements.filter(element => element._id !== id);
        }
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to delete page element';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async managePageElements(operations: any[]) { 
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await api.post(`/pages/${this.selectedPage?._id}/elements/manage`, { operations });
        const pageElements = response.data;
        if (this.selectedPage) {
          this.selectedPage.pageElements = pageElements;
        }
        return pageElements;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to manage page elements';
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
}); 