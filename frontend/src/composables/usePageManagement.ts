import { ref, computed } from 'vue';
import { Page, PageVersion, PageDraft } from '@/store/models';
import { usePageStore } from '../store/page.store';
import { useMachine } from '@xstate/vue';
import { createPageMachine } from '../machines/pageMachine';

export function usePageManagement() {
  const pageStore = usePageStore();
  const { state, send } = useMachine(createPageMachine());
  const showVersionsModal = ref(false);
  const showDraftModal = ref(false);
  const selectedPage = ref<Page | null>(null);
  const selectedVersions = ref<PageVersion[]>([]);
  const currentDraft = ref<PageDraft | null>(null);
  const searchQuery = ref('');
  const selectedPages = ref<string[]>([]);

  const filteredPages = computed(() => {
    if (!searchQuery.value) return state.value.context.pages;
    const query = searchQuery.value.toLowerCase();
    return state.value.context.pages.filter((page: { title: string; slug: string; }) => 
      page.title.toLowerCase().includes(query) ||
      page.slug.toLowerCase().includes(query)
    );
  });

  const isCurrentState = (stateName: "error" | "idle" | "loading" | "creating" | "editing" | "deleting") => 
    state.value.matches(stateName);

  const raiseEvent = (event: string, data?: any) => {
    send({ type: event, ...data });
  };

  const openVersionsModal = async (page: Page) => {
    selectedPage.value = page;
    try {
      const versions = await pageStore.getPageVersions(page._id);
      selectedVersions.value = versions;
      showVersionsModal.value = true;
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    }
  };

  const openDraftModal = async (page: Page) => {
    selectedPage.value = page;
    try {
      const draft = await pageStore.getPageDraft(page._id);
      currentDraft.value = draft;
      showDraftModal.value = true;
    } catch (error) {
      console.error('Failed to fetch draft:', error);
    }
  };

  const saveDraft = async (content: string) => {
    if (!selectedPage.value) return;
    try {
      await pageStore.savePageDraft(selectedPage.value._id, content);
      showDraftModal.value = false;
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const deleteDraft = async () => {
    if (!selectedPage.value) return;
    try {
      await pageStore.deletePageDraft(selectedPage.value._id);
      showDraftModal.value = false;
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  };

  const restoreVersion = async (versionId: string) => {
    if (!selectedPage.value) return;
    try {
      await pageStore.restorePageVersion(selectedPage.value._id, versionId);
      showVersionsModal.value = false;
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const publishPage = async (page: Page) => {
    try {
      await pageStore.publishPage(page._id);
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to publish page:', error);
    }
  };

  const unpublishPage = async (page: Page) => {
    try {
      await pageStore.unpublishPage(page._id);
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to unpublish page:', error);
    }
  };

  const duplicatePage = async (page: Page) => {
    const newTitle = prompt('Enter new page title:', `${page.title} (Copy)`);
    if (!newTitle) return;
    try {
      await pageStore.duplicatePage(page._id, newTitle);
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to duplicate page:', error);
    }
  };

  const movePage = async (page: Page, newParentId: string | null) => {
    try {
      await pageStore.movePage(page._id, newParentId ?? '');
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to move page:', error);
    }
  };  

  const editPage = (page: Page) => {
    raiseEvent('EDIT', { id: page._id });
  };

  const deletePage = (page: Page) => {
    raiseEvent('DELETE', { id: page._id });
  };

  const confirmDelete = () => {
    raiseEvent('CONFIRM_DELETE');
  };

  const savePage = () => {
    raiseEvent('SAVE');
  };

  return {
    state,
    showVersionsModal,
    showDraftModal,
    selectedPage,
    selectedVersions,
    currentDraft,
    searchQuery,
    selectedPages,
    filteredPages,
    isCurrentState,
    raiseEvent,
    openVersionsModal,
    openDraftModal,
    saveDraft,
    deleteDraft,
    restoreVersion,
    publishPage,
    unpublishPage,
    duplicatePage,
    movePage,
    editPage,
    deletePage,
    confirmDelete,
    savePage
  };
}

