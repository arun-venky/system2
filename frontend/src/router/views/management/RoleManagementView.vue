<template>
  <div class="management-view">
    <div class="management-container">
      <!-- Header -->
      <div class="management-header">
        <h1 class="management-title">Role Management</h1>
        <div class="management-actions">
          <Button
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

      <!-- Role List -->
      <div v-else class="management-content">
        <ul class="management-list">
          <li v-for="role in state.context.roles" :key="role._id" class="management-list-item">
            <div class="management-list-header">
              <div class="management-list-info">
                <ShieldCheckIcon class="management-list-icon" />
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
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>
            <div>
              <label class="form-label">Permissions</label>
              <div class="space-y-2">
                <div v-for="(permission, index) in state.context.formData.permissions" :key="index" class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    v-model="permission.enabled"
                    class="form-checkbox"
                  />
                  <span class="text-sm text-gray-700">{{ permission.name }}</span>
                </div>
              </div>
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
          <div v-for="(permission, index) in selectedRolePermissions" :key="index" class="flex items-center space-x-2">
            <span class="font-medium">{{ permission.resource }}</span>
            <div class="flex space-x-1">
              <Badge
                v-for="action in permission.actions"
                :key="action"
                variant="info"
              >
                {{ action }}
              </Badge>
            </div>
          </div>
        </div>
      </Modal>

      <!-- Users Modal -->
      <Modal
        v-if="showUsersModal"
        title="Role Users"
        @close="showUsersModal = false"
      >
        <div class="space-y-4">
          <div class="flex space-x-2">
            <input
              type="text"
              v-model="userSearchQuery"
              placeholder="Search users..."
              class="form-input"
            />
          </div>
          <div class="space-y-2">
            <div v-for="user in filteredUsers" :key="user._id" class="flex items-center justify-between">
              <div class="flex items-center">
                <UserIcon class="h-5 w-5 text-gray-400 mr-2" />
                <span>{{ user.username }}</span>
              </div>
              <Button
                variant="ghost"
                @click="removeUserFromRole(user)"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ShieldCheckIcon, ExclamationCircleIcon, UserIcon } from '@heroicons/vue/24/outline';
import Button from '../../../components/ui/button.vue';
import Modal from '../../../components/ui/modal.vue';
import Spinner from '../../../components/ui/spinner.vue';
import Badge from '../../../components/ui/badge.vue';
import { useRoleManagement } from '../../../composables/useRoleManagement';

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

// Fetch roles on mount
onMounted(() => {
  raiseEvent('FETCH');
});
</script> 