<template>
  <div class="management-view">
    <div class="management-container">
      <!-- Header -->
      <div class="management-header">
        <h1 class="management-title">Page Management</h1>
        <div class="management-actions">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search pages..."
            class="form-input management-search"
          />
          <Button
            variant="primary"
            @click="raiseEvent('CREATE')"
            :disabled="isCurrentState('creating')"
          >
            Create Page
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isCurrentState('loading')" class="flex-center py-12">
        <Spinner size="lg" />
      </div>

      <!-- Error State -->
      <div v-else-if="isCurrentState('error')" class="bg-red-50 p-4 rounded-md mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <div class="mt-2 text-sm text-red-700">
              {{ state.context.errorMessage }}
            </div>
            <div class="mt-4">
              <Button variant="danger" @click="raiseEvent('RETRY')">Retry</Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Page List -->
      <div v-else class="management-content">
        <!-- Bulk Actions -->
        <div v-if="selectedPages.length > 0" class="bulk-actions mb-4">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              {{ selectedPages.length }} pages selected
            </span>
            <Button
              variant="danger"
              @click="bulkDelete"
              :disabled="isCurrentState('deleting')"
            >
              Delete Selected
            </Button>
            <Button
              variant="primary"
              @click="bulkPublish"
              :disabled="isCurrentState('loading')"
            >
              Publish Selected
            </Button>
            <Button
              variant="warning"
              @click="bulkUnpublish"
              :disabled="isCurrentState('loading')"
            >
              Unpublish Selected
            </Button>
          </div>
        </div>

        <ul class="management-list">
          <li v-for="page in filteredPages" :key="page._id" class="management-list-item">
            <div class="management-list-header">
              <div class="management-list-info">
                <input
                  type="checkbox"
                  :value="page._id"
                  v-model="selectedPages"
                  class="form-checkbox mr-4"
                />
                <DocumentIcon class="management-list-icon" />
                <div class="management-list-details">
                  <h2 class="management-list-title">{{ page.title }}</h2>
                  <p class="management-list-subtitle">{{ page.slug }}</p>
                  <div class="management-list-badges">
                    <Badge
                      :variant="page.isPublished ? 'success' : 'warning'"
                    >
                      {{ page.isPublished ? 'Published' : 'Draft' }}
                    </Badge>
                    <Badge
                      v-if="page.isPublic"
                      variant="info"
                    >
                      Public
                    </Badge>
                  </div>
                </div>
              </div>
              <div class="management-list-actions">
                <Button
                  variant="ghost"
                  @click="previewPage(page)"
                >
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  @click="editPage(page)"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  @click="deletePage(page)"
                >
                  Delete
                </Button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Create/Edit Page Modal -->
      <Modal
        v-if="isCurrentState('creating') || isCurrentState('editing')"
        :title="isCurrentState('creating') ? 'Create Page' : 'Edit Page'"
        @close="raiseEvent('CANCEL')"
      >
        <form @submit.prevent="savePage" class="space-y-4">
          <div>
            <label class="form-label">Title</label>
            <input
              type="text"
              v-model="state.context.formData.title"
              class="form-input"
              :class="{ 'border-red-500': errors.title }"
              required
            />
            <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
          </div>
          <div>
            <label class="form-label">Slug</label>
            <input
              type="text"
              v-model="state.context.formData.slug"
              class="form-input"
              :class="{ 'border-red-500': errors.slug }"
              required
            />
            <p v-if="errors.slug" class="text-red-500 text-sm mt-1">{{ errors.slug }}</p>
          </div>
          <div>
            <label class="form-label">Content</label>
            <textarea
              v-model="state.context.formData.content"
              class="form-input"
              :class="{ 'border-red-500': errors.content }"
              rows="6"
              required
            ></textarea>
            <p v-if="errors.content" class="text-red-500 text-sm mt-1">{{ errors.content }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="state.context.formData.isPublished"
              class="form-checkbox"
            />
            <label class="form-label">Published</label>
          </div>
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="state.context.formData.isPublic"
              class="form-checkbox"
            />
            <label class="form-label">Public Access</label>
          </div>
          <div class="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="ghost"
              @click="raiseEvent('CANCEL')"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              :disabled="!isFormValid"
            >
              {{ isCurrentState('creating') ? 'Create' : 'Save' }}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { DocumentIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import Button from '../../../components/ui/button.vue';
import Modal from '../../../components/ui/modal.vue';
import Spinner from '../../../components/ui/spinner.vue';
import Badge from '../../../components/ui/badge.vue';
import { usePageManagement } from '../../../composables/usePageManagement';

const {
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
} = usePageManagement();

// Form validation
const errors = ref({
  title: '',
  slug: '',
  content: ''
});

const validateForm = () => {
  errors.value = {
    title: '',
    slug: '',
    content: ''
  };

  if (!state.value.context.formData.title) {
    errors.value.title = 'Title is required';
  }

  if (!state.value.context.formData.slug) {
    errors.value.slug = 'Slug is required';
  } else {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(state.value.context.formData.slug)) {
      errors.value.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }
  }

  if (!state.value.context.formData.content) {
    errors.value.content = 'Content is required';
  }

  return !Object.values(errors.value).some(error => error);
};

const isFormValid = computed(() => {
  return validateForm();
});

// Bulk actions
const bulkDelete = async () => {
  if (!selectedPages.value.length) return;
  
  if (confirm(`Are you sure you want to delete ${selectedPages.value.length} pages?`)) {
    try {
      await pageStore.managePages(
        selectedPages.value.map(id => ({
          action: 'delete',
          id
        }))
      );
      selectedPages.value = [];
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to delete pages:', error);
    }
  }
};

const bulkPublish = async () => {
  if (!selectedPages.value.length) return;
  
  try {
    await pageStore.managePages(
      selectedPages.value.map(id => ({
        action: 'publish',
        id
      }))
    );
    selectedPages.value = [];
    raiseEvent('FETCH');
  } catch (error) {
    console.error('Failed to publish pages:', error);
  }
};

const bulkUnpublish = async () => {
  if (!selectedPages.value.length) return;
  
  try {
    await pageStore.managePages(
      selectedPages.value.map(id => ({
        action: 'unpublish',
        id
      }))
    );
    selectedPages.value = [];
    raiseEvent('FETCH');
  } catch (error) {
    console.error('Failed to unpublish pages:', error);
  }
};

// Computed
const selectAll = computed({
  get: () => selectedPages.value.length === filteredPages.value.length,
  set: (value) => {
    selectedPages.value = value ? filteredPages.value.map(page => page._id) : [];
  }
});

// Methods
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedPages.value = filteredPages.value.map(page => page._id);
  } else {
    selectedPages.value = [];
  }
};

// Fetch pages on mount
onMounted(() => {
  raiseEvent('FETCH');
});
</script> 