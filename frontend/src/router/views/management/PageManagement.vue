<template>
  <div class="management-view">
    <div class="management-container">
      <!-- Header -->
      <div class="management-header">
        <h1 class="management-title">Pages</h1>
        <div class="management-actions">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search pages..."
            class="form-input management-search"
          />
          <Button
            class="whitespace-nowrap"
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
            <component :is="renderIcon('ExclamationCircleIcon', 'h-5 w-5 text-red-400')" /> 
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
        <div class="flex relative">
          <!-- Page List Panel -->
          <div :class="[
            'transition-all duration-300 ease-in-out',
            isCurrentState('managingElements') ? 'w-[30%] pr-4' : 'w-full'
          ]">
            <div class="card-header" v-if="!isCurrentState('managingElements')" >
              <div class="management-list-header">
                <div class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    v-model="selectAll"
                    class="form-checkbox"
                    @change="toggleSelectAll"
                  />
                  <span class="text-sm text-gray-500">Select All</span>
                </div>
                <div class="management-list-actions">
                  <span class="text-sm text-gray-600">
                    {{ selectedPages?.length }} pages selected
                  </span>
                  <Button
                    variant="danger"
                    @click="bulkDelete"
                    :disabled="isCurrentState('deleting')"
                  >
                    Delete
                  </Button>
                </div>
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
                    <component :is="renderIcon('DocumentIcon', 'management-list-icon')" />
                    <div class="management-list-details"> 
                      <h2 class="management-list-title">{{ page.name }}</h2>
                      <p class="management-list-subtitle">
                        {{ page.pageElements?.length || 0 }} elements
                      </p>
                    </div>
                  </div>
                  <div class="management-list-actions" v-if="!isCurrentState('managingElements')">
                    <Button
                      variant="ghost"
                      @click="editPage(page)"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      @click="managePageElements(page)"
                    >
                      Manage
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

          <!-- Page Elements Panel -->
          <div 
            v-if="isCurrentState('managingElements')" 
            :class="[
              'w-[70%] pl-4 border-l border-gray-200 transition-all duration-300 ease-in-out',
              'transform translate-x-0'
            ]"
          >

            <div class="sticky top-0 bg-white z-10 pb-4">
              <div class="flex justify-between items-center mb-4">
                <div>
                  <h2 class="text-lg font-medium">{{ state.context.selectedPage?.name }} - Page Elements</h2>
                  <p class="text-sm text-gray-500">{{ state.context.selectedPage?.description }}</p>
                </div>
                <div class="flex space-x-2">
                  <Button
                    variant="primary"
                    @click="raiseEvent('ADD_ELEMENT')"
                    :disabled="isCurrentState('addingElement')"
                  >
                    Add Element
                  </Button>
                  <Button
                    variant="ghost"
                    @click="raiseEvent('CANCEL')"
                    class="flex items-center"
                  >
                    <component :is="renderIcon('XIcon', 'h-5 w-5 mr-1')" />
                    Close
                  </Button>
                </div>
              </div>
            </div>

            <div v-if="!state.context.selectedPage || state.context.selectedPage.pageElements.length === 0" class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <component :is="renderIcon('DocumentIcon', 'h-12 w-12 mx-auto text-gray-400 mb-2')" />
              <p>No elements assigned to this page</p>
              <Button
                variant="primary"
                class="mt-4"
                @click="raiseEvent('ADD_ELEMENT')"
              >
                Add First Element
              </Button>
            </div>

            <div v-else class="space-y-2">
              <!-- Grid Header -->
              <div class="grid grid-cols-[45px_2fr_3fr_45px] gap-4 px-3 py-2 bg-gray-100 rounded font-medium text-sm text-gray-600">
                <div class="flex items-center justify-center">⋮</div>
                <div>Name</div>
                <div>Description</div>
                <div class="flex items-center justify-center">⋮</div>
              </div>

              <draggable
                v-model="state.context.selectedPage.pageElements"
                item-key="_id"
                handle=".drag-handle"
                @end="handleDragEnd"
                class="space-y-2"
              >
                <template #item="{ element }">
                  <div class="grid grid-cols-[45px_2fr_3fr_45px] gap-4 items-center p-3 bg-white border border-gray-200 rounded-lg group hover:border-gray-300 transition-colors">
                    <div class="drag-handle cursor-move flex items-center justify-center text-gray-400 hover:text-gray-600">
                      <component :is="renderIcon('MenuIcon', 'h-5 w-5')" />
                    </div>
                    
                    <!-- Name Column -->
                    <div class="flex items-center">
                      <input
                        v-if="editingElement?._id === element._id"
                        type="text"
                        v-model="editingElement.name"
                        class="form-input w-full"
                        @blur="saveElementEdit"
                        @keyup.enter="saveElementEdit"
                        @keyup.esc="cancelElementEdit"
                        ref="nameInput"
                      />
                      <h4 v-else class="font-medium cursor-pointer hover:text-blue-600 truncate" @click="startElementEdit(element)">{{ element.name }}</h4>
                    </div>

                    <!-- Description Column -->
                    <div class="flex items-center">
                      <input
                        v-if="editingElement?._id === element._id"
                        type="text"
                        v-model="editingElement.description"
                        class="form-input w-full"
                        @blur="saveElementEdit"
                        @keyup.enter="saveElementEdit"
                        @keyup.esc="cancelElementEdit"
                        ref="nameInput"
                      />
                      <h4 v-else class="font-medium cursor-pointer hover:text-blue-600 truncate" @click="startElementEdit(element)">{{ element.description }}</h4>
                    </div>

                    <!-- Action Button -->
                    <div class="relative flex items-center justify-center">
                      <button
                        @click="toggleActionMenu(element._id)"
                        class="action-menu-trigger p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      
                      <!-- Action Menu Popover -->
                      <div
                        v-if="activeActionMenu === element._id"
                        class="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
                      >
                        <div class="py-1">
                          <button
                            v-if="editingElement?._id !== element._id"
                            @click="startElementEdit(element)"
                            class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            @click="deleteElement(element)"
                            class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Page Modal -->
      <Modal
        v-if="isCurrentState('creating') || isCurrentState('editing')"
        :title="isCurrentState('creating') ? 'Create Page' : 'Edit Page'"
        @close="raiseEvent('CANCEL')"
      >
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="form-label">Name</label>
            <input
              type="text"
              v-model="state.context.formData.name"
              class="form-input"
              :class="{ 'border-red-500': errors.name }"
              required
            />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </div>
          <div>
            <label class="form-label">Description</label>
            <textarea
              v-model="state.context.formData.description"
              class="form-input"
              :class="{ 'border-red-500': errors.description }"
              required
            />
            <p v-if="errors.description" class="text-red-500 text-sm mt-1">{{ errors.description }}</p>
          </div>
          <!-- <div>
            <label class="form-label">Display Order</label>
            <input
              type="number"
              v-model="state.context.formData.displayOrder"
              class="form-input"
              :class="{ 'border-red-500': errors.displayOrder }"
              required
            />
            <p v-if="errors.displayOrder" class="text-red-500 text-sm mt-1">{{ errors.displayOrder }}</p>
          </div> -->
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

      <!-- Add Page Element Modal -->
      <Modal
        v-if="isCurrentState('addingElement')"
        title="Add Page Element"
        @close="raiseEvent('CANCEL')"
      >
        <form @submit.prevent="handleAddElement" class="space-y-4">
          <div>
            <label class="form-label">Name</label>
            <input
              type="text"
              v-model="state.context.pageElementFormData.name"
              class="form-input"
              :class="{ 'border-red-500': elementErrors.name }"
              required
            />
            <p v-if="elementErrors.name" class="text-red-500 text-sm mt-1">{{ elementErrors.name }}</p>
          </div>
          <div>
            <label class="form-label">Description</label>
            <textarea
              v-model="state.context.pageElementFormData.description"
              class="form-input"
              :class="{ 'border-red-500': elementErrors.description }"
              required
            />
            <p v-if="elementErrors.description" class="text-red-500 text-sm mt-1">{{ elementErrors.description }}</p>
          </div>
          <!-- <div>
            <label class="form-label">Display Order</label>
            <input
              type="number"
              v-model="state.context.pageElementFormData.displayOrder"
              class="form-input"
              :class="{ 'border-red-500': elementErrors.displayOrder }"
              required
            />
            <p v-if="elementErrors.displayOrder" class="text-red-500 text-sm mt-1">{{ elementErrors.displayOrder }}</p>
          </div> -->
          <div>
            <label class="form-label">Is Root</label>
            <input
              type="checkbox"
              v-model="state.context.pageElementFormData.isRoot" 
              class="form-checkbox"
            />
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
              :disabled="!isElementFormValid"
            >
              Add Element
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, nextTick } from 'vue';
import Button from '../../../components/ui/button.vue';
import Modal from '../../../components/ui/modal.vue';
import Spinner from '../../../components/ui/spinner.vue';
import { usePageManagement } from '../../../composables/usePageManagement';
import { useIcon } from '@/composables/useIcon';
import draggable from 'vuedraggable';
import type { PageElement } from '@/store/models/page/page-element.types';
import { usePageStore } from '@/store/page.store';

const { renderIcon } = useIcon();
const pageStore = usePageStore();
const {
  state,  
  searchQuery,
  selectedPages,
  filteredPages,
  isCurrentState,
  raiseEvent,  
  editPage,
  deletePage,
  savePage,
  bulkDelete,
  managePageElements,  
  addElement,
  editElement,
  deleteElement,
  handleAddElement
} = usePageManagement();

// Form validation
const errors = ref({
  name: '',
  description: '',
  displayOrder: 0
});

const elementErrors = ref({
  name: '',
  description: '',
  displayOrder: 0
});

const validateForm = () => {
  errors.value = {
    name: '',
    description: '',
    displayOrder: 0
  };

  if (!state.value.context.formData.name?.trim()) {
    errors.value.name = 'Name is required';
  }

  if (!state.value.context.formData.description?.trim()) {
    errors.value.description = 'Description is required';
  }

  return !Object.values(errors.value).some(error => error);
};

const validateElementForm = () => {
  elementErrors.value = {
    name: '',
    description: '',
    displayOrder: 0
  };

  if (!state.value.context.pageElementFormData.name?.trim()) {
    elementErrors.value.name = 'Name is required';
  }

  if (!state.value.context.pageElementFormData.description?.trim()) {
    elementErrors.value.description = 'Description is required';
  }

  return !Object.values(elementErrors.value).some(error => error);
};

const isFormValid = computed(() => {
  return validateForm();
});

const isElementFormValid = computed(() => {
  return validateElementForm();
});

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await savePage();
  } catch (error) {
    console.error('Failed to save page:', error);
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

// Element editing
const editingElement = ref<PageElement | null>(null);
const nameInput = ref<HTMLInputElement | null>(null);

const startElementEdit = (element: PageElement) => {
  editingElement.value = { ...element };
  nextTick(() => {
    nameInput.value?.focus();
  });
};

const saveElementEdit = async () => {
  if (editingElement.value) {
    try {
      await pageStore.updatePageElement(editingElement.value._id, editingElement.value);
      raiseEvent('UPDATE_ELEMENT', { element: editingElement.value });
    } catch (error) {
      console.error('Failed to update element:', error);
    }
    editingElement.value = null;
  }
};

const cancelElementEdit = () => {
  editingElement.value = null;
};

const handleDragEnd = async () => {
  if (state.value.context.selectedPage) {
    try {
      const operations = state.value.context.selectedPage.pageElements.map((element, index) => ({
        id: element._id,
        displayOrder: index
      }));
      await pageStore.managePageElements(operations);
      raiseEvent('REORDER_ELEMENTS', { elements: state.value.context.selectedPage.pageElements });
    } catch (error) {
      console.error('Failed to reorder elements:', error);
    }
  }
};

// Replace context menu state with action menu state
const activeActionMenu = ref<string | null>(null);

// Replace context menu toggle with action menu toggle
const toggleActionMenu = (elementId: string) => {
  activeActionMenu.value = activeActionMenu.value === elementId ? null : elementId;
};

// Close action menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.action-menu-trigger')) {
      activeActionMenu.value = null;
    }
  });
});

// Fetch pages on mount
onMounted(() => {
  console.log('PageManagement component mounted');
  raiseEvent('FETCH');
});

// Add error state logging
watch(() => state.value.context.errorMessage, (newError) => {
  if (newError) {
    console.error('Page management error:', newError);
  }
});
</script> 