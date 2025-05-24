import { ref } from 'vue';
import type { User } from '@/store/models';
import { useUserStore } from '../store/user.store';

export function useUserRoles() {
  const userStore = useUserStore();
  const showRolesModal = ref(false);
  const selectedUser = ref<User | null>(null);
  const userRoles = ref<any[]>([]);
  const selectedRoles = ref<string[]>([]);

  const openRolesModal = async (user: User) => {
    selectedUser.value = user;
    try {
      const roles = await userStore.getUserRoles(user._id);
      userRoles.value = roles;
      showRolesModal.value = true;
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
    }
  };

  const assignRoles = async (roleIds: string[]) => {
    if (!selectedUser.value) return;
    try {
      await userStore.assignRoles(selectedUser.value._id, roleIds);
      // Refresh user roles
      const roles = await userStore.getUserRoles(selectedUser.value._id);
      userRoles.value = roles;
      selectedRoles.value = [];
      showRolesModal.value = false;
    } catch (error) {
      console.error('Failed to assign roles:', error);
    }
  };

  const removeRole = async (roleId: string) => {
    if (!selectedUser.value) return;
    try {
      await userStore.removeRoles(selectedUser.value._id, [roleId]);
      // Refresh user roles
      const roles = await userStore.getUserRoles(selectedUser.value._id);
      userRoles.value = roles;
    } catch (error) {
      console.error('Failed to remove role:', error);
    }
  };

  const bulkAssignRoles = async (userIds: string[], roleIds: string[]) => {
    try {
      await userStore.bulkAssignRoles(userIds, roleIds);
      return true;
    } catch (error) {
      console.error('Failed to assign roles:', error);
      return false;
    }
  };

  return {
    showRolesModal,
    selectedUser,
    userRoles,
    selectedRoles,
    openRolesModal,
    assignRoles,
    removeRole,
    bulkAssignRoles
  };
} 