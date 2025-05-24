<template>
  <div class="management-view">
    <div class="management-container">
      <!-- Header -->
      <div class="management-header">
        <h1 class="management-title">Menus</h1>
        <div class="management-actions">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search menus..."
            class="form-input management-search"
          />
          <Button
            class="whitespace-nowrap"
            variant="primary"
            @click="raiseEvent('CREATE')"
            :disabled="isCurrentState('creating')"
          >
            Create Menu
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

      <!-- Menu List -->
      <div v-else class="management-content">
        <div class="card-header">
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
                {{ selectedMenus.length }} menus selected
              </span>
              <Button
                variant="danger"
                @click="raiseEvent('BULK_DELETE')"
                :disabled="!selectedMenus.length"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        <draggable
          v-model="rootMenus"
          @end="onDragEnd"
          item-key="_id"
          handle=".drag-handle"
          :animation="150"
          ghost-class="ghost"
        >
          <template #item="{ element: menu }">
            <div class="menu-item">
              <div class="menu-item-header">
                <input
                  type="checkbox"
                  :value="menu._id"
                  :checked="selectedMenus.includes(menu._id)"
                  v-model="selectedMenus"
                  class="form-checkbox mr-4"
                />
                <div class="drag-handle">
                  <component :is="renderIcon('Bars3Icon', 'h-5 w-5 text-gray-400')" />
                </div>                
                <component :is="renderIcon(menu.icon, 'h-5 w-5 text-gray-400')" />
                <div class="menu-item-info">
                  <h3 class="menu-item-title">{{ menu.label }}</h3>
                  <p class="menu-item-slug">{{ menu.slug }}</p>
                </div>
                <div class="menu-item-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="editMenu(menu)"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="deleteMenu(menu)"
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <!-- Submenus -->
              <div v-if="getSubmenusForMenu(menu._id) && getSubmenusForMenu(menu._id).length" class="submenu-list">
                <draggable
                  :list="getSubmenusForMenu(menu._id)"
                  @end="onSubmenuDragEnd(menu._id)"
                  item-key="_id"
                  handle=".drag-handle"
                  :animation="150"
                  ghost-class="ghost"
                >
                  <template #item="{ element: submenu }">
                    <div class="submenu-item">
                      <div class="submenu-item-header">
                        <input
                          type="checkbox"
                          :value="submenu._id"
                          :checked="selectedMenus.includes(menu._id)"
                          v-model="selectedMenus"
                          class="form-checkbox mr-4"
                        />
                        <div class="drag-handle">
                          <component :is="renderIcon('Bars3Icon', 'h-5 w-5 text-gray-400')" />
                        </div>
                        <component :is="renderIcon(submenu.icon, 'h-5 w-5 text-gray-400')" />
                        <div class="submenu-item-info">
                          <h3 class="submenu-item-title">{{ submenu.label }}</h3>
                          <p class="submenu-item-slug">{{ submenu.slug }}</p>
                        </div>
                        <div class="submenu-item-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="editMenu(submenu)"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="deleteMenu(submenu)"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- Create/Edit Menu Modal -->
      <Modal
        v-if="isCurrentState('creating') || isCurrentState('editing')"
        :title="isCurrentState('creating') ? 'Create Menu' : 'Edit Menu'"
        @close="raiseEvent('CANCEL')"
      >
        <form @submit.prevent="saveMenu">
          <div class="space-y-4">
            <div>
              <label class="form-label">Name</label>
              <input
                type="text"
                v-model="state.context.formData.name"
                class="form-input"
                required
              />
            </div>
            <div>
              <label class="form-label">Label</label>
              <input
                type="text"
                v-model="state.context.formData.label"
                class="form-input"
                required
              />
            </div>
            <div>
              <label class="form-label">Icon</label>
              <input
                type="text"
                v-model="state.context.formData.icon"
                class="form-input"
                required
              />
              <!-- <select
                v-model="state.context.formData.icon"
                class="form-input"
                required
              >
                <option value="">Select an icon...</option>
                <option value="HomeIcon">Home</option>
                <option value="DocumentIcon">Document</option>
                <option value="ShieldCheckIcon">Shield</option>
                <option value="LockClosedIcon">Lock</option>
                <option value="UsersIcon">Users</option>
              </select> -->
            </div>
            <div>
              <label class="form-label">Parent Menu</label>
              <select
                v-model="state.context.formData.parent"
                class="form-input"
              >
                <option value="">None</option>
                <option 
                  v-for="menu in availableParentMenus" 
                  :key="menu._id" 
                  :value="menu._id"
                >
                  {{ menu.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="form-label">Page Element</label>
              <select
                v-model="state.context.formData.pageElement"
                class="form-input"
                :disabled="isLoadingPageElements"
              >
                <option value="">None</option>
                <option 
                  v-if="isLoadingPageElements"
                  disabled
                >
                  Loading page elements...
                </option>
                <option 
                  v-else
                  v-for="element in availablePageElements" 
                  :key="element._id" 
                  :value="element._id"
                >
                  {{ element.name }}
                </option>
              </select>
            </div>
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
import { ref, computed, onMounted, watch } from 'vue';
import draggable from 'vuedraggable';
import Button from '../../../components/ui/button.vue';
import Modal from '../../../components/ui/modal.vue';
import Spinner from '../../../components/ui/spinner.vue';
import { useMenuManagement } from '../../../composables/useMenuManagement';
import { useMenuStore } from '@/store/menu.store';
import { usePageElementStore } from '@/store/page-element.store';
import type { Menu } from '@/store/models/menu/menu.types';
import type { MenuFormData } from '@/store/models/menu/menu.types';
import type { PageElement } from '@/store/models/page/page-element.types';
import { useIcon } from '@/composables/useIcon';

// Use composables
const {
  state,
  searchQuery,
  selectedMenus,
  submenus,
  showBulkActions,
  filteredMenus,
  isCurrentState,
  raiseEvent,
  editMenu,
  deleteMenu,
  confirmDelete,
  saveMenu, 
  bulkDelete,
} = useMenuManagement();

const { renderIcon } = useIcon();

const menuStore = useMenuStore();
const pageElementStore = usePageElementStore();

// Store submenus in a reactive map
const submenusMap = ref(new Map<string, Menu[]>());

// Computed
const selectAll = computed({
  get: () => selectedMenus.value.length === filteredMenus.value.length,
  set: (value) => {
    selectedMenus.value = value ? filteredMenus.value.map((menu: Menu) => menu._id) : [];
  }
});

const rootMenus = computed(() => menuStore.getRootMenus);

const isFormValid = computed(() => {
  const formData = state.value.context.formData;
  console.log('isFormValid');
  console.log(formData);
  return formData.name && formData.label && formData.icon;
});

const availableRoles = computed(() => menuStore.availableRoles);

// Function to get submenus for a specific menu
const getSubmenusForMenu = (parentId: string) => {
  if (!submenusMap.value.has(parentId)) {
    const submenus = Object.values(menuStore.menusCache).filter(
      menu => menu.parent?._id === parentId
    );
    submenusMap.value.set(parentId, submenus);
  }
  return submenusMap.value.get(parentId) || [];
};

const availableParentMenus = computed(() => {
  const formData = state.value.context.formData as MenuFormData & { _id?: string };
  console.log('availableParentMenus');
  console.log(formData);
  console.log(menuStore.menusCache);
  return Object.values(menuStore.menusCache).filter(
    menu => menu._id !== formData._id
  );
});

const availablePageElements = computed(() => {
  return pageElementStore.pageElements;
});

// Methods
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedMenus.value = filteredMenus.value.map((menu: Menu) => menu._id);
  } else {
    selectedMenus.value = [];
  }
};

const onDragEnd = async () => {
  try {
    const menuIds = rootMenus.value.map(menu => menu._id);
    await menuStore.reorderMenus(menuIds);
  } catch (error) {
    console.error('Failed to reorder menus:', error);
  }
};

const onSubmenuDragEnd = async (parentId: string) => {
  try {
    const submenus = getSubmenusForMenu(parentId);
    const menuIds = submenus.map(menu => menu._id);
    await menuStore.reorderMenus(menuIds);
  } catch (error) {
    console.error('Failed to reorder submenus:', error);
  }
};

// Update submenus when menu store changes
const updateSubmenus = () => {
  submenusMap.value.clear();
  rootMenus.value.forEach(menu => {
    getSubmenusForMenu(menu._id);
  });
};

// Watch for changes in the menu store
watch(() => menuStore.menusCache, () => {
  updateSubmenus();
}, { deep: true });

// Fetch menus on mount
onMounted(async () => {
  try {
    await Promise.all([
      raiseEvent('FETCH'),
      pageElementStore.fetchPageElements()
    ]);
  } catch (error) {
    console.error('Failed to load data:', error);
  }
});

// Add loading state for page elements
const isLoadingPageElements = computed(() => pageElementStore.isLoading);
</script>

<style scoped>
.management-view {
  @apply p-6;
}

.management-container {
  @apply max-w-7xl mx-auto;
}

.management-header {
  @apply flex justify-between items-center mb-6;
}

.management-title {
  @apply text-2xl font-semibold text-gray-900;
}

.management-actions {
  @apply flex items-center space-x-4;
}

.management-search {
  @apply w-64;
}

.management-content {
  @apply bg-white rounded-lg shadow;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.management-list-header {
  @apply flex justify-between items-center;
}

.management-list-actions {
  @apply flex items-center space-x-4;
}

.menu-item {
  @apply border-b border-gray-200 last:border-b-0;
}

.menu-item-header {
  @apply flex items-center px-6 py-4;
}

.drag-handle {
  @apply cursor-move mr-4;
}

.menu-item-info {
  @apply flex-1;
}

.menu-item-title {
  @apply text-sm font-medium text-gray-900;
}

.menu-item-slug {
  @apply text-sm text-gray-500;
}

.menu-item-actions {
  @apply flex items-center space-x-2;
}

.submenu-list {
  @apply pl-12 bg-gray-50;
}

.submenu-item {
  @apply border-b border-gray-200 last:border-b-0;
}

.submenu-item-header {
  @apply flex items-center px-6 py-3;
}

.submenu-item-info {
  @apply flex-1;
}

.submenu-item-title {
  @apply text-sm font-medium text-gray-900;
}

.submenu-item-slug {
  @apply text-sm text-gray-500;
}

.submenu-item-actions {
  @apply flex items-center space-x-2;
}

.ghost {
  @apply opacity-50 bg-gray-100;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-input {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm;
}

.form-checkbox {
  @apply h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500;
}
</style>
