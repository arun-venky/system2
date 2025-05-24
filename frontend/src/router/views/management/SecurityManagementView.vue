<template>
  <div class="management-view">
    <div class="management-container">
      <!-- Header -->
      <div class="management-header">
        <h1 class="management-title">Security Management</h1>
        <div class="management-actions">
          <Button
            variant="primary"
            @click="openSettingsModal"
          >
            Security Settings
          </Button>
          <Button
            variant="primary"
            @click="openAuditLogModal"
          >
            Audit Logs
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

      <!-- Security Overview -->
      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Security Settings Card -->
        <div class="management-content">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Security Settings</h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Password Policy</span>
                <Badge :variant="state.context.settings?.passwordPolicy ? 'success' : 'warning'">
                  {{ state.context.settings?.passwordPolicy ? 'Enabled' : 'Disabled' }}
                </Badge>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">2FA</span>
                <Badge :variant="state.context.settings?.twoFactorAuth ? 'success' : 'warning'">
                  {{ state.context.settings?.twoFactorAuth ? 'Enabled' : 'Disabled' }}
                </Badge>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Session Timeout</span>
                <span class="text-sm text-gray-900">{{ state.context.settings?.sessionTimeout }} minutes</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <Button
              variant="ghost"
              @click="openSettingsModal"
            >
              Edit Settings
            </Button>
          </div>
        </div>

        <!-- Recent Activity Card -->
        <div class="management-content">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div v-for="log in state.context.recentLogs" :key="log._id" class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <UserIcon class="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p class="text-sm text-gray-900">{{ log.action }}</p>
                  <p class="text-xs text-gray-500">
                    {{ formatDate(log.timestamp) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <Button
              variant="ghost"
              @click="openAuditLogModal"
            >
              View All Logs
            </Button>
          </div>
        </div>

        <!-- Security Status Card -->
        <div class="management-content">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Security Status</h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Last Security Scan</span>
                <span class="text-sm text-gray-900">
                  {{ formatDate(state.context.settings?.lastSecurityScan) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Failed Login Attempts</span>
                <span class="text-sm text-gray-900">{{ state.context.settings?.failedLoginAttempts }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Active Sessions</span>
                <span class="text-sm text-gray-900">{{ state.context.settings?.activeSessions }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Settings Modal -->
      <Modal
        v-if="showSettingsModal"
        title="Security Settings"
        @close="showSettingsModal = false"
      >
        <form @submit.prevent="updateSecuritySettings(selectedSettings)">
          <div class="space-y-4">
            <div>
              <label class="form-label">Password Policy</label>
              <div class="space-y-2">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="selectedSettings.passwordPolicy"
                    class="form-checkbox"
                  />
                  <span class="ml-2 text-sm text-gray-700">Enable password policy</span>
                </div>
                <div v-if="selectedSettings.passwordPolicy" class="ml-6 space-y-2">
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="selectedSettings.requireUppercase"
                      class="form-checkbox"
                    />
                    <span class="ml-2 text-sm text-gray-700">Require uppercase letters</span>
                  </div>
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="selectedSettings.requireNumbers"
                      class="form-checkbox"
                    />
                    <span class="ml-2 text-sm text-gray-700">Require numbers</span>
                  </div>
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="selectedSettings.requireSpecialChars"
                      class="form-checkbox"
                    />
                    <span class="ml-2 text-sm text-gray-700">Require special characters</span>
                  </div>
                  <div>
                    <label class="form-label">Minimum password length</label>
                    <input
                      type="number"
                      v-model="selectedSettings.minPasswordLength"
                      class="form-input"
                      min="8"
                      max="32"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="form-label">Two-Factor Authentication</label>
              <div class="space-y-2">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="selectedSettings.twoFactorAuth"
                    class="form-checkbox"
                  />
                  <span class="ml-2 text-sm text-gray-700">Enable 2FA</span>
                </div>
                <div v-if="selectedSettings.twoFactorAuth" class="ml-6">
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="selectedSettings.require2FA"
                      class="form-checkbox"
                    />
                    <span class="ml-2 text-sm text-gray-700">Require 2FA for all users</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="form-label">Session Management</label>
              <div class="space-y-2">
                <div>
                  <label class="form-label">Session timeout (minutes)</label>
                  <input
                    type="number"
                    v-model="selectedSettings.sessionTimeout"
                    class="form-input"
                    min="5"
                    max="1440"
                  />
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="selectedSettings.enableSessionLock"
                    class="form-checkbox"
                  />
                  <span class="ml-2 text-sm text-gray-700">Enable session lock on inactivity</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="ghost"
              @click="showSettingsModal = false"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Save Settings
            </Button>
          </div>
        </form>
      </Modal>

      <!-- Audit Logs Modal -->
      <Modal
        v-if="showAuditLogModal"
        title="Audit Logs"
        @close="handleCloseAuditLogModal"
        width="w-[90vw] max-w-[1000px]"
      >
        <div class="space-y-4">
          <!-- Filters -->
          <div class="management-content">
            <div class="card-body">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="form-label">Start Date</label>
                  <input 
                    type="date" 
                    v-model="auditLogFilters.startDate"
                    class="form-input"
                  />
                </div>
                <div>
                  <label class="form-label">End Date</label>
                  <input 
                    type="date" 
                    v-model="auditLogFilters.endDate"
                    class="form-input"
                  />
                </div>
                <div>
                  <label class="form-label">Action</label>
                  <select 
                    v-model="auditLogFilters.action"
                    class="form-input"
                  >
                    <option value="">All Actions</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">User ID</label>
                  <input 
                    type="text" 
                    v-model="auditLogFilters.userId"
                    class="form-input"
                    placeholder="Filter by user ID"
                  />
                </div>
                <div>
                  <label class="form-label">IP Address</label>
                  <input 
                    type="text" 
                    v-model="auditLogFilters.ipAddress"
                    class="form-input"
                    placeholder="Filter by IP address"
                  />
                </div>
                <div class="flex items-end space-x-2">
                  <Button
                    variant="primary"
                    class="flex-1 whitespace-nowrap"
                    @click="applyAuditLogFilters"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="ghost"
                    class="whitespace-nowrap"
                    @click="clearAuditLogFilters"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Audit Logs Table -->
          <div class="management-content">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-if="securityStore.isLoading" class="hover:bg-gray-50">
                    <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                      <div class="flex justify-center items-center">
                        <Spinner size="sm" class="mr-2" />
                        Loading logs...
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="auditLogs.length === 0" class="hover:bg-gray-50">
                    <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                      No logs found
                    </td>
                  </tr>
                  <tr v-for="log in auditLogs" :key="log._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(log.timestamp) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ log.userId }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <Badge :variant="getActionVariant(log.action)">
                        {{ log.action }}
                      </Badge>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ log.resource }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                      {{ log.details }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="card-footer flex justify-between items-center">
              <Button
                variant="ghost"
                class="whitespace-nowrap"
                @click="loadMoreLogs"
                :disabled="securityStore.isLoading"
              >
                <Spinner v-if="securityStore.isLoading" size="sm" class="mr-2" />
                Load More
              </Button>
              <Button
                variant="secondary"
                class="whitespace-nowrap"
                @click="exportAuditLogs"
                :disabled="securityStore.isLoading"
              >
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { UserIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import Button from '../../../components/ui/button.vue';
import Modal from '../../../components/ui/modal.vue';
import Spinner from '../../../components/ui/spinner.vue';
import Badge from '../../../components/ui/badge.vue';
import { useSecurityManagement } from '../../../composables/useSecurityManagement';
import { useSecurityStore } from '@/store/security.store';
import { AuditLogFilters } from '@/store/models';
import { format } from 'date-fns';

const securityStore = useSecurityStore();
const {
  state,
  showSettingsModal,
  showAuditLogModal,
  selectedSettings,
  auditLogs,
  auditLogFilters,
  isCurrentState,
  raiseEvent,
  openSettingsModal,
  openAuditLogModal,
  updateSecuritySettings,
  applyAuditLogFilters,
  clearAuditLogFilters,
  loadMoreLogs,
  exportAuditLogs
} = useSecurityManagement();

const formatDate = (date: string | undefined | null) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM d, yyyy HH:mm:ss');
  } catch (error) {
    console.error('Invalid date:', date);
    return 'Invalid Date';
  }
};

const getActionVariant = (action: string) => {
  const variants: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
    login: 'success',
    logout: 'info',
    create: 'success',
    update: 'info',
    delete: 'danger'
  };
  return variants[action] || 'info';
};

const handleCloseAuditLogModal = () => {
  showAuditLogModal.value = false;
  clearAuditLogFilters();
};

onMounted(async () => {
  try {
    await securityStore.getSecuritySettings();
  } catch (error) {
    console.error('Failed to load security settings:', error);
  }
});
</script> 