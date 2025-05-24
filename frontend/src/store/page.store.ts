import { defineStore } from 'pinia';
import { Page, PageState } from '@/store/models';
import { pageService } from './services/page.service';

export const usePageStore = defineStore('page', {
  state: (): PageState => ({
    pages: [],
    selectedPage: null,
    errorMessage: null,
    isLoading: false,
    formData: {
      title: '',
      content: '',
      slug: '',
      parentId: ''
    }
  }),

  getters: {
    getPageBySlug: (state) => (slug: string) => {
      return state.pages.find(page => page.slug === slug) || null;
    }
  },

  actions: {
    async fetchPages() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await pageService.fetchPages();
        this.pages = response.pages;
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch pages';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getPageById(id: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await pageService.getPageById(id);
        this.selectedPage = response;
        return response;
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
        const response = await pageService.getPageBySlug(slug);
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
        const response = await pageService.createPage(pageData);
        this.pages.push(response);
        return response;
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
        const response = await pageService.updatePage(id, pageData);
        const index = this.pages.findIndex(page => page._id === id);
        if (index !== -1) {
          this.pages[index] = response;
        }
        if (this.selectedPage?._id === id) {
          this.selectedPage = response;
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
        await pageService.deletePage(id);
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
        const response = await pageService.managePages(operations);
        this.pages = response.pages;
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to manage pages';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async publishPage(id: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await pageService.publishPage(id);
        const index = this.pages.findIndex(page => page._id === id);
        if (index !== -1) {
          this.pages[index] = response;
        }
        if (this.selectedPage?._id === id) {
          this.selectedPage = response;
        }
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to publish page';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async unpublishPage(id: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await pageService.unpublishPage(id);
        const index = this.pages.findIndex(page => page._id === id);
        if (index !== -1) {
          this.pages[index] = response;
        }
        if (this.selectedPage?._id === id) {
          this.selectedPage = response;
        }
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to unpublish page';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getPageVersions(id: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        return await pageService.getPageVersions(id);
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch page versions';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async restorePageVersion(id: string, versionId: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await pageService.restorePageVersion(id, versionId);
        const index = this.pages.findIndex(page => page._id === id);
        if (index !== -1) {
          this.pages[index] = response;
        }
        if (this.selectedPage?._id === id) {
          this.selectedPage = response;
        }
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to restore page version';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getPageDraft(id: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        return await pageService.getPageDraft(id);
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch page draft';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async savePageDraft(id: string, draftData: any) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await pageService.savePageDraft(id, draftData);
        const index = this.pages.findIndex(page => page._id === id);
        if (index !== -1) {
          this.pages[index] = response;
        }
        if (this.selectedPage?._id === id) {
          this.selectedPage = response;
        }
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to save page draft';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async deletePageDraft(id: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await pageService.deletePageDraft(id);
        const index = this.pages.findIndex(page => page._id === id);
        if (index !== -1) {
          this.pages[index] = response;
        }
        if (this.selectedPage?._id === id) {
          this.selectedPage = response;
        }
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to delete page draft';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async duplicatePage(id: string, newTitle: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await pageService.duplicatePage(id, newTitle);
        this.pages.push(response);
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to duplicate page';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async movePage(id: string, newParentId: string) {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        const response = await pageService.movePage(id, newParentId);
        const index = this.pages.findIndex(page => page._id === id);
        if (index !== -1) {
          this.pages[index] = response;
        }
        if (this.selectedPage?._id === id) {
          this.selectedPage = response;
        }
        return response;
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to move page';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getPageTree() {
      this.isLoading = true;
      this.errorMessage = null;
      try {
        return await pageService.getPageTree();
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to fetch page tree';
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
        title: '',
        content: '',
        slug: '',
        parentId: ''
      };
    },

    setSelectedPage(page: Page | null) {
      this.selectedPage = page;
    },

    clearError() {
      this.errorMessage = null;
    }
  }
}); 