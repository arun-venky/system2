<template>
  <div class="management-view">
    <div class="management-container">
      <!-- Header -->
      <div class="management-header">
        <h1 class="management-title">Roles</h1>
        <div class="management-actions">
          <Button
            class="whitespace-nowrap"
            variant="primary"
            @click="raiseEvent('CREATE')"
            :disabled="isCurrentState('creating')"
          >
            Create Role
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

      <!-- Role List -->
      <div v-else class="management-content">
        <ul class="management-list">
          <li v-for="role in state.context.roles" :key="role._id" class="management-list-item">
            <div class="management-list-header">
              <div class="management-list-info">
                <component :is="renderIcon('ShieldCheckIcon', 'management-list-icon')" /> 
                <div class="management-list-details">
                  <h2 class="management-list-title">{{ role.name }}</h2>
                  <p class="management-list-subtitle">
                    {{ role.permissions.length }} permissions
                  </p>
                </div>
              </div>
              <div class="management-list-actions">
                <Button
                  variant="ghost"
                  @click="openPermissionsModal(role)"
                >
                  Permissions
                </Button>
                <Button
                  variant="ghost"
                  @click="openUsersModal(role)"
                >
                  Users
                </Button>
                <Button
                  variant="ghost"
                  @click="duplicateRole(role)"
                >
                  Duplicate
                </Button>
                <Button
                  variant="ghost"
                  @click="editRole(role)"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  @click="deleteRole(role)"
                >
                  Delete
                </Button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Create/Edit Role Modal -->
      <Modal
        v-if="isCurrentState('creating') || isCurrentState('editing')"
        :title="isCurrentState('creating') ? 'Create Role' : 'Edit Role'"
        @close="raiseEvent('CANCEL')"
      >
        <form @submit.prevent="saveRole">
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
              <label class="form-label">Description</label>
              <textarea
                v-model="state.context.formData.description"
                class="form-input w-full min-h-[100px] resize-y rounded-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter role description..."
                rows="3"
              ></textarea>
              <p class="mt-1 text-sm text-gray-500">Provide a clear description of this role's purpose and responsibilities.</p>
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

      <!-- Permissions Modal -->
      <Modal
        v-if="showPermissionsModal"
        title="Role Permissions"
        @close="showPermissionsModal = false"
      >
        <div class="space-y-4">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center space-x-2">
              <select
                v-model="selectedResource"
                class="form-input text-sm w-48"
              >
                <option value="">Select resource...</option>
                <option 
                  v-for="resource in availableResources" 
                  :key="resource.value" 
                  :value="resource.value"
                  :disabled="selectedRolePermissions.some((p) => p.resource === resource.value)"
                >
                  {{ resource.name }}
                </option>
              </select>
              <Button
                variant="secondary"
                size="sm"
                @click="addResource"
                :disabled="!selectedResource"
              >
                Add Resource
              </Button>
            </div>
          </div>
          <div class="max-h-[300px] overflow-y-auto pr-2 space-y-4 mt-2 custom-scrollbar">
            <div v-if="!selectedRolePermissions?.length" class="text-center py-4 text-gray-500">
              No resources added yet. Select a resource to manage its permissions.
            </div>
            <div v-else v-for="(permission, index) in selectedRolePermissions" :key="index" 
              class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex items-start justify-between">
                <div class="flex items-center space-x-3">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">
                      {{ availableResources.find(r => r.value === permission.resource)?.name || permission.resource }}
                    </h3>
                    <p class="text-xs text-gray-500 mt-1">Manage permissions for this resource</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="removePermission(index)"
                >
                  Remove
                </Button>
              </div>
              <div class="mt-3">
                <div class="flex items-center space-x-2">
                  <select
                    v-model="permission.newAction"
                    class="form-input text-sm w-32"
                  >
                    <option value="">Select action...</option>
                    <option 
                      v-for="action in validActions" 
                      :key="action.value" 
                      :value="action.value"
                      :disabled="permission.actions.includes(action.value)"
                    >
                      {{ action.label }}
                    </option>
                  </select>
                  <Button
                    variant="secondary"
                    size="sm"
                    @click="addAction(permission, index)"
                    :disabled="!permission.newAction"
                  >
                    Add Action
                  </Button>
                </div>
                <div class="mt-3">
                  <div class="flex flex-wrap gap-2">
                    <Badge
                      v-for="action in permission.actions"
                      :key="action"
                      variant="info"
                      class="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 group capitalize"
                    >
                      {{ action }}
                      <button
                        @click="removeAction(permission, action, index)"
                        class="ml-1.5 text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove action"
                      >
                        ×
                      </button>
                    </Badge>
                    <span v-if="permission.actions.length === 0" class="text-sm text-gray-500 italic">
                      No actions added yet
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="ghost"
              @click="showPermissionsModal = false"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              @click="savePermissions"
            >
              Save Permissions
            </Button>
          </div>
        </div>
      </Modal>

      <!-- Users Modal -->
      <Modal
        v-if="showUsersModal"
        title="Role Users"
        @close="showUsersModal = false"
      >
        <div class="space-y-6">
          <!-- Add Users Section -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium text-gray-900">Add Users</h3>
            <div class="flex space-x-2">
              <input
                type="text"
                v-model="userSearchQuery"
                placeholder="Search users..."
                class="form-input flex-1"
              />
              <Button
                variant="primary"
                @click="assignUsers"
                :disabled="!selectedUsers.length"
              >
                Add Selected
              </Button>
            </div>
            <div class="max-h-[200px] overflow-y-auto space-y-2 custom-scrollbar">
              <div v-for="user in filteredUsers" :key="user._id" class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                <div class="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    :value="user._id"
                    v-model="selectedUsers"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ user.username }}</p>
                    <p class="text-xs text-gray-500">{{ user.email }}</p>
                  </div>
                </div>
              </div>
              <div v-if="!filteredUsers.length" class="text-center py-4 text-gray-500">
                No users found
              </div>
            </div>
          </div>

          <!-- Current Users Section -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium text-gray-900">Current Users</h3>
            <div class="max-h-[200px] overflow-y-auto space-y-2 custom-scrollbar">
              <div v-for="user in users" :key="user._id" class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                <div class="flex items-center space-x-3">
                  <component :is="renderIcon('UserIcon', 'h-5 w-5 text-gray-400')" /> 
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ user.username }}</p>
                    <p class="text-xs text-gray-500">{{ user.email }}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="removeUserFromRole(user)"
                  class="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
              <div v-if="!users.length" class="text-center py-4 text-gray-500">
                No users assigned to this role
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="ghost"
              @click="showUsersModal = false"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from '../../../components/ui/button.vue';
import Modal from '../../../components/ui/modal.vue';
import Spinner from '../../../components/ui/spinner.vue';
import Badge from '../../../components/ui/badge.vue';
import { useRoleManagement } from '../../../composables/useRoleManagement';
import { useRoleStore } from '../../../store/role.store';
import { useIcon } from '@/composables/useIcon';

// Predefined actions
const validActions = [
  { value: 'read', label: 'Read' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' }
];

const { renderIcon } = useIcon();
const roleStore = useRoleStore();
const availableResources = computed(() => roleStore.availableResources);

const {
  state,
  showPermissionsModal,
  showUsersModal,
  selectedRole,
  selectedRolePermissions,
  userSearchQuery,
  selectedUsers,
  users,
  filteredUsers,
  isCurrentState,
  raiseEvent,
  openPermissionsModal,
  openUsersModal,
  assignUsers,
  removeUsers,
  duplicateRole,
  editRole,
  deleteRole,
  confirmDelete,
  addPermission,
  removePermission,
  saveRole,
  removeUserFromRole
} = useRoleManagement();

// Add new refs
const selectedResource = ref('');

const addAction = (permission, index) => {
  if (permission.newAction?.trim()) {
    // Check if action already exists
    if (permission.actions.includes(permission.newAction)) {
      // You could add a toast notification here if you have one
      console.log('Action already exists');
      permission.newAction = '';
      return;
    }
    raiseEvent('ADD_ACTION', {
      permissionIndex: index,
      action: permission.newAction.trim()
    });
    permission.newAction = '';
  }
};

const removeAction = (permission, action, index) => {
  raiseEvent('REMOVE_ACTION', {
    permissionIndex: index,
    action
  });
};

const addResource = () => {
  if (selectedResource.value) {
    raiseEvent('ADD_RESOURCE', {
      resource: selectedResource.value
    });
    selectedResource.value = '';
  }
};

const removeResource = (index: number) => {
  raiseEvent('REMOVE_RESOURCE', {
    resourceIndex: index
  });
};

onMounted(async () => {
  await roleStore.fetchAvailableResources();
  raiseEvent('FETCH');
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style> 