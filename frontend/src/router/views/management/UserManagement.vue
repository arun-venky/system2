<template>
  <div class="management-view">
    <div class="management-container">
      <!-- Header -->
      <div class="management-header">
        <h1 class="management-title">Users</h1>
        <div class="management-actions">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search users..."
            class="form-input management-search"
          />
          <Button
            class="whitespace-nowrap"
            variant="primary"
            @click="raiseEvent('CREATE')"
            :disabled="isCurrentState('creating')"
          >
            Create User
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

      <!-- User List -->
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
            <div v-if="selectedUsers.length" class="management-list-actions">
              <Button
                variant="danger"
                @click="raiseEvent('BULK_DELETE')"
              >
                Delete
              </Button>
              <Button
                variant="primary"
                @click="showBulkRolesModal = true"
              >
                Assign Role
              </Button>
            </div>
          </div>
        </div>
        <ul class="management-list">
          <li v-for="user in filteredUsers" :key="user._id" class="management-list-item">
            <div class="management-list-header">
              <div class="management-list-info">
                <input
                  type="checkbox"
                  :value="user._id"
                  v-model="selectedUsers"
                  class="form-checkbox mr-4"
                />
                <component :is="renderIcon('UserIcon', 'management-list-icon')" /> 
                <div class="management-list-details">
                  <h2 class="management-list-title">{{ user.username }}</h2>
                  <p class="management-list-subtitle">{{ user.email }}</p>
                  <div class="management-list-badges">
                    <Badge
                      :variant="user.isVerified ? 'success' : 'warning'"
                    >
                      {{ user.isVerified ? 'Verified' : 'Unverified' }}
                    </Badge>
                    <Badge
                      v-if="user.twoFactorEnabled"
                      variant="info"
                    >
                      2FA Enabled
                    </Badge>
                  </div>
                </div>
              </div>
              <div class="management-list-actions">
                <Button
                  variant="ghost"
                  @click="openAssignRoleModal(user)"
                >
                  Role
                </Button>
                <Button
                  variant="ghost"
                  @click="editUser(user)"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  @click="deleteUser(user)"
                >
                  Delete
                </Button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Create/Edit User Modal -->
      <Modal
        v-if="isCurrentState('creating') || isCurrentState('editing')"
        :title="isCurrentState('creating') ? 'Create User' : 'Edit User'"
        @close="raiseEvent('CANCEL')"
      >
        <form @submit.prevent="saveUser">
          <div class="space-y-4">
            <div>
              <label class="form-label">Username</label>
              <input
                type="text"
                v-model="state.context.formData.username"
                class="form-input"
                required
              />
            </div>
            <div>
              <label class="form-label">Email</label>
              <input
                type="email"
                v-model="state.context.formData.email"
                class="form-input"
                required
              />
            </div>
            <div v-if="isCurrentState('creating')">
              <label class="form-label">Password</label>
              <input
                type="password"
                v-model="state.context.formData.password"
                class="form-input"
                required
              />
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

      <!-- Bulk Roles Modal -->
      <Modal
        v-if="showBulkRolesModal"
        title="Assign Roles"
        @close="showBulkRolesModal = false"
      >
        <div class="space-y-4">
          <div v-for="role in roles" :key="role._id" class="flex items-center space-x-2">
            <input
              type="checkbox"
              :value="role._id"
              v-model="selectedBulkRoles"
              class="form-checkbox"
            />
            <span class="text-sm text-gray-700">{{ role.name }}</span>
          </div>
          <div class="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="ghost"
              @click="showBulkRolesModal = false"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              @click="assignBulkRoles"
            >
              Assign Roles
            </Button>
          </div>
        </div>
      </Modal>

      <!-- Assign Role Modal -->
      <Modal
        v-if="showAssignRoleModal"
        title="Role"
        @close="closeAssignRoleModal"
      >
        <div class="space-y-4">
          <div v-if="!roles || roles.length === 0" class="text-center py-4 text-gray-500">
            No roles available
          </div>
          <div v-else class="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
            <div v-for="role in roles" :key="role._id" class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
              <div class="flex items-center space-x-3">
                <input
                  type="radio"
                  :value="role._id"
                  v-model="selectedRole"
                  class="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ role.name }}</p>
                  <p class="text-xs text-gray-500">{{ role.description }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="ghost"
              @click="closeAssignRoleModal"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              @click="assignRole"
              :disabled="!selectedRole"
            >
              Assign Role
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
import { useUserManagement } from '../../../composables/useUserManagement';
import { useUserPermissions } from '../../../composables/useUserPermissions';
import { useUserSecurity } from '../../../composables/useUserSecurity';
import { useRoleStore } from '../../../store/role.store';
import { useIcon } from '../../../composables/useIcon';

// Use composables
const { renderIcon } = useIcon();

const {
  state,
  searchQuery,
  selectedUsers,
  showBulkActions,
  filteredUsers,
  isCurrentState,
  raiseEvent,
  editUser,
  deleteUser,
  confirmDelete,
  saveUser,
} = useUserManagement();

const {
  showPermissionsModal,
  selectedUser: selectedUserForPermissions,
  userPermissions,
} = useUserPermissions();

const {
  verifyEmail,
} = useUserSecurity();

const roleStore = useRoleStore();

// Local state
const showBulkRolesModal = ref(false);
const selectedBulkRoles = ref<string[]>([]);
const showAssignRoleModal = ref(false);
const selectedRole = ref('');
const selectedUserForRole = ref(null);
const roles = ref([]);

// Computed
const selectAll = computed({
  get: () => selectedUsers.value.length === filteredUsers.value.length,
  set: (value) => {
    selectedUsers.value = value ? filteredUsers.value.map(user => user._id) : [];
  }
});

// Methods
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedUsers.value = filteredUsers.value.map(user => user._id);
  } else {
    selectedUsers.value = [];
  }
};

const openAssignRoleModal = async (user) => {
  try {
    selectedUserForRole.value = user;
    selectedRole.value = user.role?._id || '';
    const fetchedRoles = await roleStore.fetchRoles();
    roles.value = fetchedRoles;
    showAssignRoleModal.value = true;
  } catch (error) {
    console.error('Error opening assign role modal:', error);
  }
};

const closeAssignRoleModal = () => {
  showAssignRoleModal.value = false;
  selectedRole.value = '';
  selectedUserForRole.value = null;
};

const assignRole = async () => {
  if (!selectedUserForRole.value || !selectedRole.value) return;
  
  try {
    await useUserManagement().updateUser(selectedUserForRole.value._id, {
      role: selectedRole.value
    });
    closeAssignRoleModal();
    raiseEvent('FETCH');
  } catch (error) {
    console.error('Failed to assign role:', error);
  }
};

const assignBulkRoles = async () => {
  if (!selectedUsers.value.length || !selectedBulkRoles.value.length) return;
  try {
    await useUserRoles().bulkAssignRoles(selectedUsers.value, selectedBulkRoles.value);
    showBulkRolesModal.value = false;
    selectedBulkRoles.value = [];
    selectedUsers.value = [];
    raiseEvent('FETCH');
  } catch (error) {
    console.error('Failed to assign roles:', error);
  }
};

// Fetch users on mount
onMounted(() => {
  raiseEvent('FETCH');
});
</script> 