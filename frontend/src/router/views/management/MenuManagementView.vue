<template>
  <div class="management-view">
    <div class="management-container">
      <!-- Header -->
      <div class="management-header">
        <h1 class="management-title">Menu Management</h1>
        <div class="management-actions">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search menus..."
            class="form-input management-search"
          />
          <Button
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
            <div v-if="selectedMenus.length" class="management-list-actions">
              <Button
                variant="danger"
                @click="raiseEvent('BULK_DELETE')"
              >
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
        <ul class="management-list">
          <li v-for="menu in filteredMenus" :key="menu._id" class="management-list-item">
            <div class="management-list-header">
              <div class="management-list-info">
                <input
                  type="checkbox"
                  :value="menu._id"
                  v-model="selectedMenus"
                  class="form-checkbox mr-4"
                />
                <Bars3Icon class="management-list-icon" />
                <div class="management-list-details">
                  <h2 class="management-list-title">{{ menu.name }}</h2>
                  <p class="management-list-subtitle">{{ menu.location }}</p>
                  <div class="management-list-badges">
                    <Badge
                      :variant="menu.isActive ? 'success' : 'warning'"
                    >
                      {{ menu.isActive ? 'Active' : 'Inactive' }}
                    </Badge>
                    <Badge
                      v-if="menu.items.length"
                      variant="info"
                    >
                      {{ menu.items.length }} Items
                    </Badge>
                  </div>
                </div>
              </div>
              <div class="management-list-actions">
                <Button
                  variant="ghost"
                  @click="manageItems(menu)"
                >
                  Items
                </Button>
                <Button
                  variant="ghost"
                  @click="editMenu(menu)"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  @click="deleteMenu(menu)"
                >
                  Delete
                </Button>
              </div>
            </div>
          </li>
        </ul>
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
              <label class="form-label">Location</label>
              <input
                type="text"
                v-model="state.context.formData.location"
                class="form-input"
                required
              />
            </div>
            <div class="flex items-center space-x-2">
              <input
                type="checkbox"
                v-model="state.context.formData.isActive"
                class="form-checkbox"
              />
              <label class="form-label">Active</label>
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
            >
              {{ isCurrentState('creating') ? 'Create' : 'Save' }}
            </Button>
          </div>
        </form>
      </Modal>

      <!-- Menu Items Modal -->
      <Modal
        v-if="showItemsModal"
        title="Menu Items"
        @close="showItemsModal = false"
      >
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Items</h3>
            <Button
              variant="primary"
              @click="addMenuItem"
            >
              Add Item
            </Button>
          </div>
          <div class="space-y-2">
            <div v-for="(item, index) in currentMenuItems" :key="index" class="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              <input
                type="text"
                v-model="item.label"
                class="form-input flex-1"
                placeholder="Label"
              />
              <input
                type="text"
                v-model="item.url"
                class="form-input flex-1"
                placeholder="URL"
              />
              <Button
                variant="ghost"
                @click="removeMenuItem(index)"
              >
                Remove
              </Button>
            </div>
          </div>
          <div class="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="ghost"
              @click="showItemsModal = false"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              @click="saveMenuItems"
            >
              Save Items
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ListBulletIcon, ExclamationCircleIcon, Bars3Icon } from '@heroicons/vue/24/outline';
import Button from '../../../components/ui/button.vue';
import Modal from '../../../components/ui/modal.vue';
import Spinner from '../../../components/ui/spinner.vue';
import Badge from '../../../components/ui/badge.vue';
import { useMenuManagement } from '../../../composables/useMenuManagement';
import { useMenuItems } from '../../../composables/useMenuItems';

// Use composables
const {
  state,
  searchQuery,
  selectedMenus,
  showBulkActions,
  filteredMenus,
  isCurrentState,
  raiseEvent,
  editMenu,
  deleteMenu,
  confirmDelete,
  saveMenu,
  bulkDelete
} = useMenuManagement();

const {
  showItemsModal,
  selectedMenu,
  menuItems,
  editingItem,
  openItemsModal,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderItems
} = useMenuItems();

// Computed
const selectAll = computed({
  get: () => selectedMenus.value.length === filteredMenus.value.length,
  set: (value) => {
    selectedMenus.value = value ? filteredMenus.value.map((menu: { _id: any; }) => menu._id) : [];
  }
});

// Methods
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedMenus.value = filteredMenus.value.map((menu: { _id: any; }) => menu._id);
  } else {
    selectedMenus.value = [];
  }
};

const saveMenuItem = async () => {
  if (!editingItem.value) return;
  
  let success;
  if (editingItem.value._id) {
    success = await updateMenuItem(editingItem.value._id, editingItem.value);
  } else {
    success = await addMenuItem(editingItem.value);
  }

  if (success) {
    editingItem.value = null;
  }
};

// Fetch menus on mount
onMounted(() => {
  raiseEvent('FETCH');
});
</script>