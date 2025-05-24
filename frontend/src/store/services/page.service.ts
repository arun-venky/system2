import api from '../../utils/api';
import { Page } from '@/store/models';

export const pageService = {
  async fetchPages() {
    const response = await api.get('/pages');
    return response.data;
  },

  async getPageById(id: string) {
    const response = await api.get(`/pages/${id}`);
    return response.data;
  },

  async getPageBySlug(slug: string) {
    const response = await api.get(`/pages/slug/${slug}`);
    return response.data;
  },

  async createPage(pageData: Partial<Page>) {
    const response = await api.post('/pages', pageData);
    return response.data;
  },

  async updatePage(id: string, pageData: Partial<Page>) {
    const response = await api.put(`/pages/${id}`, pageData);
    return response.data;
  },

  async deletePage(id: string) {
    const response = await api.delete(`/pages/${id}`);
    return response.data;
  },

  async managePages(operations: any[]) {
    const response = await api.post('/pages/manage', { operations });
    return response.data;
  },

  async publishPage(id: string) {
    const response = await api.post(`/pages/${id}/publish`);
    return response.data;
  },

  async unpublishPage(id: string) {
    const response = await api.post(`/pages/${id}/unpublish`);
    return response.data;
  },

  async getPageVersions(id: string) {
    const response = await api.get(`/pages/${id}/versions`);
    return response.data;
  },

  async restorePageVersion(id: string, versionId: string) {
    const response = await api.post(`/pages/${id}/versions/${versionId}/restore`);
    return response.data;
  },

  async getPageDraft(id: string) {
    const response = await api.get(`/pages/${id}/draft`);
    return response.data;
  },

  async savePageDraft(id: string, draftData: any) {
    const response = await api.post(`/pages/${id}/draft`, draftData);
    return response.data;
  },

  async deletePageDraft(id: string) {
    const response = await api.delete(`/pages/${id}/draft`);
    return response.data;
  },

  async duplicatePage(id: string, newTitle: string) {
    const response = await api.post(`/pages/${id}/duplicate`, { title: newTitle });
    return response.data;
  },

  async movePage(id: string, newParentId: string) {
    const response = await api.put(`/pages/${id}/move`, { parentId: newParentId });
    return response.data;
  },

  async getPageTree() {
    const response = await api.get('/pages/tree');
    return response.data;
  }
}; 